import type { ZodiosEndpointDefinition } from "@zodios/core";
import type {
    OpenAPIObject,
    OperationObject,
    ParameterObject,
    PathItemObject,
    RequestBodyObject,
    ResponseObject,
    SchemaObject,
} from "openapi3-ts";
import { isReferenceObject } from "openapi3-ts";
import { get } from "pastable/server";
import { match } from "ts-pattern";
import { sync } from "whence";

import type { CodeMeta, ConversionTypeContext } from "./CodeMeta";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import { getZodChainableDefault, getZodChainablePresence, getZodSchema } from "./openApiToZod";
import { getSchemaComplexity } from "./schema-complexity";
import type { TemplateContext } from "./template-context";
import { getRefFromName, normalizeString, pathToVariableName } from "./utils";

const voidSchema = "z.void()";

// eslint-disable-next-line sonarjs/cognitive-complexity
export const getZodiosEndpointDefinitionList = (doc: OpenAPIObject, options?: TemplateContext["options"]) => {
    const getSchemaByRef: ConversionTypeContext["getSchemaByRef"] = (ref: string) =>
        get(doc, ref.replace("#/", "").replace("#", "").replaceAll("/", "."));

    const endpoints = [];

    let isMainResponseStatus = (status: number) => status === 200;
    if (options?.isMainResponseStatus) {
        isMainResponseStatus =
            typeof options.isMainResponseStatus === "string"
                ? (status: number) => sync(options.isMainResponseStatus, { status })
                : options.isMainResponseStatus;
    }

    let isErrorStatus = (status: number) => !(status >= 200 && status < 300);
    if (options?.isErrorStatus) {
        isErrorStatus =
            typeof options.isErrorStatus === "string"
                ? (status: number) => sync(options.isErrorStatus, { status })
                : options.isErrorStatus;
    }

    let isMediaTypeAllowed = (mediaType: string) => mediaType === "application/json";
    if (options?.isMediaTypeAllowed) {
        isMediaTypeAllowed =
            typeof options.isMediaTypeAllowed === "string"
                ? (mediaType: string) => sync(options.isMediaTypeAllowed, { mediaType })
                : options.isMediaTypeAllowed;
    }

    const ctx: ConversionTypeContext = { getSchemaByRef, zodSchemaByName: {}, schemaByName: {} };
    const complexityThreshold = options?.complexityThreshold ?? 4;
    const getZodVarName = (input: CodeMeta, fallbackName?: string) => {
        const result = input.toString();

        // special value, inline everything (= no variable used)
        if (complexityThreshold === -1) {
            return input.ref ? ctx.zodSchemaByName[result]! : result;
        }

        if (result.startsWith("z.") && fallbackName) {
            // result is simple enough that it doesn't need to be assigned to a variable
            if (input.complexity < complexityThreshold) {
                return result;
            }

            const safeName = normalizeString(fallbackName);

            // if schema is already assigned to a variable, re-use that variable name
            if (ctx.schemaByName[result]) {
                return ctx.schemaByName[result]!;
            }

            // result is complex and would benefit from being re-used
            let formatedName = safeName;
            const isVarNameAlreadyUsed = Boolean(ctx.zodSchemaByName[formatedName]);
            if (isVarNameAlreadyUsed) {
                if (ctx.zodSchemaByName[formatedName] === safeName) {
                    return formatedName;
                } else {
                    formatedName += "__2";
                }
            }

            ctx.zodSchemaByName[formatedName] = result;
            ctx.schemaByName[result] = formatedName;
            return formatedName;
        }

        // result is a reference to another schema
        if (input.ref && ctx.zodSchemaByName[result]) {
            const complexity = getSchemaComplexity({ current: 0, schema: getSchemaByRef(input.ref) });

            // ref result is simple enough that it doesn't need to be assigned to a variable
            if (complexity < complexityThreshold) {
                return ctx.zodSchemaByName[result]!;
            }

            return result;
        }

        console.log({ ref: input.ref, fallbackName, result });
        throw new Error("Invalid ref: " + input.ref);
    };

    for (const path in doc.paths) {
        const pathItem = doc.paths[path] as PathItemObject;

        for (const method in pathItem) {
            const operation = pathItem[method as keyof PathItemObject] as OperationObject;

            if (options?.withDeprecatedEndpoints ? false : operation.deprecated) continue;

            const parameters = operation.parameters ?? [];
            const operationName = operation.operationId ?? method + pathToVariableName(path);
            const endpointDescription: EndpointDescriptionWithRefs = {
                method: method as EndpointDescriptionWithRefs["method"],
                path: path.replaceAll(pathParamRegex, ":$1"),
                alias: operationName,
                description: operation.description,
                requestFormat: "json",
                parameters: [],
                errors: [],
                response: "",
            };

            if (operation.requestBody) {
                const requestBody = operation.requestBody as RequestBodyObject;
                const mediaTypes = Object.keys(requestBody.content ?? {});
                const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);

                const bodySchema = matchingMediaType && requestBody.content?.[matchingMediaType]?.schema;
                if (bodySchema) {
                    endpointDescription.parameters.push({
                        name: "body",
                        type: "Body",
                        description: requestBody.description!,
                        schema: getZodVarName(
                            getZodSchema({
                                schema: bodySchema,
                                ctx,
                                meta: { isRequired: requestBody.required ?? true },
                                options,
                            }),
                            operationName + "_Body"
                        ),
                    });
                }
            }

            for (const param of parameters) {
                const paramItem = (isReferenceObject(param) ? getSchemaByRef(param.$ref) : param) as ParameterObject;
                if (allowedPathInValues.includes(paramItem.in)) {
                    const paramSchema = (isReferenceObject(param) ? param.$ref : param.schema) as SchemaObject;
                    const paramCode = getZodSchema({
                        schema: paramSchema,
                        ctx,
                        meta: { isRequired: paramItem.in === "path" ? true : paramItem.required ?? false },
                    });
                    const chains = [
                        getZodChainablePresence(paramSchema, paramCode.meta),
                        getZodChainableDefault(paramSchema),
                    ]
                        .filter(Boolean)
                        .join(".");

                    endpointDescription.parameters.push({
                        name: paramItem.name,
                        type: match(paramItem.in)
                            .with("header", () => "Header")
                            .with("query", () => "Query")
                            .with("path", () => "Path")
                            .run() as "Header" | "Query" | "Path",
                        schema: getZodVarName(
                            paramCode.assign(paramCode.toString() + (chains ? "." + chains : "")),
                            paramItem.name
                        ),
                    });
                }
            }

            for (const statusCode in operation.responses) {
                const responseItem = operation.responses[statusCode] as ResponseObject;

                const mediaTypes = Object.keys(responseItem.content ?? {});
                const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);

                const maybeSchema = matchingMediaType && responseItem.content?.[matchingMediaType]?.schema;
                let schemaString = matchingMediaType ? undefined : voidSchema;
                let schema: CodeMeta | undefined;

                if (maybeSchema) {
                    schema = getZodSchema({ schema: maybeSchema, ctx, meta: { isRequired: true }, options });
                    schemaString = schema.ref ? getZodVarName(schema) : schema.toString();
                }

                if (schemaString) {
                    const status = Number(statusCode);

                    if (isMainResponseStatus(status) || (statusCode === "default" && !endpointDescription.response)) {
                        endpointDescription.response = schemaString;

                        if (
                            !endpointDescription.description &&
                            responseItem.description &&
                            options?.useMainResponseDescriptionAsEndpointDescriptionFallback
                        ) {
                            endpointDescription.description = responseItem.description;
                        }
                    } else if (statusCode !== "default" && isErrorStatus(status)) {
                        endpointDescription.errors.push({
                            schema: schemaString as any,
                            status,
                            description: responseItem.description,
                        });
                    }
                }
            }

            endpoints.push(endpointDescription);
        }
    }

    const graphs = getOpenApiDependencyGraph(
        Object.keys(ctx.zodSchemaByName).map((name) => getRefFromName(name)),
        ctx.getSchemaByRef
    );

    return {
        ...(ctx as Required<ConversionTypeContext>),
        ...graphs,
        endpoints,
    };
};

const allowedPathInValues = ["query", "header", "path"] as Array<ParameterObject["in"]>;

export type EndpointDescriptionWithRefs = Omit<
    ZodiosEndpointDefinition<any>,
    "response" | "parameters" | "errors" | "description"
> & {
    response: string;
    description?: string | undefined;
    parameters: Array<
        Omit<Required<ZodiosEndpointDefinition<any>>["parameters"][number], "schema"> & { schema: string }
    >;
    errors: Array<Omit<Required<ZodiosEndpointDefinition<any>>["errors"][number], "schema"> & { schema: string }>;
};

const pathParamRegex = /{(\w+)}/g;

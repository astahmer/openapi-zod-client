import { ZodiosEndpointDefinition } from "@zodios/core";
import {
    isReferenceObject,
    OpenAPIObject,
    OperationObject,
    ParameterObject,
    PathItemObject,
    RequestBodyObject,
    ResponseObject,
    SchemaObject,
} from "openapi3-ts";
import { capitalize, get, kebabToCamel } from "pastable/server";
import { match } from "ts-pattern";
import type { TemplateContext } from "./generateZodClientFromOpenAPI";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import { CodeMeta, ConversionTypeContext, getZodChainablePresence, getZodSchema } from "./openApiToZod";
import { normalizeString } from "./tokens";

import { sync } from "whence";

const voidSchema = "z.void()";

export const getZodiosEndpointDefinitionFromOpenApiDoc = (doc: OpenAPIObject, options?: TemplateContext["options"]) => {
    const getSchemaByRef = (ref: string) =>
        get(doc, ref.replace("#/", "").replace("#", "").replaceAll("/", ".")) as SchemaObject;

    const endpoints = [];
    const responsesByOperationId = {} as Record<string, Record<string, string>>;

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

    const ctx: ConversionTypeContext = {
        getSchemaByRef,
        zodSchemaByName: {},
        hashByVariableName: {},
    };
    const getZodVarName = (input: CodeMeta, fallbackName?: string) => {
        const result = input.toString();

        if (result.startsWith("z.") && fallbackName) {
            // result is simple enough that it doesn't need to be assigned to a variable
            if (!complexType.some((type) => result.startsWith(type))) {
                return result;
            }

            const safeName = normalizeString(fallbackName);

            // result is complex and would benefit from being re-used
            let formatedName = safeName;
            const isVarNameAlreadyUsed = Boolean(ctx.hashByVariableName[formatedName]);
            if (isVarNameAlreadyUsed) {
                if (ctx.hashByVariableName[formatedName] === safeName) {
                    return formatedName;
                } else {
                    formatedName += "__2";
                }
            }

            ctx.hashByVariableName[formatedName] = safeName;
            ctx.zodSchemaByName[safeName] = result;
            return formatedName;
        }

        // result is a reference to another schema
        if (ctx.zodSchemaByName[result]) {
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

            const parameters = operation.parameters || [];
            const operationName = operation.operationId || method + pathToVariableName(path);
            const endpointDescription = {
                method,
                path: path.replaceAll(pathParamRegex, ":$1"),
                alias: operationName,
                description: operation.description,
                requestFormat: "json",
                parameters: [] as EndpointDescriptionWithRefs["parameters"],
                errors: [] as EndpointDescriptionWithRefs["errors"],
            } as EndpointDescriptionWithRefs;

            if (operation.requestBody) {
                const requestBody = operation.requestBody as RequestBodyObject;
                const mediaTypes = Object.keys(requestBody.content ?? {});
                const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);

                const bodySchema = matchingMediaType && requestBody.content?.[matchingMediaType]?.schema;
                if (bodySchema) {
                    endpointDescription.parameters.push({
                        name: "body",
                        type: "Body",
                        description: requestBody.description,
                        schema: getZodVarName(
                            getZodSchema({
                                schema: bodySchema,
                                ctx,
                                meta: { isRequired: requestBody.required || true },
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
                        meta: { isRequired: paramItem.in === "path" ? true : paramItem.required || false },
                    });
                    const chainablePresence = getZodChainablePresence(paramSchema, paramCode.meta);

                    endpointDescription.parameters.push({
                        name: paramItem.name,
                        type: match(paramItem.in)
                            .with("header", () => "Header")
                            .with("query", () => "Query")
                            .with("path", () => "Path")
                            .run() as "Header" | "Query" | "Path",
                        schema: getZodVarName(
                            paramCode.assign(paramCode.toString() + (chainablePresence ? "." + chainablePresence : "")),
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
                        // if we want `response: variables["listPets"]`, instead of `response: variables["Pets"]`,
                        // getZodVarName should use operation.operationId as fallbackName
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

    const { refsDependencyGraph, deepDependencyGraph } = getOpenApiDependencyGraph(
        Object.keys(ctx.zodSchemaByName).map((name) => `#/components/schemas/${name}`),
        ctx.getSchemaByRef
    );

    return {
        ...(ctx as Required<ConversionTypeContext>),
        endpoints,
        refsDependencyGraph,
        deepDependencyGraph,
    };
};

const allowedPathInValues = ["query", "header", "path"] as Array<ParameterObject["in"]>;

export type EndpointDescriptionWithRefs = Required<Omit<ZodiosEndpointDefinition<any>, "response" | "parameters">> & {
    response: string;
    parameters: Array<
        Omit<Required<ZodiosEndpointDefinition<any>>["parameters"][number], "schema"> & { schema: string }
    >;
};

const complexType = ["z.object", "z.array", "z.union", "z.enum"] as const;
const pathParamRegex = /{(\w+)}/g;
const pathParamWithBracketsRegex = /({\w+})/g;
const wordPrecededByNonWordCharacter = /[^\w\-]+/g;

/** @example turns `/media-objects/{id}` into `MediaObjectsId` */
const pathToVariableName = (path: string) =>
    capitalize(kebabToCamel(path).replaceAll("/", "")) // /media-objects/{id} -> MediaObjects{id}
        .replace(pathParamWithBracketsRegex, (group) => capitalize(group.slice(1, -1))) // {id} -> Id
        .replace(wordPrecededByNonWordCharacter, "_"); // "/robots.txt" -> "/robots_txt"

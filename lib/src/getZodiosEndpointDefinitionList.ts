import type { ZodiosEndpointDefinition } from "@zodios/core";
import type {
    OpenAPIObject,
    OperationObject,
    ParameterObject,
    PathItemObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject,
    SchemaObject,
} from "openapi3-ts";
import { match } from "ts-pattern";
import { sync } from "whence";

import type { CodeMeta, ConversionTypeContext } from "./CodeMeta";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import { isReferenceObject } from "./isReferenceObject";
import { makeSchemaResolver } from "./makeSchemaResolver";
import { getZodChain, getZodSchema } from "./openApiToZod";
import { getSchemaComplexity } from "./schema-complexity";
import type { TemplateContext } from "./template-context";
import { asComponentSchema, normalizeString, pathToVariableName } from "./utils";

const voidSchema = "z.void()";

// eslint-disable-next-line sonarjs/cognitive-complexity
export const getZodiosEndpointDefinitionList = (doc: OpenAPIObject, options?: TemplateContext["options"]) => {
    const resolver = makeSchemaResolver(doc);
    const graphs = getOpenApiDependencyGraph(
        Object.keys(doc.components?.schemas ?? {}).map((name) => asComponentSchema(name)),
        resolver.getSchemaByRef
    );

    const endpoints = [];

    let isMainResponseStatus = (status: number) => status >= 200 && status < 300;
    if (options?.isMainResponseStatus) {
        isMainResponseStatus =
            typeof options.isMainResponseStatus === "string"
                ? (status: number) => sync(options.isMainResponseStatus, { status }, { functions: true })
                : options.isMainResponseStatus;
    }

    let isErrorStatus = (status: number) => !(status >= 200 && status < 300);
    if (options?.isErrorStatus) {
        isErrorStatus =
            typeof options.isErrorStatus === "string"
                ? (status: number) => sync(options.isErrorStatus, { status }, { functions: true })
                : options.isErrorStatus;
    }

    let isMediaTypeAllowed = (mediaType: string) => mediaType === "application/json";
    if (options?.isMediaTypeAllowed) {
        isMediaTypeAllowed =
            typeof options.isMediaTypeAllowed === "string"
                ? (mediaType: string) => sync(options.isMediaTypeAllowed, { mediaType }, { functions: true })
                : options.isMediaTypeAllowed;
    }

    const ctx: ConversionTypeContext = { resolver, zodSchemaByName: {}, schemaByName: {} };
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
        let schema = ctx.zodSchemaByName[result];
        if (!schema && input.ref) {
            const refInfo = ctx.resolver.resolveRef(input.ref);
            schema = ctx.zodSchemaByName[refInfo.name];
        }

        if (input.ref && schema) {
            const complexity = getSchemaComplexity({ current: 0, schema: ctx.resolver.getSchemaByRef(input.ref) });

            // ref result is simple enough that it doesn't need to be assigned to a variable
            if (complexity < complexityThreshold) {
                return ctx.zodSchemaByName[result]!;
            }

            return result;
        }

        console.log({ ref: input.ref, fallbackName, result });
        throw new Error("Invalid ref: " + input.ref);
    };

    const defaultStatusBehavior = options?.defaultStatusBehavior ?? "spec-compliant";

    const ignoredFallbackResponse = [] as string[];
    const ignoredGenericError = [] as string[];

    for (const path in doc.paths) {
        const pathItem = doc.paths[path] as PathItemObject;

        for (const method in pathItem) {
            const operation = pathItem[method as keyof PathItemObject] as OperationObject;

            if (options?.withDeprecatedEndpoints ? false : operation.deprecated) continue;

            const parameters = operation.parameters ?? [];
            const operationName = operation.operationId ?? method + pathToVariableName(path);
            const endpointDefinition: EndpointDefinitionWithRefs = {
                method: method as EndpointDefinitionWithRefs["method"],
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
                const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);

                const bodySchema = matchingMediaType && requestBody.content?.[matchingMediaType]?.schema;
                if (bodySchema) {
                    match(matchingMediaType)
                        .with("application/octet-stream", () => {
                            endpointDefinition.requestFormat = "binary";
                        })
                        .with("application/x-www-form-urlencoded", () => {
                            endpointDefinition.requestFormat = "form-url";
                        })
                        .with("multipart/form-data", () => {
                            endpointDefinition.requestFormat = "form-data";
                        })
                        .otherwise((value) => {
                            if (value.includes("json")) {
                                endpointDefinition.requestFormat = "json";
                                return;
                            }

                            endpointDefinition.requestFormat = "text";
                        });

                    endpointDefinition.parameters.push({
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
                const paramItem = (
                    isReferenceObject(param) ? ctx.resolver.getSchemaByRef(param.$ref) : param
                ) as ParameterObject;
                if (allowedPathInValues.includes(paramItem.in)) {
                    let paramSchema: SchemaObject | ReferenceObject | undefined;
                    if (paramItem.content) {
                        const mediaTypes = Object.keys(paramItem.content ?? {});
                        const matchingMediaType = mediaTypes.find(isAllowedParamMediaTypes);

                        if (!matchingMediaType) {
                            throw new Error(
                                `Unsupported media type for param ${paramItem.name}: ` + mediaTypes.join(", ")
                            );
                        }

                        const mediaTypeObject = paramItem.content[matchingMediaType];
                        if (!mediaTypeObject) {
                            throw new Error(
                                `No content with media type for param ${paramItem.name}: ` + matchingMediaType
                            );
                        }

                        paramSchema = mediaTypeObject?.schema;

                        // this fallback is needed to autofix openapi docs that put the $ref in the wrong place
                        // (it should be in the mediaTypeObject.schema, not in the mediaTypeObject itself)
                        // https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#style-values (just above this anchor)
                        if (!paramSchema) {
                            // @ts-expect-error
                            paramSchema = mediaTypeObject;
                        }
                    } else {
                        paramSchema = paramItem.schema;
                    }

                    // resolve ref if needed
                    paramSchema = (
                        isReferenceObject(paramSchema) ? ctx.resolver.getSchemaByRef(paramSchema.$ref) : paramSchema
                    )!;

                    const paramCode = getZodSchema({
                        schema: paramSchema,
                        ctx,
                        meta: { isRequired: paramItem.in === "path" ? true : paramItem.required ?? false },
                    });

                    endpointDefinition.parameters.push({
                        name: paramItem.name,
                        type: match(paramItem.in)
                            .with("header", () => "Header")
                            .with("query", () => "Query")
                            .with("path", () => "Path")
                            .run() as "Header" | "Query" | "Path",
                        schema: getZodVarName(
                            paramCode.assign(paramCode.toString() + getZodChain(paramSchema, paramCode.meta)),
                            paramItem.name
                        ),
                    });
                }
            }

            for (const statusCode in operation.responses) {
                const responseItem = operation.responses[statusCode] as ResponseObject;

                const mediaTypes = Object.keys(responseItem.content ?? {});
                const matchingMediaType = mediaTypes.find(isMediaTypeAllowed);

                const maybeSchema = matchingMediaType ? responseItem.content?.[matchingMediaType]?.schema : null;

                let schemaString = matchingMediaType ? undefined : voidSchema;
                let schema: CodeMeta | undefined;

                if (maybeSchema) {
                    schema = getZodSchema({ schema: maybeSchema, ctx, meta: { isRequired: true }, options });
                    schemaString = schema.ref ? getZodVarName(schema) : schema.toString();
                }

                if (schemaString) {
                    const status = Number(statusCode);

                    if (isMainResponseStatus(status) && !endpointDefinition.response) {
                        endpointDefinition.response = schemaString;

                        if (
                            !endpointDefinition.description &&
                            responseItem.description &&
                            options?.useMainResponseDescriptionAsEndpointDefinitionFallback
                        ) {
                            endpointDefinition.description = responseItem.description;
                        }
                    } else if (statusCode !== "default" && isErrorStatus(status)) {
                        endpointDefinition.errors.push({
                            schema: schemaString as any,
                            status,
                            description: responseItem.description,
                        });
                    }
                }
            }

            // use `default` as fallback for `response` undeclared responses
            // if no main response has been found, this should be considered it as a fallback
            // else this will be added as an error response
            if (operation.responses?.default) {
                const responseItem = operation.responses.default as ResponseObject;

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
                    if (defaultStatusBehavior === "auto-correct") {
                        if (endpointDefinition.response) {
                            endpointDefinition.errors.push({
                                schema: schemaString as any,
                                status: "default",
                                description: responseItem.description,
                            });
                        } else {
                            endpointDefinition.response = schemaString;
                        }
                    } else {
                        if (endpointDefinition.response) {
                            ignoredFallbackResponse.push(operationName);
                        } else {
                            ignoredGenericError.push(operationName);
                        }
                    }
                }
            }

            endpoints.push(endpointDefinition);
        }
    }

    if (options?.willSuppressWarnings !== true) {
        if (ignoredFallbackResponse.length > 0) {
            console.warn(
                `The following endpoints have no status code other than \`default\` and were ignored as the OpenAPI spec recommends. However they could be added by setting \`defaultStatusBehavior\` to \`auto-correct\`: ${ignoredGenericError.join(
                    ", "
                )}`
            );
        }

        if (ignoredGenericError.length > 0) {
            console.warn(
                `The following endpoints could have had a generic error response added by setting \`defaultStatusBehavior\` to \`auto-correct\` ${ignoredGenericError.join(
                    ", "
                )}`
            );
        }
    }

    return {
        ...(ctx as Required<ConversionTypeContext>),
        ...graphs,
        endpoints,
        issues: {
            ignoredFallbackResponse,
            ignoredGenericError,
        },
    };
};

const allowedPathInValues = ["query", "header", "path"] as Array<ParameterObject["in"]>;

export type EndpointDefinitionWithRefs = Omit<
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

const allowedParamMediaTypes = [
    "application/octet-stream",
    "multipart/form-data",
    "application/x-www-form-urlencoded",
    "*/*",
] as const;
const isAllowedParamMediaTypes = (
    mediaType: string
): mediaType is typeof allowedParamMediaTypes[number] | `application/${string}json${string}` | `text/${string}` =>
    (mediaType.includes("application/") && mediaType.includes("json")) ||
    allowedParamMediaTypes.includes(mediaType as any) ||
    mediaType.includes("text/");

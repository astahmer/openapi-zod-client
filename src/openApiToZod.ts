import {
    isReferenceObject,
    isSchemaObject,
    MediaTypeObject,
    OpenAPIObject,
    OperationObject,
    ParameterObject,
    PathItemObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject,
    SchemaObject,
} from "openapi3-ts";
import { ZodiosEndpointDescription } from "@zodios/core";
import { get } from "pastable/server";
import { match } from "ts-pattern";

export const openApiSchemaToZodSchemaCodeString = (schema: SchemaObject, ctx?: ConversionTypeContext) =>
    getZodSchemaWithChainable(schema, ctx).toString();

export const getZodSchemaWithChainable = (schema: SchemaObject, ctx?: ConversionTypeContext) =>
    `${getZodSchema(schema)}${getZodChainablePresence(schema, ctx)}`;
export const getZodTypeWithChainableAsString = (schema: SchemaObject, ctx?: ConversionTypeContext) =>
    getZodSchemaWithChainable(schema, ctx).toString();

export const getZodSchemaAsString = (schema: SchemaObject, ctx?: ConversionTypeContext) =>
    getZodSchema(schema, ctx).toString();

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
export function getZodSchema(schema: SchemaObject | ReferenceObject, ctx?: ConversionTypeContext): string {
    if (isReferenceObject(schema)) {
        if (!ctx?.getSchemaByRef || !ctx?.refs) throw new Error("Context is required");

        const result = ctx.refs[schema.$ref] || getZodSchemaWithChainable(ctx.getSchemaByRef(schema.$ref), ctx);
        ctx.refs[schema.$ref] = result;

        // return result;
        return schema.$ref;
    }

    if (schema.oneOf) {
        return `z.union([${schema.oneOf.map((prop) => getZodSchema(prop, ctx)).join(", ")}])`;
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        const types = schema.anyOf.map((prop) => getZodSchema(prop, ctx)).join(", ");
        const oneOf = `z.union([${types}])`;
        return `z.union([${oneOf}, z.array(${oneOf})])`;
    }

    if (schema.allOf) {
        const types = schema.allOf.map((prop) => getZodSchema(prop, ctx));
        const first = types.at(0);
        return `${first}.${types
            .slice(1)
            .map((type) => `and(${type})`)
            .join("")}`;
    }

    if (!schema.type) return `z.unknown()`;

    if (isPrimitiveType(schema.type)) {
        if (schema.enum) {
            if (schema.type === "string") {
                return `z.enum([${schema.enum.map((value) => `"${value}"`).join(", ")}])`;
            }

            return `z.union([${schema.enum
                .map((value) => `z.literal(${value === null ? "null" : `"${value}"`})`)
                .join(", ")}])`;
        }

        return match(schema.type)
            .with("integer", () => `z.bigint()`)
            .otherwise(() => `z.${schema.type}()`);
    }

    if (schema.type === "array") {
        if (schema.items) {
            return `z.array(${getZodSchema(schema.items).toString()})`;
        }
        return `z.array(z.any())`;
    }

    if (schema.type === "object") {
        let additionalProps = "";
        if (
            (typeof schema.additionalProperties === "boolean" && schema.additionalProperties) ||
            (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length === 0)
        ) {
            additionalProps = ".passthrough()";
        } else if (typeof schema.additionalProperties === "object") {
            additionalProps = `.record(${getZodSchema(schema.additionalProperties).toString()})`;
        }

        const isPartial = !schema.required?.length;
        let properties = "z.any()";
        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => [
                prop,
                getZodSchemaWithChainable(propSchema, {
                    ...ctx,
                    isRequired: isPartial ? true : schema.required?.includes(prop),
                }),
            ]);

            properties = "{ " + propsMap.map(([prop, propSchema]) => `${prop}: ${propSchema}`).join(", ") + " }";
        }

        return `z.object(${properties})${isPartial ? ".partial()" : ""}${additionalProps}`;
    }

    throw new Error(`Unsupported schema type: ${schema.type}`);
}

interface ConversionTypeContext {
    isRequired?: boolean;
    getSchemaByRef?: ($ref: string) => SchemaObject;
    refs?: Record<string, string>;
    variables?: Record<string, string>;
}

const getZodChainablePresence = (schema: SchemaObject, ctx?: ConversionTypeContext) => {
    if (schema.nullable && !ctx?.isRequired) {
        return `.nullish()`;
    }

    if (schema.nullable) {
        return `.nullable()`;
    }

    if (!ctx?.isRequired) {
        return `.optional()`;
    }

    return "";
};

const getZodChainableStringConditions = (schema: SchemaObject, meta?: ConversionTypeContext) => {
    // TODO min max length email url uuid startsWith endsWith regex trim nonempty
};
const getZodChainableNumberConditions = (schema: SchemaObject, meta?: ConversionTypeContext) => {
    // TODO gt gte lt lte int positive nonnegative negative nonpositive multipleOf
};

// TODO z.enum = union of literal

export const getZodiosEndpointDescriptionFromOpenApiDoc = (doc: OpenAPIObject) => {
    const getSchemaByRef = (ref: string) => get(doc, ref.replace("#/", "").replaceAll("/", ".")) as SchemaObject;

    const endpoints = [];
    const endpointsByOperationId = {} as Record<string, ZodiosEndpointDescription<any>>;
    const responsesByOperationid = {} as Record<string, Record<string, string>>;

    const context: ConversionTypeContext = { getSchemaByRef, refs: {}, variables: {} };
    const getZodVarName = (name: string, result: string) => {
        if (result.startsWith("z.")) {
            const formatedName = normalizeString(name);
            context.variables![formatedName] = result;
            return formatedName;
        }

        // $ref like #/components/xxx/name
        const refName = name.replace("#/", "").split("/")[3];
        const formatedName = normalizeString(refName);
        context.variables![formatedName] = result;

        return formatedName;
    };

    for (const path in doc.paths) {
        const pathItem = doc.paths[path] as PathItemObject;

        for (const method in pathItem) {
            const operation = pathItem[method] as OperationObject;

            const parameters = operation.parameters || [];
            const endpointDescription = {
                method,
                path,
                alias: operation.operationId,
                description: operation.description,
                requestFormat: "json",
                parameters: [] as any,
            } as Required<ZodiosEndpointDescription<any>>;

            if (operation.requestBody) {
                const requestBody = operation.requestBody as RequestBodyObject;
                const bodySchema = requestBody.content?.["application/json"]?.schema;
                if (bodySchema) {
                    endpointDescription.parameters.push({
                        name: "body",
                        type: "Body",
                        description: requestBody.description,
                        schema: getZodVarName(
                            isReferenceObject(bodySchema) ? bodySchema.$ref : operation.operationId + "-Body",
                            getZodSchema(bodySchema, context)
                        ) as any,
                    });
                }
            }

            for (const param of parameters) {
                const paramItem = (isReferenceObject(param) ? getSchemaByRef(param.$ref) : param) as ParameterObject;
                if (allowedPathInValues.includes(paramItem.in)) {
                    endpointDescription.parameters.push({
                        name: paramItem.name,
                        type: match(paramItem.in)
                            .with("header", () => "Header")
                            .with("query", () => "Query")
                            .run() as "Header" | "Query",
                        schema: getZodSchema(param?.$ref ? param.$ref : (param as ParameterObject).schema, {
                            ...context,
                            isRequired: paramItem.required,
                        }) as any,
                    });
                }
            }

            for (const statusCode in operation.responses) {
                const responseItem = operation.responses[statusCode] as ResponseObject;
                if (responseItem.content) {
                    const isSuccess = statusCode === "200";

                    const maybeSchema = responseItem.content["application/json"].schema!;
                    if (maybeSchema) {
                        // const schema = isSchemaObject(maybeSchema) ? maybeSchema : getSchemaByRef(maybeSchema.$ref);

                        if (isSuccess) {
                            endpointDescription.response = getZodSchema(maybeSchema, context) as any;
                        }

                        if (endpointDescription.alias) {
                            responsesByOperationid[endpointDescription.alias] = {
                                ...responsesByOperationid[endpointDescription.alias],
                                [statusCode]: getZodSchema(maybeSchema, context),
                            };
                        }
                    }
                }
            }

            endpoints.push(endpointDescription);
            endpointsByOperationId[endpointDescription.alias] = endpointDescription;
        }
    }

    return {
        endpoints,
        // endpointsByOperationId,
        responsesByOperationid,
        refs: context.refs,
    };
};

const allowedPathInValues = ["query", "header"] as Array<ParameterObject["in"]>;

const isPrimitiveType = (type: SingleType): type is "string" | "number" | "integer" | "boolean" | "null" =>
    singleTypes.includes(type as any);

export const singleTypes = ["string", "number", "integer", "boolean", "null"] as const;
// type SingleType = typeof singleTypes[number]
type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;

function stringify(obj_from_json: Record<string, any>): string {
    if (typeof obj_from_json !== "object" || Array.isArray(obj_from_json)) {
        // not an object, stringify using native function
        return JSON.stringify(obj_from_json);
    }
    // Implements recursive object serialization according to JSON spec
    // but without quotes around the keys.
    let props = Object.keys(obj_from_json)
        .map((key) => `${key}:${stringify(obj_from_json[key])}`)
        .join(",");
    return `{${props}}`;
}

function normalizeString(text: string) {
    // console.log(text);
    return text
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

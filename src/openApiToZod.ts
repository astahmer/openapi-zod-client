import { ZodiosEndpointDescription } from "@zodios/core";
import {
    isReferenceObject,
    OpenAPIObject,
    OperationObject,
    ParameterObject,
    PathItemObject,
    ReferenceObject,
    RequestBodyObject,
    ResponseObject,
    SchemaObject,
} from "openapi3-ts";
import { get } from "pastable/server";
import { match } from "ts-pattern";

interface ConversionArgs {
    schema: SchemaObject;
    ctx?: ConversionTypeContext;
    meta?: CodeMetaData;
}

export const getZodSchemaWithChainable = (args: ConversionArgs) =>
    `${getZodSchema(args)}${getZodChainablePresence(args.schema, args.meta)}`;

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
export function getZodSchema({ schema, ctx, meta: inheritedMeta }: ConversionArgs): CodeMeta {
    const nestingLevel = (inheritedMeta?.nestingLevel || 0) + 1;
    const code = new CodeMeta(schema, ctx, { ...inheritedMeta, nestingLevel });
    const meta = { nestingLevel, parent: code.inherit(inheritedMeta?.parent), name: inheritedMeta?.name };

    if (isReferenceObject(schema)) {
        if (!ctx?.getSchemaByRef || !ctx?.refs) throw new Error("Context is required");

        const result =
            ctx.refs[schema.$ref] || getZodSchemaWithChainable({ schema: ctx.getSchemaByRef(schema.$ref), ctx, meta });
        ctx.refs[schema.$ref] = result;

        // return result;
        return code.reference(schema.$ref);
    }

    if (schema.oneOf) {
        return code.assign(
            `z.union([${schema.oneOf.map((prop) => getZodSchema({ schema: prop, ctx, meta })).join(", ")}])`
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        const types = schema.anyOf.map((prop) => getZodSchema({ schema: prop, ctx, meta })).join(", ");
        const oneOf = `z.union([${types}])`;
        return code.assign(`z.union([${oneOf}, z.array(${oneOf})])`);
    }

    if (schema.allOf) {
        const types = schema.allOf.map((prop) => getZodSchema({ schema: prop, ctx, meta }));
        const first = types.at(0)!;
        return code.assign(
            `${first.toString()}.${types
                .slice(1)
                .map((type) => `and(${type})`)
                .join("")}`
        );
    }

    if (!schema.type) return code.assign(`z.unknown()`);

    if (isPrimitiveType(schema.type)) {
        if (schema.enum) {
            if (schema.type === "string") {
                return code.assign(`z.enum([${schema.enum.map((value) => `"${value}"`).join(", ")}])`);
            }

            return code.assign(
                `z.union([${schema.enum
                    .map((value) => `z.literal(${value === null ? "null" : `"${value}"`})`)
                    .join(", ")}])`
            );
        }

        return code.assign(
            match(schema.type)
                .with("integer", () => `z.bigint()`)
                .otherwise(() => `z.${schema.type}()`)
        );
    }

    if (schema.type === "array") {
        if (schema.items) {
            return code.assign(`z.array(${getZodSchema({ schema: schema.items, ctx, meta }).toString()})`);
        }
        return code.assign(`z.array(z.any())`);
    }

    if (schema.type === "object") {
        let additionalProps = "";
        if (
            (typeof schema.additionalProperties === "boolean" && schema.additionalProperties) ||
            (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length === 0)
        ) {
            additionalProps = ".passthrough()";
        } else if (typeof schema.additionalProperties === "object") {
            additionalProps = `.record(${getZodSchema({ schema: schema.additionalProperties, ctx, meta }).toString()})`;
        }

        const isPartial = !schema.required?.length;
        let properties = "z.any()";
        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => [
                prop,
                getZodSchemaWithChainable({
                    schema: propSchema,
                    ctx,
                    meta: {
                        ...meta,
                        isRequired: isPartial ? true : schema.required?.includes(prop),
                        name: prop,
                    },
                }).toString(),
            ]);

            properties = "{ " + propsMap.map(([prop, propSchema]) => `${prop}: ${propSchema}`).join(", ") + " }";
        }

        return code.assign(`z.object(${properties})${isPartial ? ".partial()" : ""}${additionalProps}`);
    }

    throw new Error(`Unsupported schema type: ${schema.type}`);
}

interface ConversionTypeContext {
    getSchemaByRef?: ($ref: string) => SchemaObject;
    refs?: Record<string, string>;
    variables?: Record<string, string>;
}

export interface CodeMetaData {
    isRequired?: boolean;
    nestingLevel?: number;
    name?: string;
    parent?: CodeMeta;
}

const getZodChainablePresence = (schema: SchemaObject, meta?: CodeMetaData) => {
    if (schema.nullable && !meta?.isRequired) {
        return `.nullish()`;
    }

    if (schema.nullable) {
        return `.nullable()`;
    }

    if (!meta?.isRequired) {
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

const makeVarRef = (name: string) => "@var/" + normalizeString(name);
const complexType = ["z.object", "z.array", "z.union", "z.enum"] as const;

export const getZodiosEndpointDescriptionFromOpenApiDoc = (doc: OpenAPIObject) => {
    const getSchemaByRef = (ref: string) => get(doc, ref.replace("#/", "").replaceAll("/", ".")) as SchemaObject;

    const endpoints = [];
    const endpointsByOperationId = {} as Record<string, EndpointDescriptionWithRefs>;
    const responsesByOperationId = {} as Record<string, Record<string, string>>;

    const ctx: ConversionTypeContext = { getSchemaByRef, refs: {}, variables: {} };
    const getZodVarName = (input: CodeMeta | string, fallbackName?: string) => {
        const result = input instanceof CodeMeta ? input.toString() : input;
        if (result.startsWith("z.") && fallbackName) {
            // result is simple enough that it doesn't need to be assigned to a variable
            if (!complexType.some((type) => result.startsWith(type))) {
                return result;
            }

            // TODO opti:
            // z.union([z.string(), z.number()])
            // factoriser ça dans une seule var
            // OU ne pas mettre ça dans une variable
            // (alors que z.union([z.object(xxx), z.object(yyy)])) oui (vu que complex)

            // result is complex and would benefit from being re-used
            let formatedName = makeVarRef(fallbackName);
            const isAlreadyUsed = Boolean(ctx.variables![formatedName]);
            if (isAlreadyUsed) {
                if (ctx.variables![formatedName] === result) {
                    return formatedName;
                } else {
                    formatedName += "__2";
                }
            }

            ctx.variables![formatedName] = result;
            return formatedName;
        }

        // $ref like #/components/xxx/name
        const refName = result.split("/")[3];
        const formatedName = makeVarRef(refName);
        ctx.variables![formatedName] = result;

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
            } as EndpointDescriptionWithRefs;

            if (operation.requestBody) {
                const requestBody = operation.requestBody as RequestBodyObject;
                const bodySchema = requestBody.content?.["application/json"]?.schema;
                if (bodySchema) {
                    endpointDescription.parameters.push({
                        name: "body",
                        type: "Body",
                        description: requestBody.description,
                        schema: getZodVarName(
                            getZodSchema({ schema: bodySchema, ctx, meta: {} }),
                            operation.operationId + "-Body"
                        ),
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
                        schema: getZodVarName(
                            getZodSchema({
                                schema: param?.$ref ? param.$ref : (param as ParameterObject).schema,
                                ctx,
                                meta: {
                                    isRequired: paramItem.required,
                                },
                            }),
                            paramItem.name
                        ),
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
                            endpointDescription.response = getZodVarName(getZodSchema({ schema: maybeSchema, ctx }));
                        }

                        if (endpointDescription.alias) {
                            responsesByOperationId[endpointDescription.alias] = {
                                ...responsesByOperationId[endpointDescription.alias],
                                [statusCode]: getZodVarName(
                                    getZodSchema({ schema: maybeSchema, ctx }),
                                    endpointDescription.alias
                                ),
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
        ...(ctx as Required<ConversionTypeContext>),
        endpoints,
        // endpointsByOperationId,
        responsesByOperationId,
    };
};

const allowedPathInValues = ["query", "header"] as Array<ParameterObject["in"]>;

const isPrimitiveType = (type: SingleType): type is "string" | "number" | "integer" | "boolean" | "null" =>
    singleTypes.includes(type as any);

export const singleTypes = ["string", "number", "integer", "boolean", "null"] as const;
// type SingleType = typeof singleTypes[number]
type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;

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

// TODO parents CodeMeta + check if it is a complex type via this.type

export class CodeMeta {
    code?: string;
    ref?: string;

    type: string;
    children: CodeMeta[] = [];
    parent: CodeMeta;

    constructor(
        public schema: SchemaObject | ReferenceObject,
        public ctx?: ConversionTypeContext,
        public meta?: CodeMetaData
    ) {}

    assign(code: string) {
        this.code = code;
        this.type = this.code.split("(")[0].slice(2);
        return this;
    }

    reference(ref: string) {
        this.ref = ref;
        return this;
    }

    inherit(parent?: CodeMeta) {
        if (parent) {
            this.parent = parent;
            parent.children.push(this);
        }

        return this;
    }

    toString() {
        return (this.code || this.ref) as string;
    }
    toJSON() {
        return (this.code || this.ref) as string;
    }
}

type EndpointDescriptionWithRefs = Required<Omit<ZodiosEndpointDescription<any>, "response" | "parameters">> & {
    response: string;
    parameters: Array<
        Omit<Required<ZodiosEndpointDescription<any>>["parameters"][number], "schema"> & { schema: string }
    >;
};

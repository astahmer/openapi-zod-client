import { isReferenceObject, ReferenceObject, SchemaObject } from "openapi3-ts";
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

export interface ConversionTypeContext {
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

const varAlias = "@var/";
export const isVarAlias = (name: string) => name.startsWith(varAlias);
export const rmVarAlias = (name: string) => name.replace(varAlias, "");
export const makeVarRef = (name: string) => varAlias + normalizeString(name);

export const complexType = ["z.object", "z.array", "z.union", "z.enum"] as const;

type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
type PrimitiveType = typeof primitiveTypeList[number];

function normalizeString(text: string) {
    return text
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "_") // Replace spaces with _
        .replace(/-+/g, "_") // Replace - with _
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

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

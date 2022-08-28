import { isReferenceObject, ReferenceObject, SchemaObject } from "openapi3-ts";
import { match } from "ts-pattern";
import { normalizeString, tokens } from "./tokens";

interface ConversionArgs {
    schema: SchemaObject | ReferenceObject;
    ctx?: ConversionTypeContext;
    meta?: CodeMetaData;
}

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
export function getZodSchema({ schema, ctx, meta: inheritedMeta }: ConversionArgs): CodeMeta {
    if (!schema) {
        throw new Error("Schema is required");
    }

    const code = new CodeMeta(schema, ctx, inheritedMeta);
    const meta = {
        nestingLevel: code.meta.nestingLevel,
        parent: code.inherit(inheritedMeta?.parent),
        referencedBy: [...code.meta.referencedBy],
    };

    const nestingPath = code.meta.referencedBy
        .slice(0, -1)
        .map((prev) => tokens.getRefName(prev.ref!))
        .join("_|_");

    const fromRef = inheritedMeta?.parent?.ref;
    if (fromRef && ctx) {
        if (!ctx.codeMetaByRef[fromRef]) {
            ctx.codeMetaByRef[fromRef] = code;
            ctx.codeMetaByRef[fromRef].meta.circularSchemaRef = fromRef;
            if (!ctx.circularTokenByRef[fromRef]) {
                ctx.circularTokenByRef[fromRef] = tokens.makeCircularRef(fromRef);
            }
        }
    }

    // safety net for circular(=recursive) references
    if (meta.nestingLevel > 50) {
        throw new Error("Nesting level exceeded, probably a circular reference: " + nestingPath);
    }

    if (isReferenceObject(schema)) {
        if (!ctx) throw new Error("Context is required");

        // circular(=recursive) reference
        if (
            nestingPath.split("_|_").length > 1 &&
            nestingPath.includes("_|_" + tokens.getRefName(code.ref!)) &&
            ctx.codeMetaByRef[schema.$ref]
        ) {
            return ctx.codeMetaByRef[schema.$ref];
        }

        let result = ctx.zodSchemaByHash[schema.$ref];
        if (!result) {
            const actualSchema = ctx.getSchemaByRef(schema.$ref);
            if (!actualSchema) {
                throw new Error(`Schema ${schema.$ref} not found`);
            }

            result = getZodSchema({ schema: actualSchema, ctx, meta }).toString();
        }

        if (ctx.codeMetaByRef[schema.$ref].meta.circularSchemaRef && ctx.schemaHashByRef[schema.$ref]) {
            return code;
        }

        const hashed = tokens.makeRefHash(result);
        ctx.schemaHashByRef[schema.$ref] = hashed;
        ctx.zodSchemaByHash[hashed] = result;

        return code;
    }

    if (schema.oneOf) {
        if (schema.oneOf.length === 1) {
            return getZodSchema({ schema: schema.oneOf[0], ctx, meta });
        }

        return code.assign(
            `z.union([${schema.oneOf.map((prop) => getZodSchema({ schema: prop, ctx, meta })).join(", ")}])`
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        if (schema.anyOf.length === 1) {
            return getZodSchema({ schema: schema.anyOf[0], ctx, meta });
        }

        const types = schema.anyOf.map((prop) => getZodSchema({ schema: prop, ctx, meta })).join(", ");
        const oneOf = `z.union([${types}])`;
        return code.assign(`z.union([${oneOf}, z.array(${oneOf})])`);
    }

    if (schema.allOf) {
        if (schema.allOf.length === 1) {
            return getZodSchema({ schema: schema.allOf[0], ctx, meta });
        }

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
            return code.assign(
                `z.record(${getZodSchema({ schema: schema.additionalProperties, ctx, meta }).toString()})`
            );
        }

        const isPartial = !schema.required?.length;
        let properties = "{}";
        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => {
                const propMetadata = {
                    ...meta,
                    isRequired: isPartial ? true : schema.required?.includes(prop),
                    name: prop,
                } as CodeMetaData;
                const propCode =
                    getZodSchema({ schema: propSchema, ctx, meta: propMetadata }) +
                    getZodChainablePresence(propSchema, propMetadata);

                return [prop, propCode.toString()];
            });

            properties =
                "{ " +
                propsMap.map(([prop, propSchema]) => `${normalizeString(prop)}: ${propSchema}`).join(", ") +
                " }";
        }

        return code.assign(`z.object(${properties})${isPartial ? ".partial()" : ""}${additionalProps}`);
    }

    throw new Error(`Unsupported schema type: ${schema.type}`);
}

export interface ConversionTypeContext {
    getSchemaByRef: ($ref: string) => SchemaObject;
    zodSchemaByHash: Record<string, string>;
    schemaHashByRef: Record<string, string>;
    hashByVariableName: Record<string, string>;
    codeMetaByRef: Record<string, CodeMeta>;
    circularTokenByRef: Record<string, string>;
}

export interface CodeMetaData {
    isRequired?: boolean;
    nestingLevel?: number;
    name?: string;
    parent?: CodeMeta;
    referencedBy?: CodeMeta[];
    circularSchemaRef?: string;
}

type DefinedCodeMetaProps = "referencedBy" | "nestingLevel";
type DefinedCodeMetaData = Pick<Required<CodeMetaData>, DefinedCodeMetaProps> &
    Omit<CodeMetaData, DefinedCodeMetaProps>;

export const getZodChainablePresence = (schema: SchemaObject, meta?: CodeMetaData) => {
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

// TODO z.default()
// TODO OA format: date-time -> z.date() / preprocess ?
// TODO z.nonempty min max length
// TODO OA prefixItems -> z.tuple
// TODO recursive = z.lazy() ?

const getZodChainableStringConditions = (schema: SchemaObject, meta?: ConversionTypeContext) => {
    // TODO min max length email url uuid startsWith endsWith regex trim nonempty
};
const getZodChainableNumberConditions = (schema: SchemaObject, meta?: ConversionTypeContext) => {
    // TODO gt gte lt lte int positive nonnegative negative nonpositive multipleOf
};

type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
type PrimitiveType = typeof primitiveTypeList[number];

export class CodeMeta {
    code?: string;
    ref?: string;

    children: CodeMeta[] = [];
    meta: DefinedCodeMetaData;

    constructor(
        public schema: SchemaObject | ReferenceObject,
        public ctx?: ConversionTypeContext,
        meta: CodeMetaData = {}
    ) {
        if (schema.$ref) {
            this.ref = schema.$ref;
        }

        // @ts-ignore
        this.meta = { ...meta };
        this.meta.nestingLevel = (meta?.nestingLevel || 0) + 1;
        this.meta.referencedBy = [...(meta?.referencedBy || [])];

        if (this.ref) {
            this.meta.referencedBy.push(this);
        }
    }

    get codeString(): string {
        if (this.code) return this.code;
        if (!this.ctx) return this.ref as string;

        const refAlias = this.ctx.schemaHashByRef![this.ref!];
        if (!refAlias) {
            const fromRef = this.meta!.parent!.ref!;

            return tokens.makeCircularRef(fromRef);
        }

        return refAlias;
    }

    assign(code: string) {
        this.code = code;

        return this;
    }

    inherit(parent?: CodeMeta) {
        if (parent) {
            parent.children.push(this);
        }

        return this;
    }

    toString() {
        return this.codeString;
    }
    toJSON() {
        return this.codeString;
    }
}

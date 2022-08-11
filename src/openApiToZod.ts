import { isReferenceObject, ReferenceObject, SchemaObject } from "openapi3-ts";
import { match } from "ts-pattern";
import { tokens } from "./tokens";

interface ConversionArgs {
    schema: SchemaObject;
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

    if (isReferenceObject(schema)) {
        if (!ctx) throw new Error("Context is required");
        // if (!ctx.getSchemaByRef || !ctx.schemaHashByRef || !ctx.zodSchemaByHash) throw new Error("Context is invalid");

        let result = ctx.zodSchemaByHash[schema.$ref];
        if (!result) {
            const actualSchema = ctx.getSchemaByRef(schema.$ref);
            if (!actualSchema) {
                throw new Error(`Schema ${schema.$ref} not found`);
            }

            result = getZodSchema({ schema: actualSchema, ctx, meta }).toString();
        }

        const hashed = tokens.makeRefHash(result);
        ctx.schemaHashByRef[schema.$ref] = hashed;
        ctx.zodSchemaByHash[hashed] = result;

        code.ref = schema.$ref;

        return code;
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
            return code.assign(
                `z.record(${getZodSchema({ schema: schema.additionalProperties, ctx, meta }).toString()})`
            );
        }

        const isPartial = !schema.required?.length;
        let properties = "{}";
        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => {
                const propMeta = {
                    ...meta,
                    isRequired: isPartial ? true : schema.required?.includes(prop),
                    name: prop,
                };

                return [prop, getZodSchema({ schema: propSchema, ctx, meta: propMeta }).toString()];
            });

            properties = "{ " + propsMap.map(([prop, propSchema]) => `${prop}: ${propSchema}`).join(", ") + " }";
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
    dependenciesByHashRef: Record<string, Set<string>>;
}

export interface CodeMetaData {
    isRequired?: boolean;
    nestingLevel?: number;
    name?: string;
    parent?: CodeMeta;
    referencedBy?: CodeMeta[];
}

type DefinedCodeMetaProps = "referencedBy" | "nestingLevel";
type DefinedCodeMetaData = Pick<Required<CodeMetaData>, DefinedCodeMetaProps> &
    Omit<CodeMetaData, DefinedCodeMetaProps>;

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

// TODO z.default()
// TODO OA format: date-time -> z.date() / preprocess ?
// TODO z.nonempty min max length
// TODO OA prefixItems -> z.zuple
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

    hash?: string;
    meta: DefinedCodeMetaData;

    constructor(
        public schema: SchemaObject | ReferenceObject,
        public ctx?: ConversionTypeContext,
        meta: CodeMetaData = {}
    ) {
        // @ts-ignore
        this.meta = { ...meta };
        this.meta.nestingLevel = (meta?.nestingLevel || 0) + 1;
        this.meta.referencedBy = [...(meta?.referencedBy || [])];
        if (this.meta.name) {
            this.meta.referencedBy.push(this);
        }
    }

    get codeString(): string {
        if (this.code) return this.code;
        if (!this.ctx) return this.ref as string;

        const refAlias = this.ctx.schemaHashByRef![this.ref!];

        return refAlias;
    }

    get hasDependencies() {
        return this.codeString?.includes(tokens.refToken);
    }

    assign(code: string) {
        const chainable = getZodChainablePresence(this.schema, this.meta);
        this.code = code + chainable;

        return this;
    }

    inherit(parent?: CodeMeta) {
        if (parent) {
            parent.children.push(this);
        }

        return this;
    }

    traverse() {
        if (!this.ctx) throw new Error("Context is required");
        if (!this.code?.includes(tokens.refToken)) return { code: this.code, dependencies: [] };

        const dependencies = new Set();
        const visit = (code: string, schemaRef: string | null): string => {
            // const refBySchemaHash = reverse(this.ctx!.schemaHashByRef) as Record<string, string>;
            return code.replaceAll(tokens.refTokenHashRegex, (match) => {
                if (schemaRef) {
                    if (!this.ctx!.dependenciesByHashRef[schemaRef]) {
                        this.ctx!.dependenciesByHashRef[schemaRef] = new Set();
                    }
                    this.ctx!.dependenciesByHashRef[schemaRef].add(match);
                }
                dependencies.add(match);

                const code = this.ctx!.zodSchemaByHash[match];
                if (code) {
                    return visit(code, match);
                    // return visit(code, refBySchemaHash[match]);
                }

                return match;
            });
        };

        return { code: visit(this.code, null), dependencies };
    }

    toString() {
        return this.codeString;
    }
    toJSON() {
        return this.codeString;
    }
}

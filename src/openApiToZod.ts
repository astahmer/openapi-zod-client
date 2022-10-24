import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { isReferenceObject } from "openapi3-ts";
import { match } from "ts-pattern";

import type { TemplateContext } from "./generateZodClientFromOpenAPI";
import { getRefName, normalizeString } from "./tokens";

type ConversionArgs = {
    schema: SchemaObject | ReferenceObject;
    ctx?: ConversionTypeContext | undefined;
    meta?: CodeMetaData | undefined;
    options?: TemplateContext["options"] | undefined;
};

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function getZodSchema({ schema, ctx, meta: inheritedMeta, options }: ConversionArgs): CodeMeta {
    if (!schema) {
        throw new Error("Schema is required");
    }

    const code = new CodeMeta(schema, ctx, inheritedMeta);
    const meta = {
        parent: code.inherit(inheritedMeta?.parent),
        referencedBy: [...code.meta.referencedBy],
    };

    const nestingPath = code.meta.referencedBy
        .slice(0, -1)
        .map((prev) => getRefName(prev.ref!))
        .join("_|_");

    if (isReferenceObject(schema)) {
        if (!ctx) throw new Error("Context is required");

        const refName = getRefName(schema.$ref);

        // circular(=recursive) reference
        if (nestingPath.split("_|_").length > 1 && nestingPath.includes("_|_" + refName)) {
            return code.assign(ctx.zodSchemaByName[code.ref!]!);
        }

        let result = ctx.zodSchemaByName[schema.$ref];
        if (!result) {
            const actualSchema = ctx.getSchemaByRef(schema.$ref);
            if (!actualSchema) {
                throw new Error(`Schema ${schema.$ref} not found`);
            }

            result = getZodSchema({ schema: actualSchema, ctx, meta, options }).toString();
        }

        if (ctx.zodSchemaByName[refName]) {
            return code;
        }

        ctx.zodSchemaByName[refName] = result;

        return code;
    }

    if (schema.oneOf) {
        if (schema.oneOf.length === 1) {
            return getZodSchema({ schema: schema.oneOf[0]!, ctx, meta, options });
        }

        return code.assign(
            `z.union([${schema.oneOf.map((prop) => getZodSchema({ schema: prop, ctx, meta, options })).join(", ")}])`
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        if (schema.anyOf.length === 1) {
            return getZodSchema({ schema: schema.anyOf[0]!, ctx, meta, options });
        }

        const types = schema.anyOf.map((prop) => getZodSchema({ schema: prop, ctx, meta, options })).join(", ");
        const oneOf = `z.union([${types}])`;
        return code.assign(`z.union([${oneOf}, z.array(${oneOf})])`);
    }

    if (schema.allOf) {
        if (schema.allOf.length === 1) {
            return getZodSchema({ schema: schema.allOf[0]!, ctx, meta, options });
        }

        const types = schema.allOf.map((prop) => getZodSchema({ schema: prop, ctx, meta, options }));
        const first = types.at(0)!;
        const rest = types
            .slice(1)
            .map((type) => `and(${type.toString()})`)
            .join("");

        return code.assign(`${first.toString()}.${rest}`);
    }

    if (schema.type && isPrimitiveType(schema.type)) {
        if (schema.enum) {
            if (schema.type === "string") {
                // eslint-disable-next-line sonarjs/no-nested-template-literals
                return code.assign(`z.enum([${schema.enum.map((value) => `"${value}"`).join(", ")}])`);
            }

            return code.assign(
                `z.union([${schema.enum
                    // eslint-disable-next-line sonarjs/no-nested-template-literals
                    .map((value) => `z.literal(${value === null ? "null" : `"${value}"`})`)
                    .join(", ")}])`
            );
        }

        return code.assign(
            match(schema.type)
                .with("integer", () => "z.number()")
                .otherwise((type) => `z.${type}()`)
        );
    }

    if (schema.type === "array") {
        if (schema.items) {
            return code.assign(`z.array(${getZodSchema({ schema: schema.items, ctx, meta, options }).toString()})`);
        }

        return code.assign("z.array(z.any())");
    }

    if (schema.type === "object" || schema.properties || schema.additionalProperties) {
        let additionalProps = "";
        if (
            (typeof schema.additionalProperties === "boolean" && schema.additionalProperties) ||
            (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length === 0)
        ) {
            additionalProps = ".passthrough()";
        } else if (typeof schema.additionalProperties === "object") {
            return code.assign(
                `z.record(${getZodSchema({ schema: schema.additionalProperties, ctx, meta, options }).toString()})`
            );
        }

        const hasRequiredArray = schema.required && schema.required.length > 0;
        const isPartial = options?.withImplicitRequiredProps ? false : !schema.required?.length;
        let properties = "{}";
        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => {
                const propMetadata = {
                    ...meta,
                    isRequired: isPartial
                        ? true
                        : hasRequiredArray
                        ? schema.required?.includes(prop)
                        : options?.withImplicitRequiredProps,
                    name: prop,
                } as CodeMetaData;
                const propCode =
                    getZodSchema({ schema: propSchema, ctx, meta: propMetadata, options }) +
                    getZodChain(propSchema as SchemaObject, propMetadata);

                return [prop, propCode.toString()];
            });

            properties =
                "{ " +
                propsMap.map(([prop, propSchema]) => `${normalizeString(prop!)}: ${propSchema}`).join(", ") +
                " }";
        }

        return code.assign(`z.object(${properties})${isPartial ? ".partial()" : ""}${additionalProps}`);
    }

    if (!schema.type) return code.assign("z.unknown()");

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema type: ${schema.type}`);
}

export type ConversionTypeContext = {
    getSchemaByRef: ($ref: string) => SchemaObject;
    zodSchemaByName: Record<string, string>;
};

export type CodeMetaData = {
    isRequired?: boolean;
    name?: string;
    parent?: CodeMeta;
    referencedBy?: CodeMeta[];
};

type DefinedCodeMetaProps = "referencedBy";
type DefinedCodeMetaData = Pick<Required<CodeMetaData>, DefinedCodeMetaProps> &
    Omit<CodeMetaData, DefinedCodeMetaProps>;

const getZodChain = (schema: SchemaObject, meta?: CodeMetaData) => {
    const chains: string[] = [];

    switch (schema.type) {
        case "string": {
            chains.push(getZodChainableStringValidations(schema));

            break;
        }

        case "number":
        case "integer": {
            chains.push(getZodChainableNumberValidations(schema));

            break;
        }

        case "array": {
            chains.push(getZodChainableArrayValidations(schema));

            break;
        }

        default: {
            break;
        }
    }

    const output = chains.concat(getZodChainablePresence(schema, meta)).filter(Boolean).join(".");
    return output ? `.${output}` : "";
};

export const getZodChainablePresence = (schema: SchemaObject, meta?: CodeMetaData) => {
    if (schema.nullable && !meta?.isRequired) {
        return "nullish()";
    }

    if (schema.nullable) {
        return "nullable()";
    }

    if (!meta?.isRequired) {
        return "optional()";
    }

    return "";
};

// TODO z.default()
// TODO OA prefixItems -> z.tuple

const getZodChainableStringValidations = (schema: SchemaObject) => {
    const validations: string[] = [];

    if (schema.minLength && schema.maxLength) {
        validations.push(`length(${schema.minLength})`);
    } else if (schema.minLength) {
        validations.push(`min(${schema.minLength})`);
    } else if (schema.maxLength) {
        validations.push(`max(${schema.maxLength})`);
    }

    if (schema.pattern) {
        validations.push(`regex(${schema.pattern})`);
    }

    if (schema.format) {
        const chain = match(schema.format)
            .with("email", () => "email()")
            .with("hostname", () => "url()")
            .with("uri", () => "url()")
            .with("uuid", () => "uuid()")
            .otherwise(() => "");

        if (chain) {
            validations.push(chain);
        }
    }

    return validations.join(".");
};

const getZodChainableNumberValidations = (schema: SchemaObject) => {
    const validations: string[] = [];

    if (schema.type === "integer") {
        validations.push("int()");
    }

    if (schema.minimum) {
        if (schema.exclusiveMinimum) {
            validations.push(`gt(${schema.minimum})`);
        } else {
            validations.push(`gte(${schema.minimum})`);
        }
    } else if (typeof schema.exclusiveMinimum === "number") {
        validations.push(`gt(${schema.exclusiveMinimum})`);
    }

    if (schema.maximum) {
        if (schema.exclusiveMaximum) {
            validations.push(`lt(${schema.maximum})`);
        } else {
            validations.push(`lte(${schema.maximum})`);
        }
    } else if (typeof schema.exclusiveMaximum === "number") {
        validations.push(`lt(${schema.exclusiveMaximum})`);
    }

    if (schema.multipleOf) {
        validations.push(`multipleOf(${schema.multipleOf})`);
    }

    return validations.join(".");
};

const getZodChainableArrayValidations = (schema: SchemaObject) => {
    const validations: string[] = [];

    if (schema.minItems && schema.maxItems) {
        validations.push(`length(${schema.minItems})`);
    } else if (schema.minItems) {
        validations.push(`min(${schema.minItems})`);
    } else if (schema.maxItems) {
        validations.push(`max(${schema.maxItems})`);
    }

    return validations.join(".");
};

type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
type PrimitiveType = typeof primitiveTypeList[number];

export class CodeMeta {
    private code?: string;
    ref?: string;

    children: CodeMeta[] = [];
    meta: DefinedCodeMetaData;

    constructor(
        public schema: SchemaObject | ReferenceObject,
        public ctx?: ConversionTypeContext,
        meta: CodeMetaData = {}
    ) {
        if (isReferenceObject(schema)) {
            this.ref = schema.$ref;
        }

        // @ts-expect-error
        this.meta = { ...meta };
        this.meta.referencedBy = [...(meta?.referencedBy ?? [])];

        if (this.ref) {
            this.meta.referencedBy.push(this);
        }
    }

    get codeString(): string {
        if (this.code) return this.code;

        return getRefName(this.ref!);
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

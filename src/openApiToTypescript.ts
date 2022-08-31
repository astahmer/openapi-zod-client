import { isReferenceObject, ReferenceObject, SchemaObject } from "openapi3-ts";
import { t, ts } from "tanu";
import { TypeDefinition, TypeDefinitionObject } from "tanu/dist/type";
import { normalizeString } from "./tokens";

interface TsConversionArgs {
    schema: SchemaObject | ReferenceObject;
    ctx?: TsConversionContext;
    meta?: { name?: string; $ref?: string; isInline?: boolean };
}

export interface TsConversionContext {
    nodeByRef: Record<string, ts.Node>;
    getSchemaByRef: (ref: string) => SchemaObject | ReferenceObject;
    rootRef?: string;
    visitedsRefs?: Record<string, boolean>;
}

export const getTypescriptFromOpenApi = ({
    schema,
    meta: inheritedMeta,
    ctx,
}: TsConversionArgs): ts.Node | TypeDefinitionObject | (string | ({} & `@type__${string}`)) => {
    const meta = {} as TsConversionArgs["meta"];
    const isInline = !inheritedMeta?.name;

    if (ctx?.visitedsRefs && inheritedMeta?.$ref) {
        ctx.rootRef = inheritedMeta.$ref;
        ctx.visitedsRefs[inheritedMeta.$ref] = true;
    }

    if (!schema) {
        throw new Error("Schema is required");
    }

    let canBeWrapped = !isInline;
    const getTs = (): ts.Node | TypeDefinitionObject | (string | ({} & `@type__${string}`)) => {
        if (isReferenceObject(schema)) {
            if (!ctx?.visitedsRefs) throw new Error("Context is required for OpenAPI $ref");

            let result = ctx.nodeByRef[schema.$ref];
            const typeRefToken = `@type__${schema.$ref}`;
            if (ctx.visitedsRefs[schema.$ref]) {
                return typeRefToken;
            }

            if (!result) {
                const actualSchema = ctx.getSchemaByRef(schema.$ref);
                if (!actualSchema) {
                    throw new Error(`Schema ${schema.$ref} not found`);
                }

                ctx.visitedsRefs[schema.$ref] = true;
                result = getTypescriptFromOpenApi({ schema: actualSchema, meta, ctx }) as ts.Node;
            }

            return typeRefToken;
        }

        if (schema.oneOf) {
            if (schema.oneOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.oneOf[0], ctx, meta });
            }

            return t.union(
                schema.oneOf.map((prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta }) as TypeDefinition)
            );
        }

        // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
        if (schema.anyOf) {
            if (schema.anyOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.anyOf[0], ctx, meta });
            }

            const oneOf = t.union(
                schema.anyOf.map((prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta }) as TypeDefinition)
            );
            return t.union([oneOf, t.array(oneOf)]);
        }

        if (schema.allOf) {
            if (schema.allOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.allOf[0], ctx, meta });
            }

            const types = schema.allOf.map(
                (prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta }) as TypeDefinition
            );
            return t.intersection(types);
        }

        if (!schema.type) return t.unknown();

        if (isPrimitiveType(schema.type)) {
            if (schema.enum) {
                return t.union(schema.enum);
            }

            if (schema.type === "string") return t.string();
            if (schema.type === "boolean") return t.boolean();
            if (schema.type === "number" || schema.type === "integer") return t.number();
            if (schema.type === "null") return t.reference("null");
        }

        if (schema.type === "array") {
            if (schema.items) {
                let arrayOfType = getTypescriptFromOpenApi({ schema: schema.items, ctx, meta }) as TypeDefinition;
                if (typeof arrayOfType === "string") {
                    if (!ctx) throw new Error("Context is required for circular $ref (recursive schemas)");
                    arrayOfType = t.reference(arrayOfType.replace("@type__", "").split("/").at(-1)!);
                }

                return t.array(arrayOfType);
            }
            return t.array(t.any());
        }

        if (schema.type === "object") {
            if (!schema.properties) {
                return {};
            }

            canBeWrapped = false;

            const isPartial = !schema.required?.length;
            let additionalProperties;
            if (schema.additionalProperties) {
                let additionalPropertiesType;
                if (
                    (typeof schema.additionalProperties === "boolean" && schema.additionalProperties) ||
                    (typeof schema.additionalProperties === "object" &&
                        Object.keys(schema.additionalProperties).length === 0)
                ) {
                    additionalPropertiesType = t.any();
                } else if (typeof schema.additionalProperties === "object") {
                    additionalPropertiesType = getTypescriptFromOpenApi({
                        schema: schema.additionalProperties,
                        ctx,
                        meta,
                    });
                }

                additionalProperties = ts.factory.createTypeLiteralNode([
                    ts.factory.createIndexSignature(
                        undefined,
                        [
                            ts.factory.createParameterDeclaration(
                                undefined,
                                undefined,
                                ts.factory.createIdentifier("key"),
                                undefined,
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                                undefined
                            ),
                        ],
                        additionalPropertiesType as ts.TypeNode
                    ),
                ]);
            }

            const props = Object.fromEntries(
                Object.entries(schema.properties!).map(([prop, propSchema]) => {
                    let propType = getTypescriptFromOpenApi({ schema: propSchema, ctx, meta }) as TypeDefinition;
                    if (typeof propType === "string") {
                        if (!ctx) throw new Error("Context is required for circular $ref (recursive schemas)");
                        // TODO Partial ?
                        propType = t.reference(propType.replace("@type__", "").split("/").at(-1)!);
                    }

                    const isRequired = isPartial ? true : schema.required?.includes(prop);
                    return [normalizeString(prop), isRequired ? propType : t.optional(propType)];
                })
            );

            const objectType = additionalProperties ? t.intersection([props, additionalProperties]) : props;

            if (isInline) {
                return isPartial ? t.reference("Partial", [objectType]) : objectType;
            }

            if (!inheritedMeta?.name) {
                throw new Error("Name is required to convert an object schema to a type reference");
            }

            const base = t.type(inheritedMeta.name, objectType);
            if (!isPartial) return base;

            return t.type(inheritedMeta.name, t.reference("Partial", [objectType]));
        }

        throw new Error(`Unsupported schema type: ${schema.type}`);
    };

    const tsResult = getTs();
    return canBeWrapped
        ? wrapTypeIfInline({ isInline, name: inheritedMeta?.name, typeDef: tsResult as TypeDefinition })
        : tsResult;
};
type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
type PrimitiveType = typeof primitiveTypeList[number];

const wrapTypeIfInline = ({
    isInline,
    name,
    typeDef,
}: {
    isInline: boolean;
    name: string | undefined;
    typeDef: t.TypeDefinition;
}) => {
    if (!isInline) {
        if (!name) {
            throw new Error("Name is required to convert a schema to a type reference");
        }

        return t.type(name, typeDef);
    }

    return typeDef as ts.Node;
};

import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { t, ts } from "tanu";
import type { TypeDefinition, TypeDefinitionObject } from "tanu/dist/type";

import { isReferenceObject } from "./isReferenceObject";
import type { DocumentResolver } from "./makeSchemaResolver";
import type { TemplateContext } from "./template-context";
import { wrapWithQuotesIfNeeded } from "./utils";
import { inferRequiredSchema } from "./inferRequiredOnly";
import generateJSDocArray from "./generateJSDocArray";

type TsConversionArgs = {
    schema: SchemaObject | ReferenceObject;
    ctx?: TsConversionContext | undefined;
    meta?: { name?: string; $ref?: string; isInline?: boolean } | undefined;
    options?: TemplateContext["options"];
};

export type TsConversionContext = {
    nodeByRef: Record<string, ts.Node>;
    resolver: DocumentResolver;
    rootRef?: string;
    visitedsRefs?: Record<string, boolean>;
};

type MaybeWrapReadOnlyType =
    | ts.TypeNode
    | {
          [k: string]:
              | number
              | bigint
              | boolean
              | TypeDefinitionObject
              | ts.TypeNode
              | ts.TypeAliasDeclaration
              | ts.InterfaceDeclaration
              | ts.EnumDeclaration;
      };

const wrapReadOnly =
    (options: TemplateContext["options"]) =>
    (theType: MaybeWrapReadOnlyType): MaybeWrapReadOnlyType => {
        if (options?.allReadonly) {
            return t.readonly(theType);
        }

        return theType;
    };

const handleDefaultValue = (schema: SchemaObject, node: ts.TypeNode | TypeDefinitionObject | string) => {
    return schema.default !== undefined ? t.union([node, t.reference("undefined")]) : node;
};

export const getTypescriptFromOpenApi = ({
    schema,
    meta: inheritedMeta,
    ctx,
    options,
}: // eslint-disable-next-line sonarjs/cognitive-complexity
TsConversionArgs): ts.Node | TypeDefinitionObject | string => {
    const meta = {} as TsConversionArgs["meta"];
    const isInline = !inheritedMeta?.name;

    const doWrapReadOnly = wrapReadOnly(options);

    if (ctx?.visitedsRefs && inheritedMeta?.$ref) {
        ctx.rootRef = inheritedMeta.$ref;
        ctx.visitedsRefs[inheritedMeta.$ref] = true;
    }

    if (!schema) {
        throw new Error("Schema is required");
    }

    let canBeWrapped = !isInline;
    const getTs = (): ts.Node | TypeDefinitionObject | string => {
        if (isReferenceObject(schema)) {
            if (!ctx?.visitedsRefs || !ctx?.resolver) throw new Error("Context is required for OpenAPI $ref");

            let result = ctx.nodeByRef[schema.$ref];
            let schemaName = ctx.resolver.resolveRef(schema.$ref)?.normalized;
            if (ctx.visitedsRefs[schema.$ref]) {
                return t.reference(schemaName);
            }

            let actualSchema: SchemaObject | undefined;
            if (!result) {
                actualSchema = ctx.resolver.getSchemaByRef(schema.$ref);
                if (!actualSchema) {
                    throw new Error(`Schema ${schema.$ref} not found`);
                }

                ctx.visitedsRefs[schema.$ref] = true;
                result = getTypescriptFromOpenApi({ schema: actualSchema, meta, ctx, options }) as ts.Node;
            }

            if (!schemaName) {
                schemaName = ctx.resolver.resolveRef(schema.$ref)?.normalized;
            }

            return actualSchema?.nullable
                ? t.union([t.reference(schemaName), t.reference("null")])
                : t.reference(schemaName);
        }

        if (Array.isArray(schema.type)) {
            if (schema.type.length === 1) {
                return getTypescriptFromOpenApi({
                    schema: { ...schema, type: schema.type[0]! },
                    ctx,
                    meta,
                    options,
                });
            }

            const types = schema.type.map(
                (prop) =>
                    getTypescriptFromOpenApi({
                        schema: { ...schema, type: prop },
                        ctx,
                        meta,
                        options,
                    }) as TypeDefinition
            );

            return handleDefaultValue(
                schema,
                schema.nullable ? t.union([...types, t.reference("null")]) : t.union(types)
            );
        }

        if (schema.type === "null") {
            return t.reference("null");
        }

        if (schema.oneOf) {
            if (schema.oneOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.oneOf[0]!, ctx, meta, options });
            }

            const types = schema.oneOf.map(
                (prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta, options }) as TypeDefinition
            );

            return handleDefaultValue(
                schema,
                schema.nullable ? t.union([...types, t.reference("null")]) : t.union(types)
            );
        }

        // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
        if (schema.anyOf) {
            if (schema.anyOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.anyOf[0]!, ctx, meta, options });
            }

            const oneOf = t.union(
                schema.anyOf.map(
                    (prop) => getTypescriptFromOpenApi({ schema: prop, ctx, meta, options }) as TypeDefinition
                )
            );

            return handleDefaultValue(
                schema,
                schema.nullable
                    ? t.union([oneOf, doWrapReadOnly(t.array(oneOf)), t.reference("null")])
                    : t.union([oneOf, doWrapReadOnly(t.array(oneOf))])
            );
        }

        if (schema.allOf) {
            if (schema.allOf.length === 1) {
                return getTypescriptFromOpenApi({ schema: schema.allOf[0]!, ctx, meta, options });
            }

            const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } =
                inferRequiredSchema(schema);

            const types = noRequiredOnlyAllof.map((prop) => {
                const type = getTypescriptFromOpenApi({ schema: prop, ctx, meta, options }) as TypeDefinition;
                ctx?.resolver && patchRequiredSchemaInLoop(prop, ctx.resolver);
                return type;
            });

            if (Object.keys(composedRequiredSchema.properties).length > 0) {
                types.push(
                    getTypescriptFromOpenApi({
                        schema: composedRequiredSchema,
                        ctx,
                        meta,
                        options,
                    }) as TypeDefinition
                );
            }

            return handleDefaultValue(
                schema,
                schema.nullable ? t.union([t.intersection(types), t.reference("null")]) : t.intersection(types)
            );
        }

        const schemaType = schema.type ? (schema.type.toLowerCase() as NonNullable<typeof schema.type>) : undefined;
        if (schemaType && isPrimitiveType(schemaType)) {
            if (schema.enum) {
                if (schemaType !== "string" && schema.enum.some((e) => typeof e === "string")) {
                    return handleDefaultValue(
                        schema,
                        schema.nullable ? t.union([t.never(), t.reference("null")]) : t.never()
                    );
                }

                const hasNull = schema.enum.includes(null);
                const withoutNull = schema.enum.filter((f) => f !== null);
                return handleDefaultValue(
                    schema,
                    schema.nullable || hasNull ? t.union([...withoutNull, t.reference("null")]) : t.union(withoutNull)
                );
            }

            if (schemaType === "string")
                return schema.nullable ? t.union([t.string(), t.reference("null")]) : t.string();
            if (schemaType === "boolean")
                return schema.nullable ? t.union([t.boolean(), t.reference("null")]) : t.boolean();
            if (schemaType === "number" || schemaType === "integer")
                return schema.nullable ? t.union([t.number(), t.reference("null")]) : t.number();
        }

        if (schemaType === "array") {
            if (schema.items) {
                let arrayOfType = getTypescriptFromOpenApi({
                    schema: schema.items,
                    ctx,
                    meta,
                    options,
                }) as TypeDefinition;
                if (typeof arrayOfType === "string") {
                    if (!ctx) throw new Error("Context is required for circular $ref (recursive schemas)");
                    arrayOfType = t.reference(arrayOfType);
                }

                return handleDefaultValue(
                    schema,
                    schema.nullable
                        ? t.union([doWrapReadOnly(t.array(arrayOfType)), t.reference("null")])
                        : doWrapReadOnly(t.array(arrayOfType))
                );
            }

            return handleDefaultValue(
                schema,
                schema.nullable
                    ? t.union([doWrapReadOnly(t.array(t.any())), t.reference("null")])
                    : doWrapReadOnly(t.array(t.any()))
            );
        }

        if (schemaType === "object" || schema.properties || schema.additionalProperties) {
            if (!schema.properties) {
                return handleDefaultValue(schema, schema.nullable ? t.union([{}, t.reference("null")]) : {});
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
                        options,
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
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
                            ),
                        ],
                        additionalPropertiesType as ts.TypeNode
                    ),
                ]);
            }

            const props = Object.fromEntries(
                Object.entries(schema.properties).map(([prop, propSchema]) => {
                    let propType = getTypescriptFromOpenApi({
                        schema: propSchema,
                        ctx,
                        meta,
                        options,
                    }) as TypeDefinition;
                    if (typeof propType === "string") {
                        if (!ctx) throw new Error("Context is required for circular $ref (recursive schemas)");
                        // TODO Partial ?
                        propType = t.reference(propType);
                    }

                    const isRequired = Boolean(isPartial ? true : schema.required?.includes(prop));
                    const hasDefault = "default" in propSchema ? propSchema.default !== undefined : false;
                    return [
                        `${wrapWithQuotesIfNeeded(prop)}`,
                        isRequired && !hasDefault ? propType : t.optional(propType),
                    ];
                })
            );

            const objectType = additionalProperties ? t.intersection([props, additionalProperties]) : props;

            if (isInline) {
                const buffer = isPartial
                    ? t.reference("Partial", [doWrapReadOnly(objectType)])
                    : doWrapReadOnly(objectType);
                return schema.nullable ? t.union([buffer, t.reference("null")]) : buffer;
            }

            if (!inheritedMeta?.name) {
                throw new Error("Name is required to convert an object schema to a type reference");
            }

            if (!isPartial) {
                return t.type(inheritedMeta.name, doWrapReadOnly(objectType));
            }

            return schema.nullable
                ? t.union([t.type(inheritedMeta.name, doWrapReadOnly(objectType)), t.reference("null")])
                : t.type(inheritedMeta.name, t.reference("Partial", [doWrapReadOnly(objectType)]));
        }

        if (!schemaType) return t.unknown();
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unsupported schema type: ${schemaType}`);
    };

    let tsResult = getTs();

    // Add JSDoc comments
    if (options?.withDocs && !isReferenceObject(schema)) {
        const jsDocComments = generateJSDocArray(schema);

        if (
            jsDocComments.length > 0 &&
            typeof tsResult === "object" &&
            tsResult.kind !== ts.SyntaxKind.TypeAliasDeclaration
        ) {
            tsResult = t.comment(tsResult, jsDocComments);
        }
    }

    return canBeWrapped
        ? wrapTypeIfInline({ isInline, name: inheritedMeta?.name, typeDef: tsResult as TypeDefinition })
        : tsResult;
};

type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
type PrimitiveType = (typeof primitiveTypeList)[number];

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

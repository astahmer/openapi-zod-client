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
        if (schema.type === "null") return ts.factory.createNull();
    }

    if (schema.type === "array") {
        if (schema.items) {
            let arrayOfType = getTypescriptFromOpenApi({ schema: schema.items, ctx, meta }) as TypeDefinition;
            if (typeof arrayOfType === "string") {
                if (!ctx) throw new Error("Context is required for circular $ref");
                arrayOfType = t.reference(arrayOfType.replace("@type__", "").split("/").at(-1)!);
            }

            return t.array(arrayOfType);
        }
        return t.array(t.any());
    }

    if (schema.type === "object") {
        if (!schema.properties) {
            if (isInline) {
                return {};
            }

            if (!inheritedMeta?.name) {
                throw new Error("Name is required to convert an empty object schema to an interface");
            }

            return t.type(inheritedMeta.name, {});
        }

        const isPartial = !schema.required?.length;
        const props = Object.fromEntries(
            Object.entries(schema.properties!).map(([prop, propSchema]) => {
                let propType = getTypescriptFromOpenApi({ schema: propSchema, ctx, meta }) as TypeDefinition;
                if (typeof propType === "string") {
                    if (!ctx) throw new Error("Context is required for circular $ref");
                    // TODO Partial ?
                    propType = t.reference(propType.replace("@type__", "").split("/").at(-1)!);
                }

                const isRequired = isPartial ? true : schema.required?.includes(prop);
                return [normalizeString(prop), isRequired ? propType : t.optional(propType)];
            })
        );

        if (isInline) {
            return isPartial ? t.reference("Partial", [props]) : props;
        }

        if (!inheritedMeta?.name) {
            throw new Error("Name is required to convert an object schema to an interface");
        }

        // let additionalProps = "";
        // TODO
        // if (
        //     (typeof schema.additionalProperties === "boolean" && schema.additionalProperties) ||
        //     (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length === 0)
        // ) {
        //     additionalProps = ".passthrough()";
        // } else if (typeof schema.additionalProperties === "object") {
        //     // TODO maybe z.lazy
        //     return (
        //         `z.record(${getTypescriptFromOpenApi(schema.additionalProperties)})`
        //     );
        // }

        const base = t.type(inheritedMeta.name, props);
        if (!isPartial) return base;

        return t.type(inheritedMeta.name, t.reference("Partial", [props]));
    }

    throw new Error(`Unsupported schema type: ${schema.type}`);
};
type SingleType = Exclude<SchemaObject["type"], any[] | undefined>;
const isPrimitiveType = (type: SingleType): type is PrimitiveType => primitiveTypeList.includes(type as any);

const primitiveTypeList = ["string", "number", "integer", "boolean", "null"] as const;
type PrimitiveType = typeof primitiveTypeList[number];

// https://cs.github.com/leancodepl/contractsgenerator-typescript/blob/c897eaab9dfa3bc0c08a67322759c94b3b0326b0/src/typesGeneration/types/GeneratorKnownType.ts?q=createIdentifier%28%22Partial%22%29#L14
// t.reference(ts.factory.createIdentifier("Partial"), [
//     t.reference(ts.factory.createIdentifier("Record"), [
//         ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
//         ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
//     ]),
// ])

import type { ReferenceObject, SchemaObject } from "openapi3-ts";
import { getSum } from "pastable/server";
import { match } from "ts-pattern";

import { isReferenceObject } from "./isReferenceObject";
import type { PrimitiveType } from "./utils";
import { isPrimitiveType } from "./utils";

type CompositeType = "oneOf" | "anyOf" | "allOf" | "enum" | "array" | "empty-object" | "object" | "record";
const complexityByType = (schema: SchemaObject & { type: PrimitiveType }) => {
    const type = schema.type;
    if (!type) return 0;

    return match(type)
        .with("string", () => 1)
        .with("number", () => 1)
        .with("integer", () => 1)
        .with("boolean", () => 1)
        .with("null", () => 1)
        .otherwise(() => 0);
};

const complexityByComposite = (from?: CompositeType | undefined) => {
    if (!from) return 0;

    return match(from)
        .with("oneOf", () => 2)
        .with("anyOf", () => 3)
        .with("allOf", () => 2)
        .with("enum", () => 1)
        .with("array", () => 1)
        .with("record", () => 1)
        .with("empty-object", () => 1)
        .with("object", () => 2)
        .otherwise(() => 0);
};

export function getSchemaComplexity({
    current,
    schema,
}: {
    current: number;
    schema: SchemaObject | ReferenceObject | undefined;
}): number {
    if (!schema) return current;
    if (isReferenceObject(schema)) return current + 2;

    if (schema.oneOf) {
        if (schema.oneOf.length === 1) {
            return complexityByComposite("oneOf") + getSchemaComplexity({ current, schema: schema.oneOf[0] });
        }

        return (
            current +
            complexityByComposite("oneOf") +
            getSum(schema.oneOf.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        if (schema.anyOf.length === 1) {
            return complexityByComposite("anyOf") + getSchemaComplexity({ current, schema: schema.anyOf[0] });
        }

        return (
            current +
            complexityByComposite("anyOf") +
            getSum(schema.anyOf.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
        );
    }

    if (schema.allOf) {
        if (schema.allOf.length === 1) {
            return complexityByComposite("allOf") + getSchemaComplexity({ current, schema: schema.allOf[0] });
        }

        return (
            current +
            complexityByComposite("allOf") +
            getSum(schema.allOf.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
        );
    }

    if (!schema.type) return current;

    if (isPrimitiveType(schema.type)) {
        if (schema.enum) {
            return (
                current +
                complexityByType(schema as SchemaObject & { type: PrimitiveType }) +
                complexityByComposite("enum") +
                getSum(schema.enum.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
            );
        }

        return current + complexityByType(schema as SchemaObject & { type: PrimitiveType });
    }

    if (schema.type === "array") {
        if (schema.items) {
            return complexityByComposite("array") + getSchemaComplexity({ current, schema: schema.items });
        }

        return complexityByComposite("array") + getSchemaComplexity({ current, schema: undefined });
    }

    if (schema.type === "object" || schema.properties || schema.additionalProperties) {
        if (schema.additionalProperties) {
            if (schema.additionalProperties === true) {
                return complexityByComposite("record") + getSchemaComplexity({ current, schema: undefined });
            }

            return (
                complexityByComposite("record") + getSchemaComplexity({ current, schema: schema.additionalProperties })
            );
        }

        if (schema.properties) {
            const props = Object.values(schema.properties);

            return (
                current +
                complexityByComposite("object") +
                getSum(props.map((prop) => getSchemaComplexity({ current: 0, schema: prop })))
            );
        }

        return complexityByComposite("empty-object") + getSchemaComplexity({ current, schema: undefined });
    }

    return current;
}

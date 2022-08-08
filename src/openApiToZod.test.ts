import { SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getZodType, getZodTypeAsString, getZodTypeWithChainableAsString, singleTypes } from "./openApiToZod";

const makeSchema = (schema: SchemaObject) => schema;

test("getZodTypeAsString", () => {
    expect(getZodTypeAsString(makeSchema({ type: "null" }))).toMatchInlineSnapshot('"z.null()"');
    expect(getZodTypeAsString(makeSchema({ type: "boolean" }))).toMatchInlineSnapshot('"z.boolean()"');
    expect(getZodTypeAsString(makeSchema({ type: "string" }))).toMatchInlineSnapshot('"z.string()"');
    expect(getZodTypeAsString(makeSchema({ type: "number" }))).toMatchInlineSnapshot('"z.number()"');
    expect(getZodTypeAsString(makeSchema({ type: "integer" }))).toMatchInlineSnapshot('"z.bigint()"');

    expect(getZodTypeAsString(makeSchema({ type: "array", items: { type: "string" } }))).toMatchInlineSnapshot(
        '"z.array(z.string())"'
    );
    expect(getZodTypeAsString(makeSchema({ type: "object" }))).toMatchInlineSnapshot('"z.object(z.any()).partial()"');
    expect(
        getZodTypeAsString(makeSchema({ type: "object", properties: { str: { type: "string" } } }))
    ).toMatchInlineSnapshot('"z.object({ str: z.string() }).partial()"');
    expect(
        getZodTypeAsString(
            makeSchema({ type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } })
        )
    ).toMatchInlineSnapshot('"z.object({ str: z.string(), nb: z.number() }).partial()"');

    expect(
        getZodTypeAsString(
            makeSchema({
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: {
                        type: "object",
                        properties: {
                            nested_prop: { type: "boolean" },
                        },
                    },
                },
            })
        )
    ).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), nb: z.number(), nested: z.object({ nested_prop: z.boolean() }).partial() }).partial()"'
    );

    expect(
        getZodTypeAsString(
            makeSchema({
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        str: { type: "string" },
                    },
                },
            })
        )
    ).toMatchInlineSnapshot('"z.array(z.object({ str: z.string() }).partial())"');

    expect(
        getZodTypeAsString(
            makeSchema({
                type: "array",
                items: {
                    type: "array",
                    items: {
                        type: "string",
                    },
                },
            })
        )
    ).toMatchInlineSnapshot('"z.array(z.array(z.string()))"');

    expect(
        getZodTypeAsString(
            makeSchema({
                type: "object",
                properties: {
                    union: { oneOf: [{ type: "string" }, { type: "number" }] },
                },
            })
        )
    ).toMatchInlineSnapshot('"z.object({ union: z.union([z.string(), z.number()]) }).partial()"');

    expect(
        getZodTypeAsString(
            makeSchema({
                type: "object",
                properties: {
                    unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
                },
            })
        )
    ).toMatchInlineSnapshot(
        '"z.object({ unionOrArrayOfUnion: z.union([z.union([z.string(), z.number()]), z.array(z.union([z.string(), z.number()]))]) }).partial()"'
    );

    expect(
        getZodTypeAsString(
            makeSchema({
                type: "object",
                properties: {
                    intersection: { allOf: [{ type: "string" }, { type: "number" }] },
                },
            })
        )
    ).toMatchInlineSnapshot('"z.object({ intersection: z.string().and(z.number()) }).partial()"');

    expect(getZodTypeAsString(makeSchema({ type: "string", enum: ["aaa", "bbb", "ccc"] }))).toMatchInlineSnapshot(
        '"z.enum(["aaa", "bbb", "ccc"])"'
    );
    expect(getZodTypeAsString(makeSchema({ type: "number", enum: [1, 2, 3, null] }))).toMatchInlineSnapshot('"z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal(null)])"');
});

test("getZodTypeWithChainableAsString", () => {
    expect(getZodTypeWithChainableAsString(makeSchema({ type: "string", nullable: true }))).toMatchInlineSnapshot(
        '"z.string().nullish()"'
    );
    expect(getZodTypeWithChainableAsString(makeSchema({ type: "string", nullable: false }))).toMatchInlineSnapshot(
        '"z.string().optional()"'
    );

    expect(
        getZodTypeWithChainableAsString(makeSchema({ type: "string", nullable: false }), { isRequired: true })
    ).toMatchInlineSnapshot('"z.string()"');
    expect(
        getZodTypeWithChainableAsString(makeSchema({ type: "string", nullable: true }), { isRequired: true })
    ).toMatchInlineSnapshot('"z.string().nullable()"');
});

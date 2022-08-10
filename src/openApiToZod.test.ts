import { SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { CodeMeta, CodeMetaData, ConversionTypeContext, getZodSchema, getZodSchemaWithChainable } from "./openApiToZod";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject) => getZodSchema({ schema: makeSchema(schema) }).toString();
const getSchemaWithChainableAsZodString = (schema: SchemaObject, meta?: CodeMetaData) =>
    getZodSchemaWithChainable({ schema: makeSchema(schema), meta }).toString();

test("getSchemaAsZodString", () => {
    expect(getSchemaAsZodString({ type: "null" })).toMatchInlineSnapshot('"z.null()"');
    expect(getSchemaAsZodString({ type: "boolean" })).toMatchInlineSnapshot('"z.boolean()"');
    expect(getSchemaAsZodString({ type: "string" })).toMatchInlineSnapshot('"z.string()"');
    expect(getSchemaAsZodString({ type: "number" })).toMatchInlineSnapshot('"z.number()"');
    expect(getSchemaAsZodString({ type: "integer" })).toMatchInlineSnapshot('"z.bigint()"');

    expect(getSchemaAsZodString({ type: "array", items: { type: "string" } })).toMatchInlineSnapshot(
        '"z.array(z.string())"'
    );
    expect(getSchemaAsZodString({ type: "object" })).toMatchInlineSnapshot('"z.object({}).partial()"');
    expect(getSchemaAsZodString({ type: "object", properties: { str: { type: "string" } } })).toMatchInlineSnapshot(
        '"z.object({ str: z.string() }).partial()"'
    );
    expect(
        getSchemaAsZodString({ type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } })
    ).toMatchInlineSnapshot('"z.object({ str: z.string(), nb: z.number() }).partial()"');

    expect(
        getSchemaAsZodString({
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
    ).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), nb: z.number(), nested: z.object({ nested_prop: z.boolean() }).partial() }).partial()"'
    );

    expect(
        getSchemaAsZodString({
            type: "array",
            items: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        })
    ).toMatchInlineSnapshot('"z.array(z.object({ str: z.string() }).partial())"');

    expect(
        getSchemaAsZodString({
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        })
    ).toMatchInlineSnapshot('"z.array(z.array(z.string()))"');

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                union: { oneOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ union: z.union([z.string(), z.number()]) }).partial()"');

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot(
        '"z.object({ unionOrArrayOfUnion: z.union([z.union([z.string(), z.number()]), z.array(z.union([z.string(), z.number()]))]) }).partial()"'
    );

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                intersection: { allOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ intersection: z.string().and(z.number()) }).partial()"');

    expect(getSchemaAsZodString({ type: "string", enum: ["aaa", "bbb", "ccc"] })).toMatchInlineSnapshot(
        '"z.enum(["aaa", "bbb", "ccc"])"'
    );
    expect(getSchemaAsZodString({ type: "number", enum: [1, 2, 3, null] })).toMatchInlineSnapshot(
        '"z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal(null)])"'
    );
});

test("getSchemaWithChainableAsZodString", () => {
    expect(getSchemaWithChainableAsZodString({ type: "string", nullable: true })).toMatchInlineSnapshot(
        '"z.string().nullish()"'
    );
    expect(getSchemaWithChainableAsZodString({ type: "string", nullable: false })).toMatchInlineSnapshot(
        '"z.string().optional()"'
    );

    expect(
        getSchemaWithChainableAsZodString({ type: "string", nullable: false }, { isRequired: true })
    ).toMatchInlineSnapshot('"z.string()"');
    expect(
        getSchemaWithChainableAsZodString({ type: "string", nullable: true }, { isRequired: true })
    ).toMatchInlineSnapshot('"z.string().nullable()"');
});

test("CodeMeta", () => {
    const schemas = {
        Example: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
            },
        },
    };
    const ctx: ConversionTypeContext = {
        getSchemaByRef: (ref) => schemas[ref],
        zodSchemaByHash: {},
        schemaHashByRef: {},
        hashByVariableName: {},
        variableByHash: {},
    };

    const code = getZodSchema({
        schema: makeSchema({
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "Example",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
            },
        }),
        ctx,
    });
    expect(code.toString()).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), reference: @ref__PLOvhOYyFZ__, inline: z.object({ nested_prop: z.boolean() }).partial() }).partial()"'
    );
    expect(code.traverse()).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), reference: z.object({ exampleProp: z.string(), another: z.number() }).partial().optional(), inline: z.object({ nested_prop: z.boolean() }).partial() }).partial()"'
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "getSchemaByRef": [Function],
          "hashByVariableName": {},
          "schemaHashByRef": {
              "Example": "@ref__PLOvhOYyFZ__",
          },
          "variableByHash": {},
          "zodSchemaByHash": {
              "@ref__PLOvhOYyFZ__": "z.object({ exampleProp: z.string(), another: z.number() }).partial().optional()",
          },
      }
    `);
});

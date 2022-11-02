import type { SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getZodSchema } from "./openApiToZod";
import type { CodeMetaData, ConversionTypeContext } from "./CodeMeta";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject, meta?: CodeMetaData | undefined) =>
    getZodSchema({ schema: makeSchema(schema), meta }).toString();

test("getSchemaAsZodString", () => {
    expect(getSchemaAsZodString({ type: "null" })).toMatchInlineSnapshot('"z.null()"');
    expect(getSchemaAsZodString({ type: "boolean" })).toMatchInlineSnapshot('"z.boolean()"');
    expect(getSchemaAsZodString({ type: "string" })).toMatchInlineSnapshot('"z.string()"');
    expect(getSchemaAsZodString({ type: "number" })).toMatchInlineSnapshot('"z.number()"');
    expect(getSchemaAsZodString({ type: "integer" })).toMatchInlineSnapshot('"z.number()"');

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
    expect(getSchemaAsZodString({ type: "string", nullable: true })).toMatchInlineSnapshot('"z.string()"');
    expect(getSchemaAsZodString({ type: "string", nullable: false })).toMatchInlineSnapshot('"z.string()"');

    expect(getSchemaAsZodString({ type: "string", nullable: false }, { isRequired: true })).toMatchInlineSnapshot(
        '"z.string()"'
    );
    expect(getSchemaAsZodString({ type: "string", nullable: true }, { isRequired: true })).toMatchInlineSnapshot(
        '"z.string()"'
    );
});

test("CodeMeta with ref", () => {
    const ctx: ConversionTypeContext = { getSchemaByRef: () => null as any, zodSchemaByName: {}, schemaByName: {} };

    expect(() =>
        getZodSchema({
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
        })
    ).toThrowErrorMatchingInlineSnapshot('"Schema Example not found"');
});

test("CodeMeta with missing ref", () => {
    const schemas = {
        Example: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
            },
        },
    } as Record<string, SchemaObject>;
    const ctx: ConversionTypeContext = {
        getSchemaByRef: (ref) => schemas[ref]!,
        zodSchemaByName: {},
        schemaByName: {},
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
        '"z.object({ str: z.string(), reference: Example, inline: z.object({ nested_prop: z.boolean() }).partial() }).partial()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "Example",
          "z.object({ nested_prop: z.boolean() }).partial()",
      ]
    `);
});

test("CodeMeta with nested refs", () => {
    const schemas = {
        Basic: { type: "object", properties: { prop: { type: "string" }, second: { type: "number" } } },
        WithNested: { type: "object", properties: { nested: { type: "string" }, nestedRef: { $ref: "DeepNested" } } },
        ObjectWithArrayOfRef: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
                link: { type: "array", items: { $ref: "WithNested" } },
                someReference: { $ref: "Basic" },
            },
        },
        DeepNested: { type: "object", properties: { deep: { type: "boolean" } } },
    } as Record<string, SchemaObject>;
    const ctx: ConversionTypeContext = {
        getSchemaByRef: (ref) => schemas[ref]!,
        zodSchemaByName: {},
        schemaByName: {},
    };

    const code = getZodSchema({
        schema: makeSchema({
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "ObjectWithArrayOfRef",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
                another: { $ref: "WithNested" },
                basic: { $ref: "Basic" },
                differentPropSameRef: { $ref: "Basic" },
            },
        }),
        ctx,
    });
    expect(code.toString()).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), reference: ObjectWithArrayOfRef, inline: z.object({ nested_prop: z.boolean() }).partial(), another: WithNested, basic: Basic, differentPropSameRef: Basic }).partial()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "ObjectWithArrayOfRef",
          "z.object({ nested_prop: z.boolean() }).partial()",
          "WithNested",
          "Basic",
          "Basic",
      ]
    `);
    expect(ctx).toMatchInlineSnapshot(`
      {
          "getSchemaByRef": [Function],
          "schemaByName": {},
          "zodSchemaByName": {
              "Basic": "z.object({ prop: z.string(), second: z.number() }).partial()",
              "DeepNested": "z.object({ deep: z.boolean() }).partial()",
              "ObjectWithArrayOfRef": "z.object({ exampleProp: z.string(), another: z.number(), link: z.array(WithNested), someReference: Basic }).partial()",
              "WithNested": "z.object({ nested: z.string(), nestedRef: DeepNested }).partial()",
          },
      }
    `);
});

import { SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { CodeMetaData, ConversionTypeContext, getZodSchema } from "./openApiToZod";
import { tokens } from "./tokens";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject, meta?: CodeMetaData) =>
    getZodSchema({ schema: makeSchema(schema), meta }).toString();

test("getSchemaAsZodString", () => {
    expect(getSchemaAsZodString({ type: "null" })).toMatchInlineSnapshot('"z.null().optional()"');
    expect(getSchemaAsZodString({ type: "boolean" })).toMatchInlineSnapshot('"z.boolean().optional()"');
    expect(getSchemaAsZodString({ type: "string" })).toMatchInlineSnapshot('"z.string().optional()"');
    expect(getSchemaAsZodString({ type: "number" })).toMatchInlineSnapshot('"z.number().optional()"');
    expect(getSchemaAsZodString({ type: "integer" })).toMatchInlineSnapshot('"z.bigint().optional()"');

    expect(getSchemaAsZodString({ type: "array", items: { type: "string" } })).toMatchInlineSnapshot(
        '"z.array(z.string().optional()).optional()"'
    );
    expect(getSchemaAsZodString({ type: "object" })).toMatchInlineSnapshot('"z.object({}).partial().optional()"');
    expect(getSchemaAsZodString({ type: "object", properties: { str: { type: "string" } } })).toMatchInlineSnapshot(
        '"z.object({ str: z.string() }).partial().optional()"'
    );
    expect(
        getSchemaAsZodString({ type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } })
    ).toMatchInlineSnapshot('"z.object({ str: z.string(), nb: z.number() }).partial().optional()"');

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
        '"z.object({ str: z.string(), nb: z.number(), nested: z.object({ nested_prop: z.boolean() }).partial() }).partial().optional()"'
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
    ).toMatchInlineSnapshot('"z.array(z.object({ str: z.string() }).partial().optional()).optional()"');

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
    ).toMatchInlineSnapshot('"z.array(z.array(z.string().optional()).optional()).optional()"');

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                union: { oneOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot(
        '"z.object({ union: z.union([z.string().optional(), z.number().optional()]) }).partial().optional()"'
    );

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot(
        '"z.object({ unionOrArrayOfUnion: z.union([z.union([z.string().optional(), z.number().optional()]), z.array(z.union([z.string().optional(), z.number().optional()]))]) }).partial().optional()"'
    );

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                intersection: { allOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot(
        '"z.object({ intersection: z.string().optional().and(z.number().optional()) }).partial().optional()"'
    );

    expect(getSchemaAsZodString({ type: "string", enum: ["aaa", "bbb", "ccc"] })).toMatchInlineSnapshot(
        '"z.enum(["aaa", "bbb", "ccc"]).optional()"'
    );
    expect(getSchemaAsZodString({ type: "number", enum: [1, 2, 3, null] })).toMatchInlineSnapshot(
        '"z.union([z.literal("1"), z.literal("2"), z.literal("3"), z.literal(null)]).optional()"'
    );
});

test("getSchemaWithChainableAsZodString", () => {
    expect(getSchemaAsZodString({ type: "string", nullable: true })).toMatchInlineSnapshot('"z.string().nullish()"');
    expect(getSchemaAsZodString({ type: "string", nullable: false })).toMatchInlineSnapshot('"z.string().optional()"');

    expect(getSchemaAsZodString({ type: "string", nullable: false }, { isRequired: true })).toMatchInlineSnapshot(
        '"z.string()"'
    );
    expect(getSchemaAsZodString({ type: "string", nullable: true }, { isRequired: true })).toMatchInlineSnapshot(
        '"z.string().nullable()"'
    );
});

test("CodeMeta with ref", () => {
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
        getSchemaByRef: (ref) => schemas[ref],
        zodSchemaByHash: {},
        schemaHashByRef: {},
        hashByVariableName: {},
        dependenciesByHashRef: {},
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
        '"z.object({ str: z.string(), reference: @ref__PLOvhOYyFZ__, inline: z.object({ nested_prop: z.boolean() }).partial() }).partial().optional()"'
    );
    expect(code.traverse()).toMatchInlineSnapshot(
        `
      {
          "code": "z.object({ str: z.string(), reference: z.object({ exampleProp: z.string(), another: z.number() }).partial().optional(), inline: z.object({ nested_prop: z.boolean() }).partial() }).partial().optional()",
          "dependencies": Set {
              "@ref__PLOvhOYyFZ__",
          },
      }
    `
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "@ref__PLOvhOYyFZ__",
          "z.object({ nested_prop: z.boolean() }).partial()",
      ]
    `);
});

// TODO with missing ref

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
        getSchemaByRef: (ref) => schemas[ref],
        zodSchemaByHash: {},
        schemaHashByRef: {},
        hashByVariableName: {},
        dependenciesByHashRef: {},
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
        '"z.object({ str: z.string(), reference: @ref__D9UIlTHmtD__, inline: z.object({ nested_prop: z.boolean() }).partial(), another: @ref__Ra9NlD29H1__, basic: @ref__7Yf0oeOD7p__, differentPropSameRef: @ref__7Yf0oeOD7p__ }).partial().optional()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "@ref__D9UIlTHmtD__",
          "z.object({ nested_prop: z.boolean() }).partial()",
          "@ref__Ra9NlD29H1__",
          "@ref__7Yf0oeOD7p__",
          "@ref__7Yf0oeOD7p__",
      ]
    `);
    expect(code.traverse()).toMatchInlineSnapshot(
        `
      {
          "code": "z.object({ str: z.string(), reference: z.object({ exampleProp: z.string(), another: z.number(), link: z.array(z.object({ nested: z.string(), nestedRef: z.object({ deep: z.boolean() }).partial().optional() }).partial().optional()), someReference: z.object({ prop: z.string(), second: z.number() }).partial().optional() }).partial().optional(), inline: z.object({ nested_prop: z.boolean() }).partial(), another: z.object({ nested: z.string(), nestedRef: z.object({ deep: z.boolean() }).partial().optional() }).partial().optional(), basic: z.object({ prop: z.string(), second: z.number() }).partial().optional(), differentPropSameRef: z.object({ prop: z.string(), second: z.number() }).partial().optional() }).partial().optional()",
          "dependencies": Set {
              "@ref__D9UIlTHmtD__",
              "@ref__Ra9NlD29H1__",
              "@ref__dmzyCFsyxL__",
              "@ref__7Yf0oeOD7p__",
          },
      }
    `
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "dependenciesByHashRef": {
              "@ref__D9UIlTHmtD__": Set {
                  "@ref__Ra9NlD29H1__",
                  "@ref__7Yf0oeOD7p__",
              },
              "@ref__Ra9NlD29H1__": Set {
                  "@ref__dmzyCFsyxL__",
              },
          },
          "getSchemaByRef": [Function],
          "hashByVariableName": {},
          "schemaHashByRef": {
              "Basic": "@ref__7Yf0oeOD7p__",
              "DeepNested": "@ref__dmzyCFsyxL__",
              "ObjectWithArrayOfRef": "@ref__D9UIlTHmtD__",
              "WithNested": "@ref__Ra9NlD29H1__",
          },
          "zodSchemaByHash": {
              "@ref__7Yf0oeOD7p__": "z.object({ prop: z.string(), second: z.number() }).partial().optional()",
              "@ref__D9UIlTHmtD__": "z.object({ exampleProp: z.string(), another: z.number(), link: z.array(@ref__Ra9NlD29H1__), someReference: @ref__7Yf0oeOD7p__ }).partial().optional()",
              "@ref__Ra9NlD29H1__": "z.object({ nested: z.string(), nestedRef: @ref__dmzyCFsyxL__ }).partial().optional()",
              "@ref__dmzyCFsyxL__": "z.object({ deep: z.boolean() }).partial().optional()",
          },
      }
    `);
});

import { SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { CodeMetaData, ConversionTypeContext, getZodSchema } from "./openApiToZod";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject, meta?: CodeMetaData) =>
    getZodSchema({ schema: makeSchema(schema), meta }).toString();

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
    ).toMatchInlineSnapshot(
        '"z.object({ union: z.union([z.string(), z.number()]) }).partial()"'
    );

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
    ).toMatchInlineSnapshot(
        '"z.object({ intersection: z.string().and(z.number()) }).partial()"'
    );

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
    const ctx: ConversionTypeContext = {
        getSchemaByRef: (ref) => null as any,
        zodSchemaByHash: {},
        schemaHashByRef: {},
        hashByVariableName: {},
        codeMetaByRef: {},
        circularTokenByRef: {},
    };

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
        getSchemaByRef: (ref) => schemas[ref],
        zodSchemaByHash: {},
        schemaHashByRef: {},
        hashByVariableName: {},
        codeMetaByRef: {},
        circularTokenByRef: {},
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
        '"z.object({ str: z.string(), reference: @ref__vIxl2qZdKNR__, inline: z.object({ nested_prop: z.boolean() }).partial() }).partial()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "@ref__vIxl2qZdKNR__",
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
        getSchemaByRef: (ref) => schemas[ref],
        zodSchemaByHash: {},
        schemaHashByRef: {},
        hashByVariableName: {},
        codeMetaByRef: {},
        circularTokenByRef: {},
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
        '"z.object({ str: z.string(), reference: @ref__vYgSV7U5VdD__, inline: z.object({ nested_prop: z.boolean() }).partial(), another: @ref__vYEGOMAPsCq__, basic: @ref__vltcwuCNPqv__, differentPropSameRef: @ref__vltcwuCNPqv__ }).partial()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "@ref__vYgSV7U5VdD__",
          "z.object({ nested_prop: z.boolean() }).partial()",
          "@ref__vYEGOMAPsCq__",
          "@ref__vltcwuCNPqv__",
          "@ref__vltcwuCNPqv__",
      ]
    `);
    expect(ctx).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {
              "Basic": "@circular__DjX26XQuB0",
              "DeepNested": "@circular__c96SHAMadg",
              "ObjectWithArrayOfRef": "@circular__oIHzDRwnzI",
              "WithNested": "@circular__tPB2Le4g2m",
          },
          "codeMetaByRef": {
              "Basic": "z.object({ prop: z.string(), second: z.number() }).partial()",
              "DeepNested": "z.object({ deep: z.boolean() }).partial()",
              "ObjectWithArrayOfRef": "z.object({ exampleProp: z.string(), another: z.number(), link: z.array(@ref__vYEGOMAPsCq__), someReference: @ref__vltcwuCNPqv__ }).partial()",
              "WithNested": "z.object({ nested: z.string(), nestedRef: @ref__vZmDobZZtRj__ }).partial()",
          },
          "getSchemaByRef": [Function],
          "hashByVariableName": {},
          "schemaHashByRef": {
              "Basic": "@ref__vltcwuCNPqv__",
              "DeepNested": "@ref__vZmDobZZtRj__",
              "ObjectWithArrayOfRef": "@ref__vYgSV7U5VdD__",
              "WithNested": "@ref__vYEGOMAPsCq__",
          },
          "zodSchemaByHash": {
              "@ref__vYEGOMAPsCq__": "z.object({ nested: z.string(), nestedRef: @ref__vZmDobZZtRj__ }).partial()",
              "@ref__vYgSV7U5VdD__": "z.object({ exampleProp: z.string(), another: z.number(), link: z.array(@ref__vYEGOMAPsCq__), someReference: @ref__vltcwuCNPqv__ }).partial()",
              "@ref__vZmDobZZtRj__": "z.object({ deep: z.boolean() }).partial()",
              "@ref__vltcwuCNPqv__": "z.object({ prop: z.string(), second: z.number() }).partial()",
          },
      }
    `);
});

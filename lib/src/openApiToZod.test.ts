import type { SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getZodSchema } from "./openApiToZod";
import type { CodeMetaData, ConversionTypeContext } from "./CodeMeta";
import { makeSchemaResolver } from "./makeSchemaResolver";
import { asComponentSchema } from "./utils";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject, meta?: CodeMetaData | undefined) =>
    getZodSchema({ schema: makeSchema(schema), meta }).toString();

test("getSchemaAsZodString", () => {
    expect(getSchemaAsZodString({ type: "null" })).toMatchInlineSnapshot('"z.null()"');
    expect(getSchemaAsZodString({ type: "null", enum: ["Dogs", "Cats", "Mice"] })).toMatchInlineSnapshot('"z.null()"');
    expect(getSchemaAsZodString({ type: "boolean" })).toMatchInlineSnapshot('"z.boolean()"');
    expect(getSchemaAsZodString({ type: "string" })).toMatchInlineSnapshot('"z.string()"');
    expect(getSchemaAsZodString({ type: "number" })).toMatchInlineSnapshot('"z.number()"');
    expect(getSchemaAsZodString({ type: "integer" })).toMatchInlineSnapshot('"z.number().int()"');
    // expect(getSchemaAsZodString({ type: "string", format: "date-time" })).toMatchInlineSnapshot('"z.string().datetime()"');
    // expect(getSchemaAsZodString({ type: "number", nullable: true, minimum: 0 })).toMatchInlineSnapshot('"z.number().nullable().gte(0)"');

    expect(getSchemaAsZodString({ type: "array", items: { type: "string" } })).toMatchInlineSnapshot(
        '"z.array(z.string())"'
    );
    expect(getSchemaAsZodString({ type: "object" })).toMatchInlineSnapshot('"z.object({}).partial().passthrough()"');
    expect(getSchemaAsZodString({ type: "object", properties: { str: { type: "string" } } })).toMatchInlineSnapshot(
        '"z.object({ str: z.string() }).partial().passthrough()"'
    );

    expect(getSchemaAsZodString({ type: "object", properties: { str: { type: "string" } } })).toMatchInlineSnapshot(
        '"z.object({ str: z.string() }).partial().passthrough()"'
    );

    expect(getSchemaAsZodString({ type: "object", properties: { nb: { type: "integer" } } })).toMatchInlineSnapshot(
        '"z.object({ nb: z.number().int() }).partial().passthrough()"'
    );

    expect(
        getSchemaAsZodString({ type: "object", properties: { pa: { type: "number", minimum: 0 } } })
    ).toMatchInlineSnapshot('"z.object({ pa: z.number().gte(0) }).partial().passthrough()"');

    expect(
        getSchemaAsZodString({ type: "object", properties: { pa: { type: "number", minimum: 0, maximum: 100 } } })
    ).toMatchInlineSnapshot('"z.object({ pa: z.number().gte(0).lte(100) }).partial().passthrough()"');

    expect(
        getSchemaAsZodString({ type: "object", properties: { ml: { type: "string", minLength: 0 } } })
    ).toMatchInlineSnapshot('"z.object({ ml: z.string().min(0) }).partial().passthrough()"');

    expect(
        getSchemaAsZodString({ type: "object", properties: { dt: { type: "string", format: "date-time" } } })
    ).toMatchInlineSnapshot('"z.object({ dt: z.string().datetime({ offset: true }) }).partial().passthrough()"');

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
        '"z.object({ str: z.string(), nb: z.number(), nested: z.object({ nested_prop: z.boolean() }).partial().passthrough() }).partial().passthrough()"'
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
    ).toMatchInlineSnapshot('"z.array(z.object({ str: z.string() }).partial().passthrough())"');

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
    ).toMatchInlineSnapshot('"z.object({ union: z.union([z.string(), z.number()]) }).partial().passthrough()"');

    expect(
        getSchemaAsZodString({
            type: "object",
            oneOf: [
                {
                    type: "object",
                    required: ["type", "a"],
                    properties: {
                        type: {
                            type: "string",
                            enum: ["a"],
                        },
                        a: {
                            type: "string",
                        },
                    },
                },
                {
                    type: "object",
                    required: ["type", "b"],
                    properties: {
                        type: {
                            type: "string",
                            enum: ["b"],
                        },
                        b: {
                            type: "string",
                        },
                    },
                },
            ],
            discriminator: { propertyName: "type" },
        })
    ).toMatchInlineSnapshot(`
      "
                      z.discriminatedUnion("type", [z.object({ type: z.literal("a"), a: z.string() }).passthrough(), z.object({ type: z.literal("b"), b: z.string() }).passthrough()])
                  "
    `);

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                anyOfExample: { anyOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot(
        '"z.object({ anyOfExample: z.union([z.string(), z.number()]) }).partial().passthrough()"'
    );

    expect(
        getSchemaAsZodString({
            type: "object",
            properties: {
                intersection: { allOf: [{ type: "string" }, { type: "number" }] },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ intersection: z.string().and(z.number()) }).partial().passthrough()"');

    expect(getSchemaAsZodString({ type: "string", enum: ["aaa", "bbb", "ccc"] })).toMatchInlineSnapshot(
        '"z.enum(["aaa", "bbb", "ccc"])"'
    );
    expect(getSchemaAsZodString({ type: "number", enum: [1, 2, 3, null] })).toMatchInlineSnapshot(
        '"z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(null)])"'
    );
    expect(getSchemaAsZodString({ type: "number", enum: [1] })).toMatchInlineSnapshot('"z.literal(1)"');
    expect(getSchemaAsZodString({ type: "string", enum: ["aString"] })).toMatchInlineSnapshot('"z.literal("aString")"');
});

test("getSchemaWithChainableAsZodString", () => {
    expect(getSchemaAsZodString({ type: "string", nullable: true })).toMatchInlineSnapshot('"z.string().nullable()"');
    expect(getSchemaAsZodString({ type: "string", nullable: false })).toMatchInlineSnapshot('"z.string()"');

    expect(getSchemaAsZodString({ type: "string", nullable: false }, { isRequired: true })).toMatchInlineSnapshot(
        '"z.string()"'
    );
    expect(getSchemaAsZodString({ type: "string", nullable: true }, { isRequired: true })).toMatchInlineSnapshot(
        '"z.string()"'
    );
});

test("CodeMeta with missing ref", () => {
    const ctx: ConversionTypeContext = {
        resolver: makeSchemaResolver({ components: { schemas: {} } } as any),
        zodSchemaByName: {},
        schemaByName: {},
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
        resolver: makeSchemaResolver({ components: { schemas } } as any),
        zodSchemaByName: {},
        schemaByName: {},
    };
    Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

    const code = getZodSchema({
        schema: makeSchema({
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "#/components/schemas/Example",
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
        '"z.object({ str: z.string(), reference: Example, inline: z.object({ nested_prop: z.boolean() }).partial().passthrough() }).partial().passthrough()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "Example",
          "z.object({ nested_prop: z.boolean() }).partial().passthrough()",
      ]
    `);
});

test("CodeMeta with nested refs", () => {
    const schemas = {
        Basic: { type: "object", properties: { prop: { type: "string" }, second: { type: "number" } } },
        WithNested: {
            type: "object",
            properties: { nested: { type: "string" }, nestedRef: { $ref: "#/components/schemas/DeepNested" } },
        },
        ObjectWithArrayOfRef: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
                link: { type: "array", items: { $ref: "#/components/schemas/WithNested" } },
                someReference: { $ref: "#/components/schemas/Basic" },
            },
        },
        DeepNested: { type: "object", properties: { deep: { type: "boolean" } } },
    } as Record<string, SchemaObject>;
    const ctx: ConversionTypeContext = {
        resolver: makeSchemaResolver({ components: { schemas } } as any),
        zodSchemaByName: {},
        schemaByName: {},
    };
    Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

    const code = getZodSchema({
        schema: makeSchema({
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "#/components/schemas/ObjectWithArrayOfRef",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
                another: { $ref: "#components/schemas/WithNested" },
                basic: { $ref: "#/components/schemas/Basic" },
                differentPropSameRef: { $ref: "#/components/schemas/Basic" },
            },
        }),
        ctx,
    });
    expect(code.toString()).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), reference: ObjectWithArrayOfRef, inline: z.object({ nested_prop: z.boolean() }).partial().passthrough(), another: WithNested, basic: Basic, differentPropSameRef: Basic }).partial().passthrough()"'
    );
    expect(code.children).toMatchInlineSnapshot(`
      [
          "z.string()",
          "ObjectWithArrayOfRef",
          "z.object({ nested_prop: z.boolean() }).partial().passthrough()",
          "WithNested",
          "Basic",
          "Basic",
      ]
    `);
    expect(ctx).toMatchInlineSnapshot(`
      {
          "resolver": {
              "getSchemaByRef": [Function],
              "resolveRef": [Function],
              "resolveSchemaName": [Function],
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "Basic": "z.object({ prop: z.string(), second: z.number() }).partial().passthrough()",
              "DeepNested": "z.object({ deep: z.boolean() }).partial().passthrough()",
              "ObjectWithArrayOfRef": "z.object({ exampleProp: z.string(), another: z.number(), link: z.array(WithNested), someReference: Basic }).partial().passthrough()",
              "WithNested": "z.object({ nested: z.string(), nestedRef: DeepNested }).partial().passthrough()",
          },
      }
    `);
});

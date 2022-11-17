import { getTypescriptFromOpenApi, TsConversionContext } from "./openApiToTypescript";

import type { SchemaObject, SchemasObject } from "openapi3-ts";
import { ts } from "tanu";
import { describe, expect, test } from "vitest";
import { makeSchemaResolver } from "./makeSchemaResolver";
import { asComponentSchema } from "./utils";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsTsString = (schema: SchemaObject, meta?: { name: string }) =>
    printTs(getTypescriptFromOpenApi({ schema: makeSchema(schema), meta }) as ts.Node);

const file = ts.createSourceFile("", "", ts.ScriptTarget.ESNext, true);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const printTs = (node: ts.Node) => printer.printNode(ts.EmitHint.Unspecified, node, file);

test("getSchemaAsTsString", () => {
    expect(getSchemaAsTsString({ type: "null" })).toMatchInlineSnapshot('"null"');
    expect(getSchemaAsTsString({ type: "boolean" })).toMatchInlineSnapshot('"boolean"');
    expect(getSchemaAsTsString({ type: "string" })).toMatchInlineSnapshot('"string"');
    expect(getSchemaAsTsString({ type: "number" })).toMatchInlineSnapshot('"number"');
    expect(getSchemaAsTsString({ type: "integer" })).toMatchInlineSnapshot('"number"');
    expect(getSchemaAsTsString({})).toMatchInlineSnapshot('"unknown"');

    expect(getSchemaAsTsString({ type: "null" }, { name: "nullType" })).toMatchInlineSnapshot(
        '"export type nullType = null;"'
    );
    expect(getSchemaAsTsString({ type: "boolean" }, { name: "booleanType" })).toMatchInlineSnapshot(
        '"export type booleanType = boolean;"'
    );
    expect(getSchemaAsTsString({ type: "string" }, { name: "stringType" })).toMatchInlineSnapshot(
        '"export type stringType = string;"'
    );
    expect(getSchemaAsTsString({ type: "number" }, { name: "numberType" })).toMatchInlineSnapshot(
        '"export type numberType = number;"'
    );
    expect(getSchemaAsTsString({ type: "integer" }, { name: "integerType" })).toMatchInlineSnapshot(
        '"export type integerType = number;"'
    );
    expect(getSchemaAsTsString({}, { name: "unknownType" })).toMatchInlineSnapshot(
        '"export type unknownType = unknown;"'
    );

    expect(getSchemaAsTsString({ type: "array", items: { type: "string" } })).toMatchInlineSnapshot('"Array<string>"');
    expect(getSchemaAsTsString({ type: "object" }, { name: "EmptyObject" })).toMatchInlineSnapshot(
        '"export type EmptyObject = {};"'
    );
    expect(getSchemaAsTsString({ type: "object", properties: { str: { type: "string" } } }, { name: "BasicObject" }))
        .toMatchInlineSnapshot(`
          "export type BasicObject = Partial<{
              str: string;
          }>;"
        `);
    expect(
        getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } },
            { name: "BasicObject2" }
        )
    ).toMatchInlineSnapshot(`
      "export type BasicObject2 = Partial<{
          str: string;
          nb: number;
      }>;"
    `);

    expect(
        getSchemaAsTsString(
            {
                type: "object",
                properties: { str: { type: "string" }, nb: { type: "number" } },
                required: ["str", "nb"],
            },
            { name: "AllPropertiesRequired" }
        )
    ).toMatchInlineSnapshot(`
      "export type AllPropertiesRequired = {
          str: string;
          nb: number;
      };"
    `);
    expect(
        getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } }, required: ["str"] },
            { name: "SomeOptionalProps" }
        )
    ).toMatchInlineSnapshot(`
      "export type SomeOptionalProps = {
          str: string;
          nb?: number | undefined;
      };"
    `);

    expect(
        getSchemaAsTsString(
            {
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
            },
            { name: "ObjectWithNestedProp" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithNestedProp = Partial<{
          str: string;
          nb: number;
          nested: Partial<{
              nested_prop: boolean;
          }>;
      }>;"
    `);

    expect(
        getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" } }, additionalProperties: { type: "number" } },
            { name: "ObjectWithAdditionalPropsNb" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithAdditionalPropsNb = Partial<{
          str: string;
      } & {
          [key: string]: number;
      }>;"
    `);

    expect(
        getSchemaAsTsString(
            {
                type: "object",
                properties: { str: { type: "string" } },
                additionalProperties: { type: "object", properties: { prop: { type: "boolean" } } },
            },
            { name: "ObjectWithNestedRecordBoolean" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithNestedRecordBoolean = Partial<{
          str: string;
      } & {
          [key: string]: Partial<{
              prop: boolean;
          }>;
      }>;"
    `);

    expect(
        getSchemaAsTsString({
            type: "array",
            items: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        })
    ).toMatchInlineSnapshot(`
      "Array<Partial<{
          str: string;
      }>>"
    `);

    expect(
        getSchemaAsTsString({
            type: "array",
            items: {
                type: "array",
                items: {
                    type: "string",
                },
            },
        })
    ).toMatchInlineSnapshot('"Array<Array<string>>"');

    expect(
        getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    enumprop: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                },
            },
            { name: "ObjectWithEnum" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithEnum = Partial<{
          enumprop: "aaa" | "bbb" | "ccc";
      }>;"
    `);

    expect(getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] })).toMatchInlineSnapshot(
        '""aaa" | "bbb" | "ccc""'
    );
    expect(
        getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] }, { name: "StringENum" })
    ).toMatchInlineSnapshot('"export type StringENum = "aaa" | "bbb" | "ccc";"');

    expect(
        getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    union: { oneOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithUnion" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithUnion = Partial<{
          union: string | number;
      }>;"
    `);
    expect(getSchemaAsTsString({ oneOf: [{ type: "string" }, { type: "number" }] })).toMatchInlineSnapshot(
        '"string | number"'
    );
    expect(
        getSchemaAsTsString({ oneOf: [{ type: "string" }, { type: "number" }] }, { name: "StringOrNumber" })
    ).toMatchInlineSnapshot('"export type StringOrNumber = string | number;"');

    expect(getSchemaAsTsString({ allOf: [{ type: "string" }, { type: "number" }] })).toMatchInlineSnapshot(
        '"string & number"'
    );
    expect(
        getSchemaAsTsString({ allOf: [{ type: "string" }, { type: "number" }] }, { name: "StringAndNumber" })
    ).toMatchInlineSnapshot('"export type StringAndNumber = string & number;"');

    expect(getSchemaAsTsString({ anyOf: [{ type: "string" }, { type: "number" }] })).toMatchInlineSnapshot(
        '"(string | number) | Array<string | number>"'
    );
    expect(
        getSchemaAsTsString(
            { anyOf: [{ type: "string" }, { type: "number" }] },
            { name: "StringAndNumberMaybeMultiple" }
        )
    ).toMatchInlineSnapshot('"export type StringAndNumberMaybeMultiple = (string | number) | Array<string | number>;"');

    expect(
        getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    unionOrArrayOfUnion: { anyOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithArrayUnion" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithArrayUnion = Partial<{
          unionOrArrayOfUnion: (string | number) | Array<string | number>;
      }>;"
    `);

    expect(
        getSchemaAsTsString(
            {
                type: "object",
                properties: {
                    intersection: { allOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithIntersection" }
        )
    ).toMatchInlineSnapshot(`
      "export type ObjectWithIntersection = Partial<{
          intersection: string & number;
      }>;"
    `);

    expect(getSchemaAsTsString({ type: "string", enum: ["aaa", "bbb", "ccc"] })).toMatchInlineSnapshot(
        '""aaa" | "bbb" | "ccc""'
    );
    expect(getSchemaAsTsString({ type: "number", enum: [1, 2, 3] })).toMatchInlineSnapshot('"1 | 2 | 3"');
});

describe("getSchemaAsTsString with context", () => {
    test("with ref", () => {
        const schemas = {
            Root: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested" },
                },
            },
            Nested: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        expect(printTs(getTypescriptFromOpenApi({ schema: schemas["Root"]!, meta: { name: "Root" }, ctx }) as ts.Node))
            .toMatchInlineSnapshot(`
              "export type Root = Partial<{
                  str: string;
                  nb: number;
                  nested: Nested;
              }>;"
            `);
    });

    test("with multiple nested refs", () => {
        const schemas = {
            Root2: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested2" },
                },
            },
            Nested2: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    deeplyNested: { $ref: "#/components/schemas/DeeplyNested" },
                },
            },
            DeeplyNested: {
                type: "array",
                items: { $ref: "#/components/schemas/VeryDeeplyNested" },
            },
            VeryDeeplyNested: {
                type: "string",
                enum: ["aaa", "bbb", "ccc"],
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        expect(
            printTs(getTypescriptFromOpenApi({ schema: schemas["Root2"]!, meta: { name: "Root2" }, ctx }) as ts.Node)
        ).toMatchInlineSnapshot(`
              "export type Root2 = Partial<{
                  str: string;
                  nb: number;
                  nested: Nested2;
              }>;"
            `);
    });

    test("with indirect recursive ref", async () => {
        const schemas = {
            Root3: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested3" },
                    arrayOfNested: { type: "array", items: { $ref: "#/components/schemas/Nested3" } },
                },
            },
            Nested3: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    backToRoot: { $ref: "#/components/schemas/Root3" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

        expect(
            printTs(
                getTypescriptFromOpenApi({
                    schema: schemas["Root3"]!,
                    meta: { name: "Root3", $ref: "#/components/schemas/Root3" },
                    ctx,
                }) as ts.Node
            )
        ).toMatchInlineSnapshot(`
          "export type Root3 = Partial<{
              str: string;
              nb: number;
              nested: Nested3;
              arrayOfNested: Array<Nested3>;
          }>;"
        `);
    });

    test("with direct (self) recursive ref", async () => {
        const schemas = {
            Root4: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    self: { $ref: "#/components/schemas/Root4" },
                    nested: { $ref: "#/components/schemas/Nested4" },
                    arrayOfSelf: { type: "array", items: { $ref: "#/components/schemas/Root4" } },
                },
            },
            Nested4: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    backToRoot: { $ref: "#/components/schemas/Root4" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        const result = getTypescriptFromOpenApi({
            schema: schemas["Root4"]!,
            meta: { name: "Root4", $ref: "#/components/schemas/Root4" },
            ctx,
        }) as ts.Node;

        expect(printTs(result)).toMatchInlineSnapshot(`
          "export type Root4 = Partial<{
              str: string;
              nb: number;
              self: Root4;
              nested: Nested4;
              arrayOfSelf: Array<Root4>;
          }>;"
        `);
    });

    test("same schemas as openApiToZod", () => {
        const schemas = {
            User: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    middle: { $ref: "#/components/schemas/Middle" },
                },
            },
            Middle: {
                type: "object",
                properties: {
                    user: { $ref: "#/components/schemas/User" },
                },
            },
            Root: {
                type: "object",
                properties: {
                    recursive: {
                        $ref: "#/components/schemas/User",
                    },
                    basic: { type: "number" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            visitedsRefs: {},
            resolver: makeSchemaResolver({ components: { schemas } } as any),
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));
        const result = getTypescriptFromOpenApi({
            schema: schemas["Root"]!,
            meta: { name: "Root", $ref: "#/components/schemas/Root" },
            ctx,
        }) as ts.Node;

        expect(printTs(result)).toMatchInlineSnapshot(`
          "export type Root = Partial<{
              recursive: User;
              basic: number;
          }>;"
        `);
    });
});

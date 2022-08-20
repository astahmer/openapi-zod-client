import { getTypescriptFromOpenApi, TsConversionContext } from "./openApiToTypescript";

import { SchemaObject, SchemasObject } from "openapi3-ts";
import { ts } from "tanu";
import { describe, expect, test } from "vitest";

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

    expect(getSchemaAsTsString({ type: "array", items: { type: "string" } })).toMatchInlineSnapshot('"Array<string>"');
    expect(getSchemaAsTsString({ type: "object" }, { name: "EmptyObject" })).toMatchInlineSnapshot(`
      "export interface EmptyObject {
      }"
    `);
    expect(getSchemaAsTsString({ type: "object", properties: { str: { type: "string" } } }, { name: "BasicObject" }))
        .toMatchInlineSnapshot(`
          "interface BasicObject extends Partial<{
              str: string;
          }> {
          }"
        `);
    expect(
        getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } } },
            { name: "BasicObject2" }
        )
    ).toMatchInlineSnapshot(`
      "interface BasicObject2 extends Partial<{
          str: string;
          nb: number;
      }> {
      }"
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
      "export interface AllPropertiesRequired {
          str: string;
          nb: number;
      }"
    `);
    expect(
        getSchemaAsTsString(
            { type: "object", properties: { str: { type: "string" }, nb: { type: "number" } }, required: ["str"] },
            { name: "SomeOptionalProps" }
        )
    ).toMatchInlineSnapshot(`
      "export interface SomeOptionalProps {
          str: string;
          nb?: number | undefined;
      }"
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
      "interface ObjectWithNestedProp extends Partial<{
          str: string;
          nb: number;
          nested: Partial<{
              nested_prop: boolean;
          }>;
      }> {
      }"
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
                    union: { oneOf: [{ type: "string" }, { type: "number" }] },
                },
            },
            { name: "ObjectWithUnion" }
        )
    ).toMatchInlineSnapshot(`
      "interface ObjectWithUnion extends Partial<{
          union: string | number;
      }> {
      }"
    `);

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
      "interface ObjectWithArrayUnion extends Partial<{
          unionOrArrayOfUnion: (string | number) | Array<string | number>;
      }> {
      }"
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
      "interface ObjectWithIntersection extends Partial<{
          intersection: string & number;
      }> {
      }"
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
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };
        expect(printTs(getTypescriptFromOpenApi({ schema: schemas.Root, meta: { name: "Root" }, ctx }) as ts.Node))
            .toMatchInlineSnapshot(`
              "interface Root extends Partial<{
                  str: string;
                  nb: number;
                  nested: Partial<{
                      nested_prop: boolean;
                  }>;
              }> {
              }"
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
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };
        expect(printTs(getTypescriptFromOpenApi({ schema: schemas.Root2, meta: { name: "Root2" }, ctx }) as ts.Node))
            .toMatchInlineSnapshot(`
              "interface Root2 extends Partial<{
                  str: string;
                  nb: number;
                  nested: Partial<{
                      nested_prop: boolean;
                      deeplyNested: Array<"aaa" | "bbb" | "ccc">;
                  }>;
              }> {
              }"
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
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };

        expect(
            printTs(
                getTypescriptFromOpenApi({
                    schema: schemas.Root3,
                    meta: { name: "Root3", $ref: "#/components/schemas/Root3" },
                    ctx,
                }) as ts.Node
            )
        ).toMatchInlineSnapshot(`
          "interface Root3 extends Partial<{
              str: string;
              nb: number;
              nested: Partial<{
                  nested_prop: boolean;
                  backToRoot: Root3;
              }>;
              arrayOfNested: Array<Partial<{
                  nested_prop: boolean;
                  backToRoot: Root3;
              }>>;
          }> {
          }"
        `);
    });

    test("with recursive & type refs", () => {
        const schemas = {
            Root32: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nb: { type: "number" },
                    nested: { $ref: "#/components/schemas/Nested32" },
                    arrayOfNested: { type: "array", items: { $ref: "#/components/schemas/Nested32" } },
                },
            },
            Nested32: {
                type: "object",
                properties: {
                    nested_prop: { type: "boolean" },
                    backToRoot: { $ref: "#/components/schemas/Root3" },
                },
            },
        } as SchemasObject;

        const ctx: TsConversionContext = {
            nodeByRef: {},
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
            shouldUseTypeRefs: true,
        };
        expect(
            printTs(
                getTypescriptFromOpenApi({
                    schema: schemas.Root32,
                    meta: { name: "Root32", $ref: "#/components/schemas/Root32" },
                    ctx,
                }) as ts.Node
            )
        ).toMatchInlineSnapshot(`
          "interface Root32 extends Partial<{
              str: string;
              nb: number;
              nested: Nested32;
              arrayOfNested: Array<Nested32>;
          }> {
          }"
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
            getSchemaByRef: (ref) => schemas[ref.split("/").at(-1)!],
        };
        const result = getTypescriptFromOpenApi({
            schema: schemas.Root4,
            meta: { name: "Root4", $ref: "#/components/schemas/Root4" },
            ctx,
        }) as ts.Node;

        expect(printTs(result)).toMatchInlineSnapshot(`
          "interface Root4 extends Partial<{
              str: string;
              nb: number;
              self: Root4;
              nested: Partial<{
                  nested_prop: boolean;
                  backToRoot: Root4;
              }>;
              arrayOfSelf: Array<Root4>;
          }> {
          }"
        `);
    });
});

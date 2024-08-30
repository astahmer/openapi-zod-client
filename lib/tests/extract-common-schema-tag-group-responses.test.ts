import type { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { describe, expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

describe("Tag file group strategy resolve common schema import from zod expression responses", () => {
    const getMultiTagOpenApiDoc = (schema: SchemaObject) => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Foo bar api", version: "1.0.1" },
            paths: {
                "/foo": {
                    put: {
                        summary: "Foo",
                        description: "Foo",
                        tags: ["controller-foo"],
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema
                                    }
                                },
                            },
                        },
                    },
                },
                "/bar": {
                    put: {
                        summary: "bar",
                        description: "Bar",
                        tags: ["controller-bar"],
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema
                                    }
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    FooBar: {
                        type: "object",
                        properties: {
                            foo: {
                                type: "integer",
                            },
                            bar: {
                                type: "number",
                            },
                        },
                    },
                    BarFoo: {
                        type: "object",
                        properties: {
                            foo: {
                                type: "string",
                            },
                            bar: {
                                type: "boolean",
                            },
                        },
                    },
                    Bar: {
                        type: "object",
                        properties: {
                            bar: {
                                type: "string"
                            }
                        }
                    },
                    Foo: {
                        type: "object",
                        properties: {
                            foo: {
                                type: 'boolean'
                            }
                        }
                    }
                },
            },
            tags: [],
        };
        return openApiDoc
    }

    test("Array of $refs response body should import related common schema", async () => {
        const openApiDoc = getMultiTagOpenApiDoc({
            "type": "array",
            items: {
                "$ref": "#/components/schemas/FooBar"
            }
        }
        )
        const output = await generateZodClientFromOpenAPI({
            disableWriteToFile: true,
            openApiDoc,
            options: { groupStrategy: "tag-file" },
        });
        // This one is ok good perfect this is the bug
        expect(output).toMatchInlineSnapshot(`
          {
              "__common": "import { z } from "zod";

          export const FooBar = z
            .object({ foo: z.number().int(), bar: z.number() })
            .partial()
            .passthrough();
          ",
              "__index": "export { Controller_fooApi } from "./controller_foo";
          export { Controller_barApi } from "./controller_bar";
          ",
              "controller_bar": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          import { FooBar } from "./common";

          const endpoints = makeApi([
            {
              method: "put",
              path: "/bar",
              description: \`Bar\`,
              requestFormat: "json",
              response: z.array(FooBar),
            },
          ]);

          export const Controller_barApi = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "controller_foo": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          import { FooBar } from "./common";

          const endpoints = makeApi([
            {
              method: "put",
              path: "/foo",
              description: \`Foo\`,
              requestFormat: "json",
              response: z.array(FooBar),
            },
          ]);

          export const Controller_fooApi = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
          }
        `);
    });

    test("Complex nested intersections response body should import related common schema", async () => {
        const openApiDoc = getMultiTagOpenApiDoc({
            "type": "array",
            items: {
                "oneOf": [
                    {
                        "allOf": [
                            {
                                "$ref": "#/components/schemas/FooBar"
                            },
                            {
                                "$ref": "#/components/schemas/Bar"
                            },
                            {
                                "$ref": "#/components/schemas/Foo"
                            }
                        ]
                    },
                    {
                        "oneOf": [
                            {
                                "$ref": "#/components/schemas/FooBar"
                            },
                            {
                                "$ref": "#/components/schemas/Bar"
                            },
                            {
                                "$ref": "#/components/schemas/Foo"
                            }
                        ]
                    },
                    {
                        "anyOf": [
                            {
                                "$ref": "#/components/schemas/FooBar"
                            },
                            {
                                "$ref": "#/components/schemas/Foo"
                            }
                        ]
                    },
                ]
            }
        })

        const output = await generateZodClientFromOpenAPI({
            disableWriteToFile: true,
            openApiDoc,
            options: { groupStrategy: "tag-file" },
        });
        // This one is ok good perfect this is the bug
        expect(output).toMatchInlineSnapshot(`
          {
              "__common": "import { z } from "zod";

          export const FooBar = z
            .object({ foo: z.number().int(), bar: z.number() })
            .partial()
            .passthrough();
          export const Bar = z.object({ bar: z.string() }).partial().passthrough();
          export const Foo = z.object({ foo: z.boolean() }).partial().passthrough();
          ",
              "__index": "export { Controller_fooApi } from "./controller_foo";
          export { Controller_barApi } from "./controller_bar";
          ",
              "controller_bar": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          import { FooBar } from "./common";
          import { Bar } from "./common";
          import { Foo } from "./common";

          const endpoints = makeApi([
            {
              method: "put",
              path: "/bar",
              description: \`Bar\`,
              requestFormat: "json",
              response: z.array(
                z.union([
                  FooBar.and(Bar).and(Foo),
                  z.union([FooBar, Bar, Foo]),
                  z.union([FooBar, Foo]),
                ])
              ),
            },
          ]);

          export const Controller_barApi = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "controller_foo": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          import { FooBar } from "./common";
          import { Bar } from "./common";
          import { Foo } from "./common";

          const endpoints = makeApi([
            {
              method: "put",
              path: "/foo",
              description: \`Foo\`,
              requestFormat: "json",
              response: z.array(
                z.union([
                  FooBar.and(Bar).and(Foo),
                  z.union([FooBar, Bar, Foo]),
                  z.union([FooBar, Foo]),
                ])
              ),
            },
          ]);

          export const Controller_fooApi = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
          }
        `);
    });

    test("Import only whole word matching common model from zod expression", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Foo bar api", version: "1.0.1" },
            paths: {
                "/bar": {
                    put: {
                        summary: "bar",
                        description: "Bar",
                        tags: ["controller-bar"],
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            "type": "array",
                                            items: {
                                                allOf: [
                                                    {
                                                        "$ref": "#/components/schemas/FooBar"
                                                    },
                                                    {
                                                        "$ref": "#/components/schemas/Bar"
                                                    },
                                                    {
                                                        "$ref": "#/components/schemas/Foo"
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                            },
                        },
                    },
                    get: {
                        summary: "bar",
                        description: "Bar",
                        tags: ["controller-bar"],
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            "type": "object",
                                            oneOf: [
                                                {
                                                    "$ref": "#/components/schemas/FooBar"
                                                },
                                                {
                                                    "$ref": "#/components/schemas/Bar"
                                                },
                                                {
                                                    "$ref": "#/components/schemas/Foo"
                                                }
                                            ]
                                        }
                                    }
                                },
                            },
                        },
                    },
                    post: {
                        summary: "bar",
                        description: "Bar",
                        tags: ["should-only-import-foobar-and-foo"],
                        responses: {
                            "200": {
                                description: "Success",
                                content: {
                                    "application/json": {
                                        schema: {
                                            "type": "object",
                                            oneOf: [
                                                {
                                                    "$ref": "#/components/schemas/FooBar"
                                                },
                                                {
                                                    "$ref": "#/components/schemas/Foo"
                                                }
                                            ]
                                        }
                                    }
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    FooBar: {
                        type: "object",
                        properties: {
                            foo: {
                                type: "integer",
                            },
                            bar: {
                                type: "number",
                            },
                        },
                    },
                    BarFoo: {
                        type: "object",
                        properties: {
                            foo: {
                                type: "string",
                            },
                            bar: {
                                type: "boolean",
                            },
                        },
                    },
                    Bar: {
                        type: "object",
                        properties: {
                            bar: {
                                type: "string"
                            }
                        }
                    },
                    Foo: {
                        type: "object",
                        properties: {
                            foo: {
                                type: 'boolean'
                            }
                        }
                    }
                },
            },
            tags: [],
        };

        const output = await generateZodClientFromOpenAPI({
            disableWriteToFile: true,
            openApiDoc,
            options: { groupStrategy: "tag-file" },
        });
        // This one is ok good perfect this is the bug
        expect(output).toMatchInlineSnapshot(`
          {
              "__common": "import { z } from "zod";

          export const FooBar = z
            .object({ foo: z.number().int(), bar: z.number() })
            .partial()
            .passthrough();
          export const Foo = z.object({ foo: z.boolean() }).partial().passthrough();
          ",
              "__index": "export { Controller_barApi } from "./controller_bar";
          export { Should_only_import_foobar_and_fooApi } from "./should_only_import_foobar_and_foo";
          ",
              "controller_bar": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          import { FooBar } from "./common";
          import { Foo } from "./common";

          const Bar = z.object({ bar: z.string() }).partial().passthrough();

          export const schemas = {
            Bar,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/bar",
              description: \`Bar\`,
              requestFormat: "json",
              response: z.array(FooBar.and(Bar).and(Foo)),
            },
            {
              method: "get",
              path: "/bar",
              description: \`Bar\`,
              requestFormat: "json",
              response: z.union([FooBar, Bar, Foo]),
            },
          ]);

          export const Controller_barApi = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
              "should_only_import_foobar_and_foo": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          import { FooBar } from "./common";
          import { Foo } from "./common";

          const endpoints = makeApi([
            {
              method: "post",
              path: "/bar",
              description: \`Bar\`,
              requestFormat: "json",
              response: z.union([FooBar, Foo]),
            },
          ]);

          export const Should_only_import_foobar_and_fooApi = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          ",
          }
        `);
    });
})
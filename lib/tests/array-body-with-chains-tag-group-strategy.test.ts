import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

test.only("array-body-with-chains-tag-group-strategy", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.1" },
        paths: {
            "/test": {
                put: {
                    summary: "Test",
                    description: "Test",
                    tags: ["Test"],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            testItem: {
                                                type: "string",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                    minItems: 1,
                                    maxItems: 10,
                                },
                            },
                        },
                    },
                    parameters: [],
                    responses: {
                        "200": {
                            description: "Success",
                            content: { "application/json": {} },
                        },
                    },
                },
            },
        },
        components: {},
        tags: [],
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { groupStrategy: "tag-file" },
    });
    expect(output).toMatchInlineSnapshot(`
      {
          "Test": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";




      const putTest_Body.min(1).max(10) = ;

      export const schemas = {
      	putTest_Body.min(1).max(10),
      };

      const endpoints = makeApi([
      	{
      		method: "put",
      		path: "/test",
      		description: \`Test\`,
      		requestFormat: "json",
      		parameters: [
      			{
      				name: "body",
      				type: "Body",
      				schema: putTest_Body.min(1).max(10)
      			},
      		],
      		response: z.void(),
      	},
      ]);

      export const TestApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
          return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "__index": "export { TestApi } from "./Test";
      ",
      }
    `);
});

test("array-response-body-with-chains-tag-group-strategy directly typed", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.1" },
        paths: {
            "/test": {
                put: {
                    summary: "Test",
                    description: "Test",
                    tags: ["Test"],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            testItem: {
                                                type: "string",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                },
                            },
                        },
                    },
                    parameters: [],
                    responses: {
                        "200": {
                            description: "Success",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                foo: {
                                                    type: "string",
                                                },
                                                bar: {
                                                    type: "number",
                                                },
                                            },
                                        },
                                        default: ["one", "two"],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {},
        tags: [],
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { groupStrategy: "tag-file" },
    });
    expect(output).toMatchInlineSnapshot(`
      {
          "Test": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const putTest_Body = z.array(z.object({ testItem: z.string() }).partial());

      export const schemas = {
        putTest_Body,
      };

      const endpoints = makeApi([
        {
          method: "put",
          path: "/test",
          description: \`Test\`,
          requestFormat: "json",
          parameters: [
            {
              name: "body",
              type: "Body",
              schema: putTest_Body,
            },
          ],
          response: z
            .array(
              z.object({ foo: z.string(), bar: z.number() }).partial().passthrough()
            )
            .default(["one", "two"]),
        },
      ]);

      export const TestApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "__index": "export { TestApi } from "./Test";
      ",
      }
    `);
});

test("array-response-body-with-chains-tag-group-strategy ref's array", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Foo bar api", version: "1.0.1" },
        paths: {
            "/foo": {
                put: {
                    summary: "Foo",
                    description: "Foo",
                    tags: ["controller-foo"],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            testItem: {
                                                type: "string",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                },
                            },
                        },
                    },
                    parameters: [],
                    responses: {
                        "200": {
                            description: "Success",
                            content: {
                                "application/json": {
                                    schema: {
                                        "type": "array",
                                        items: {
                                            "$ref": "#/components/schemas/FooBar"
                                        }
                                    }
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
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            testItem: {
                                                type: "string",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                },
                            },
                        },
                    },
                    parameters: [],
                    responses: {
                        "200": {
                            description: "Success",
                            content: {
                                "application/json": {
                                    schema: {
                                        "type": "array",
                                        items: {
                                            "$ref": "#/components/schemas/FooBar"
                                        }
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
            },
        },
        tags: [],
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { groupStrategy: "tag-file" },
    });
    expect(output).toMatchInlineSnapshot(`
      {
          "__common": "import { z } from "zod";

      export const putFoo_Body = z.array(
        z.object({ testItem: z.string() }).partial()
      );
      ",
          "__index": "export { Controller_fooApi } from "./controller_foo";
      export { Controller_barApi } from "./controller_bar";
      ",
          "controller_bar": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      import { putFoo_Body } from "./common";

      const endpoints = makeApi([
        {
          method: "put",
          path: "/bar",
          description: \`Bar\`,
          requestFormat: "json",
          parameters: [
            {
              name: "body",
              type: "Body",
              schema: putFoo_Body,
            },
          ],
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

      import { putFoo_Body } from "./common";

      const endpoints = makeApi([
        {
          method: "put",
          path: "/foo",
          description: \`Foo\`,
          requestFormat: "json",
          parameters: [
            {
              name: "body",
              type: "Body",
              schema: putFoo_Body,
            },
          ],
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

test("primitive array response body using ref", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Foo bar api", version: "1.0.1" },
        paths: {
            "/foo": {
                put: {
                    summary: "Foo",
                    description: "Foo",
                    tags: ["controller-foo"],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            testItem: {
                                                type: "string",
                                            },
                                        },
                                        additionalProperties: false,
                                    },
                                },
                            },
                        },
                    },
                    parameters: [],
                    responses: {
                        "200": {
                            description: "Success",
                            content: {
                                "application/json": {
                                    schema: {
                                        "type": "array",
                                        items: {
                                            "$ref": "#/components/schemas/FooBar"
                                        }
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
            },
        },
        tags: [],
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
    });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const putFoo_Body = z.array(z.object({ testItem: z.string() }).partial());
      const FooBar = z
        .object({ foo: z.number().int(), bar: z.number() })
        .partial()
        .passthrough();

      export const schemas = {
        putFoo_Body,
        FooBar,
      };

      const endpoints = makeApi([
        {
          method: "put",
          path: "/foo",
          description: \`Foo\`,
          requestFormat: "json",
          parameters: [
            {
              name: "body",
              type: "Body",
              schema: putFoo_Body,
            },
          ],
          response: z.array(FooBar),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

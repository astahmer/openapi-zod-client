import type { OpenAPIObject } from "openapi3-ts/oas31";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/61
test("object-default-values", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "object default values",
        },
        paths: {
            "/sample": {
                get: {
                    parameters: [
                        {
                            in: "query",
                            name: "empty-object",
                            schema: {
                                type: "object",
                                properties: { foo: { type: "string" } },
                                default: {},
                            },
                        },
                        {
                            in: "query",
                            name: "default-object",
                            schema: {
                                type: "object",
                                properties: { foo: { type: "string" } },
                                default: { foo: "bar" },
                            },
                        },
                        {
                            in: "query",
                            name: "ref-object",
                            schema: {
                                type: "object",
                                additionalProperties: { $ref: "#/components/schemas/MyComponent" },
                                default: { id: 1, name: "foo" },
                            },
                        },
                    ],
                    responses: {
                        "200": {
                            description: "resoponse",
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                MyComponent: {
                    type: "object",
                    properties: {
                        id: {
                            type: "number",
                        },
                        name: {
                            type: "string",
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const MyComponent = z
        .object({ id: z.number(), name: z.string() })
        .partial()
        .passthrough();

      export const schemas = {
        MyComponent,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/sample",
          requestFormat: "json",
          parameters: [
            {
              name: "empty-object",
              type: "Query",
              schema: z
                .object({ foo: z.string() })
                .partial()
                .passthrough()
                .optional()
                .default({}),
            },
            {
              name: "default-object",
              type: "Query",
              schema: z
                .object({ foo: z.string() })
                .partial()
                .passthrough()
                .optional()
                .default({ foo: "bar" }),
            },
            {
              name: "ref-object",
              type: "Query",
              schema: z
                .record(MyComponent)
                .optional()
                .default({ id: 1, name: "foo" }),
            },
          ],
          response: z.void(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

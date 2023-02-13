import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/61
test("array-default-values", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "enums min max",
        },
        paths: {
            "/sample": {
                get: {
                    parameters: [
                        {
                            in: "query",
                            name: "array-empty",
                            schema: {
                                type: "array",
                                items: { type: "string" },
                                default: [],
                            },
                        },
                        {
                            in: "query",
                            name: "array-string",
                            schema: {
                                type: "array",
                                items: { type: "string" },
                                default: ["one", "two"],
                            },
                        },
                        {
                            in: "query",
                            name: "array-number",
                            schema: {
                                type: "array",
                                items: { type: "number" },
                                default: [1, 2],
                            },
                        },
                        {
                            in: "query",
                            name: "array-object",
                            schema: {
                                type: "array",
                                items: { type: "object", properties: { foo: { type: "string" } } },
                                default: [{ foo: "bar" }],
                            },
                        },
                        {
                            in: "query",
                            name: "array-ref-object",
                            schema: {
                                type: "array",
                                items: { $ref: "#/components/schemas/MyComponent" },
                                default: [{ id: 1, name: "foo" }],
                            },
                        },
                        {
                            in: "query",
                            name: "array-ref-enum",
                            schema: {
                                type: "array",
                                items: { $ref: "#/components/schemas/MyEnum" },
                                default: ["one", "two"],
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
                MyEnum: {
                    type: "string",
                    enum: ["one", "two", "three"],
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const array_object = z
        .array(z.object({ foo: z.string() }).partial())
        .optional()
        .default([{ foo: "bar" }]);
      const MyComponent = z.object({ id: z.number(), name: z.string() }).partial();
      const MyEnum = z.enum(["one", "two", "three"]);

      export const schemas = {
        array_object,
        MyComponent,
        MyEnum,
      };
      
      const endpoints = makeApi([
        {
          method: "get",
          path: "/sample",
          requestFormat: "json",
          parameters: [
            {
              name: "array-empty",
              type: "Query",
              schema: z.array(z.string()).optional().default([]),
            },
            {
              name: "array-string",
              type: "Query",
              schema: z.array(z.string()).optional().default(["one", "two"]),
            },
            {
              name: "array-number",
              type: "Query",
              schema: z.array(z.number()).optional().default([1, 2]),
            },
            {
              name: "array-object",
              type: "Query",
              schema: array_object,
            },
            {
              name: "array-ref-object",
              type: "Query",
              schema: z
                .array(MyComponent)
                .optional()
                .default([{ id: 1, name: "foo" }]),
            },
            {
              name: "array-ref-enum",
              type: "Query",
              schema: z.array(MyEnum).optional().default(["one", "two"]),
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

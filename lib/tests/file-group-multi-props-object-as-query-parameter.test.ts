import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/157
test("file group strategy with multi-props object as query parameter", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.1",
        info: {
            version: "v1",
            title: "file group strategy with multi-props object as query parameter"
        },
        paths: {
            "/api/v1/settlement": {
                post: {
                    parameters: [{
                        name: "req",
                        in: "query",
                        required: true,
                        schema: {
                            required: ["prop1", "prop2"],
                            type: "object",
                            properties: {
                                "prop1": { "type": "integer", "format": "int32" },
                                "prop2": { "type": "integer", "format": "int32" }
                            }
                        }
                    }],
                    responses: {
                        200: {
                            description: "OK"
                        }
                    }
                }
            }
        }
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { groupStrategy: 'method-file'}
    });
    // expect(output).toMatchInlineSnapshot(`
    //   "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
    //   import { z } from "zod";
    //
    //   const MyComponent = z
    //     .object({ id: z.number(), name: z.string() })
    //     .partial()
    //     .passthrough();
    //
    //   export const schemas = {
    //     MyComponent,
    //   };
    //
    //   const endpoints = makeApi([
    //     {
    //       method: "get",
    //       path: "/sample",
    //       requestFormat: "json",
    //       parameters: [
    //         {
    //           name: "empty-object",
    //           type: "Query",
    //           schema: z
    //             .object({ foo: z.string() })
    //             .partial()
    //             .passthrough()
    //             .optional()
    //             .default({}),
    //         },
    //         {
    //           name: "default-object",
    //           type: "Query",
    //           schema: z
    //             .object({ foo: z.string() })
    //             .partial()
    //             .passthrough()
    //             .optional()
    //             .default({ foo: "bar" }),
    //         },
    //         {
    //           name: "ref-object",
    //           type: "Query",
    //           schema: z
    //             .record(MyComponent)
    //             .optional()
    //             .default({ id: 1, name: "foo" }),
    //         },
    //       ],
    //       response: z.void(),
    //     },
    //   ]);
    //
    //   export const api = new Zodios(endpoints);
    //
    //   export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    //     return new Zodios(baseUrl, endpoints, options);
    //   }
    //   "
    // `);
});

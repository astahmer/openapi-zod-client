import type { OpenAPIObject } from "openapi3-ts/oas31";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("allOf-missing-and", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet": {
                put: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test2" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                test2: { type: "object", properties: { text2: { type: "string", minLength: 5, maxLength: 10 } } },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const test2 = z
        .object({ text2: z.string().min(5).max(10) })
        .partial()
        .passthrough();

      export const schemas = {
        test2,
      };

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: z
            .object({ text2: z.string().min(5).max(10) })
            .partial()
            .passthrough(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

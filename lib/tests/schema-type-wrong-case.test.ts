import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

test("schema-type-wrong-case", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet": {
                put: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test1" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                test1: { type: "object", properties: { text1: { type: "Integer" as any } } },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const test1 = z.object({ text1: z.number() }).partial();

      export const schemas = {
        test1,
      };

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: z.object({ text1: z.number() }).partial(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string) {
        return new Zodios(baseUrl, endpoints);
      }
      "
    `);
});

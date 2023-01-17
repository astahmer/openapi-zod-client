import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

test("number-default-cast", async () => {
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
                test1: {
                    type: "object",
                    properties: {
                        text1: { type: "string", default: "aaa" },
                        shouldBeFixed: { type: "number", default: "20" },
                        isFine: { type: "number", default: 30 },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const test1 = z
        .object({
          text1: z.string().default("aaa"),
          shouldBeFixed: z.number().default(20),
          isFine: z.number().default(30),
        })
        .partial();

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: test1,
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string) {
        return new Zodios(baseUrl, endpoints);
      }
      "
    `);
});

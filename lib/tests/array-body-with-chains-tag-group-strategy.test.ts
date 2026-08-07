import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

test("array-body-with-chains-tag-group-strategy", async () => {
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

      const putTest_Body = z
        .array(z.object({ testItem: z.string() }).partial())
        .min(1)
        .max(10);

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

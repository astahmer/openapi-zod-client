import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/120
test("allOf-missing-and", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: {
            title: "Pets",
            version: "1.0.0",
        },
        paths: {
            "/pets": {
                post: {
                    summary: "Post pets.",
                    operationId: "PostPets",
                    requestBody: {
                        $ref: "#/components/requestBodies/PostPetsRequest",
                    },
                    responses: {},
                },
            },
        },
        components: {
            schemas: {
                PostPetsRequest: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                        },
                    },
                },
            },
            requestBodies: {
                PostPetsRequest: {
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/PostPetsRequest",
                            },
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

      const PostPetsRequest = z.object({ id: z.string() }).partial();

      export const schemas = {
        PostPetsRequest,
      };

      const endpoints = makeApi([
        {
          method: "post",
          path: "/pets",
          requestFormat: "json",
          parameters: [
            {
              name: "body",
              type: "Body",
              schema: z.object({ id: z.string() }).partial(),
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

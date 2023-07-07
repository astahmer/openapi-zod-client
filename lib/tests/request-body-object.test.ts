import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";


test("request-body-object", async () => {
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
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        data: {
                                            $ref: "#/components/schemas/PostPetsRequest",
                                        },
                                    },
                                },
                            },
                        },
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
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const PostPetsRequest = z.object({ id: z.string() }).partial().passthrough();
      const PostPets_Body = z
        .object({ data: PostPetsRequest })
        .partial()
        .passthrough();

      export const schemas = {
        PostPetsRequest,
        PostPets_Body,
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
              schema: z.object({ data: PostPetsRequest }).partial().passthrough(),
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

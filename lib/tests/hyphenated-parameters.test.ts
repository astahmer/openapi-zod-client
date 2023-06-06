import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/78
test("common-parameters", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet/{pet-id}/uploadImage": {
                post: {
                    parameters: [{ name: "pet-id", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "boolean" } } },
                        },
                    },
                },
            },
            "/pet/{owner_name}": {
                post: {
                    parameters: [{ name: "owner_name", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "boolean" } } },
                        },
                    },
                },
            },
            "/pet/{owner_name-id}": {
                post: {
                    parameters: [{ name: "owner_name-id", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "boolean" } } },
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

      const endpoints = makeApi([
        {
          method: "post",
          path: "/pet/:owner_name",
          requestFormat: "json",
          parameters: [
            {
              name: "owner_name",
              type: "Path",
              schema: z.string(),
            },
          ],
          response: z.boolean(),
        },
        {
          method: "post",
          path: "/pet/:owner_nameId",
          requestFormat: "json",
          parameters: [
            {
              name: "owner_nameId",
              type: "Path",
              schema: z.string(),
            },
          ],
          response: z.boolean(),
        },
        {
          method: "post",
          path: "/pet/:petId/uploadImage",
          requestFormat: "json",
          parameters: [
            {
              name: "petId",
              type: "Path",
              schema: z.string(),
            },
          ],
          response: z.boolean(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

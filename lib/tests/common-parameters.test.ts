import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/78
test("common-parameters", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet": {
                parameters: [
                    { name: "petId", in: "query", required: true, schema: { type: "string" } },
                    { name: "otherParam", in: "query", schema: { $ref: "#/components/schemas/paramRef" } },
                ],
                put: {
                    parameters: [
                        { name: "petId", in: "query", required: true, schema: { type: "number" } },
                        { name: "personId", in: "query", required: true, schema: { type: "number" } },
                    ],
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "string" } } },
                        },
                    },
                },
                post: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { type: "boolean" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                paramRef: { type: "number" },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          parameters: [
            {
              name: "petId",
              type: "Query",
              schema: z.number(),
            },
            {
              name: "otherParam",
              type: "Query",
              schema: z.number().optional(),
            },
            {
              name: "personId",
              type: "Query",
              schema: z.number(),
            },
          ],
          response: z.string(),
        },
        {
          method: "post",
          path: "/pet",
          requestFormat: "json",
          parameters: [
            {
              name: "petId",
              type: "Query",
              schema: z.string(),
            },
            {
              name: "otherParam",
              type: "Query",
              schema: z.number().optional(),
            },
          ],
          response: z.boolean(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string) {
        return new Zodios(baseUrl, endpoints);
      }
      "
    `);
});

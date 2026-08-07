import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("missing-zod-chains", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Schema test", version: "1.0.0" },
        components: {
            schemas: {
                test1: { type: "string", minLength: 5 },
                test2: { type: "integer", minimum: 10 },
                test3: {
                    required: ["text", "num"],
                    properties: { text: { type: "string", minLength: 5 }, num: { type: "integer", minimum: 10 } },
                },
                nulltype: { type: "object", nullable: true },
                anyOfType: {
                    anyOf: [
                        { type: "object", nullable: true },
                        { type: "object", properties: { foo: { type: "string" } } },
                    ],
                },
            },
        },
        paths: {
            "/pet": {
                put: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test1" } } },
                        },
                        "401": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test2" } } },
                        },
                        "402": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test3" } } },
                        },
                        "403": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/nulltype" } } },
                        },
                        "404": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/anyOfType" } } },
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

      const test1 = z.string();
      const test2 = z.number();
      const test3 = z
        .object({ text: z.string().min(5), num: z.number().int().gte(10) })
        .passthrough();
      const nulltype = z.object({}).partial().passthrough();
      const anyOfType = z.union([
        z.object({}).partial().passthrough().nullable(),
        z.object({ foo: z.string() }).partial().passthrough(),
      ]);

      export const schemas = {
        test1,
        test2,
        test3,
        nulltype,
        anyOfType,
      };

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: z.string().min(5),
          errors: [
            {
              status: 401,
              description: \`Successful operation\`,
              schema: z.number().int().gte(10),
            },
            {
              status: 402,
              description: \`Successful operation\`,
              schema: z
                .object({ text: z.string().min(5), num: z.number().int().gte(10) })
                .passthrough(),
            },
            {
              status: 403,
              description: \`Successful operation\`,
              schema: z.object({}).partial().passthrough().nullable(),
            },
            {
              status: 404,
              description: \`Successful operation\`,
              schema: anyOfType,
            },
          ],
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

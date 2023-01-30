import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("export-schemas-option", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/export-schemas-option": {
                get: {
                    operationId: "123_example",
                    responses: {
                        "200": {
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "string" },
                UnusedSchemas: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                        another: { type: "string" },
                    },
                },
            },
        },
    };

    expect(getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: false }).schemas).toMatchInlineSnapshot(`
      {
          "Basic": "z.string()",
      }
    `);

    const ctx = getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: true });
    expect(ctx.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "123_example",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/export-schemas-option",
              "requestFormat": "json",
              "response": "z.string()",
          },
      ]
    `);

    expect(ctx.schemas).toMatchInlineSnapshot(`
      {
          "Basic": "z.string()",
          "UnusedSchemas": "z.object({ nested_prop: z.boolean(), another: z.string() }).partial()",
      }
    `);

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { shouldExportAllSchemas: true },
    });
    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const Basic = z.string();
      const UnusedSchemas = z
        .object({ nested_prop: z.boolean(), another: z.string() })
        .partial();

      export const schemas = {
        Basic,
        UnusedSchemas,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/export-schemas-option",
          requestFormat: "json",
          response: z.string(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

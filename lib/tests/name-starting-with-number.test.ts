import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("operationId-starting-with-number", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/operationId-starting-with-number": {
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
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc);
    expect(ctx.endpoints).toMatchInlineSnapshot(`
      [
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/operationId-starting-with-number",
              "requestFormat": "json",
              "response": "z.string()",
          },
      ]
    `);

    // TODO fix
    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { withAlias: true },
    });
    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const Basic = z.string();

      export const schemas = {
        Basic,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/operationId-starting-with-number",
          alias: "123_example",
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

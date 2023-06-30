import { generateZodClientFromOpenAPI, getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";
import type { OpenAPIObject } from "openapi3-ts";

test("handle-refs-with-dots-in-name", async () => {
    const doc = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/usual-ref-format": {
                get: {
                    operationId: "getWithUsualRefFormat",
                    responses: {
                        "200": {
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                        },
                    },
                },
            },
            "/ref-with-dot-in-name": {
                get: {
                    operationId: "getWithUnusualRefFormat",
                    responses: {
                        "200": {
                            content: {
                                "application/json": { schema: { $ref: "#components/schemas/Basic.Thing" } },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "string" },
                "Basic.Thing": {
                    type: "object",
                    properties: {
                        thing: { $ref: "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj" },
                    },
                },
                "Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj": {
                    type: "object",
                    properties: {
                        aaa: { type: "string" },
                        bbb: { type: "string" },
                    },
                },
            },
        },
    } as OpenAPIObject;

    expect(getZodiosEndpointDefinitionList(doc)).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {
              "#/components/schemas/Basic.Thing": Set {
                  "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
              },
          },
          "endpoints": [
              {
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/usual-ref-format",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/ref-with-dot-in-name",
                  "requestFormat": "json",
                  "response": "Basic_Thing",
              },
          ],
          "issues": {
              "ignoredFallbackResponse": [],
              "ignoredGenericError": [],
          },
          "refsDependencyGraph": {
              "#/components/schemas/Basic.Thing": Set {
                  "#/components/schemas/Aaa-bbb.CccDdd_eee.Fff_ggg.HhhIiii_jjj",
              },
          },
          "resolver": {
              "getSchemaByRef": [Function],
              "resolveRef": [Function],
              "resolveSchemaName": [Function],
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj": "z.object({ aaa: z.string(), bbb: z.string() }).partial()",
              "Basic": "z.string()",
              "Basic_Thing": "z.object({ thing: Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj }).partial()",
          },
      }
    `);

    const output = await generateZodClientFromOpenAPI({ openApiDoc: doc, disableWriteToFile: true });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const Basic = z.string();
      const Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj = z
        .object({ aaa: z.string(), bbb: z.string() })
        .partial();
      const Basic_Thing = z
        .object({ thing: Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj })
        .partial();

      export const schemas = {
        Basic,
        Aaa_bbb_CccDdd_eee_Fff_ggg_HhhIiii_jjj,
        Basic_Thing,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/ref-with-dot-in-name",
          requestFormat: "json",
          response: Basic_Thing,
        },
        {
          method: "get",
          path: "/usual-ref-format",
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

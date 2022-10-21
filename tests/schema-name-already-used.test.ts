import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("schema-name-already-used", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/schema-name-already-used": {
                get: {
                    operationId: "getSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["xxx", "yyy", "zzz"] },
                        },
                    ],
                },
                put: {
                    operationId: "putSchemaNameAlreadyUsed",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "string" },
                                    // schema: {
                                    //     type: "object",
                                    //     properties: { status: { type: "string", enum: ["aaa", "bbb", "ccc"] } },
                                    // },
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "schemaNameAlreadyUsed",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                    ],
                },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc);
    expect(ctx).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {},
          "endpoints": [
              {
                  "alias": "getSchemaNameAlreadyUsed",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "schemaNameAlreadyUsed",
                          "schema": "schemaNameAlreadyUsed",
                          "type": "Query",
                      },
                  ],
                  "path": "/schema-name-already-used",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "alias": "putSchemaNameAlreadyUsed",
                  "description": undefined,
                  "errors": [],
                  "method": "put",
                  "parameters": [
                      {
                          "name": "schemaNameAlreadyUsed",
                          "schema": "schemaNameAlreadyUsed__2",
                          "type": "Query",
                      },
                  ],
                  "path": "/schema-name-already-used",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
          ],
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "schemaNameAlreadyUsed": "z.enum(["xxx", "yyy", "zzz"]).optional()",
              "schemaNameAlreadyUsed__2": "z.enum(["aaa", "bbb", "ccc"]).optional()",
          },
          "types": {},
          "variables": {},
      }
    `);

    const result = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const schemaNameAlreadyUsed = z.enum(["xxx", "yyy", "zzz"]).optional();
      const schemaNameAlreadyUsed__2 = z.enum(["aaa", "bbb", "ccc"]).optional();

      const endpoints = makeApi([
        {
          method: "get",
          path: "/schema-name-already-used",
          requestFormat: "json",
          parameters: [
            {
              name: "schemaNameAlreadyUsed",
              type: "Query",
              schema: schemaNameAlreadyUsed,
            },
          ],
          response: z.string(),
        },
        {
          method: "put",
          path: "/schema-name-already-used",
          requestFormat: "json",
          parameters: [
            {
              name: "schemaNameAlreadyUsed",
              type: "Query",
              schema: schemaNameAlreadyUsed__2,
            },
          ],
          response: z.string(),
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

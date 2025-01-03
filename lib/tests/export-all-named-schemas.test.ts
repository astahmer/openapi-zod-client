import { OpenAPIObject } from "openapi3-ts/oas31";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("export-all-named-schemas", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/export-all-named-schemas": {
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
                            name: "sameSchemaSameName",
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
                delete: {
                    operationId: "deleteSchemaNameAlreadyUsed",
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
                            name: "sameSchemaDifferentName",
                            in: "query",
                            schema: { type: "string", enum: ["xxx", "yyy", "zzz"] },
                        },
                        {
                            name: "sameSchemaSameName",
                            in: "query",
                            schema: { type: "string", enum: ["xxx", "yyy", "zzz"] },
                        },
                    ],
                },
                post: {
                    operationId: "postSchemaNameAlreadyUsed",
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
                            schema: { type: "string", enum: ["ggg", "hhh", "iii"] },
                        },
                    ],
                },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2, exportAllNamedSchemas: true });
    expect(ctx).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {},
          "emittedType": {},
          "endpoints": [
              {
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "sameSchemaSameName",
                          "schema": "sameSchemaSameName",
                          "type": "Query",
                      },
                  ],
                  "path": "/export-all-named-schemas",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "description": undefined,
                  "errors": [],
                  "method": "put",
                  "parameters": [
                      {
                          "name": "schemaNameAlreadyUsed",
                          "schema": "schemaNameAlreadyUsed",
                          "type": "Query",
                      },
                  ],
                  "path": "/export-all-named-schemas",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "description": undefined,
                  "errors": [],
                  "method": "delete",
                  "parameters": [
                      {
                          "name": "sameSchemaDifferentName",
                          "schema": "sameSchemaDifferentName",
                          "type": "Query",
                      },
                      {
                          "name": "sameSchemaSameName",
                          "schema": "sameSchemaSameName",
                          "type": "Query",
                      },
                  ],
                  "path": "/export-all-named-schemas",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "description": undefined,
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "name": "schemaNameAlreadyUsed",
                          "schema": "schemaNameAlreadyUsed__2",
                          "type": "Query",
                      },
                  ],
                  "path": "/export-all-named-schemas",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
          ],
          "endpointsGroups": {},
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "sameSchemaDifferentName": "z.enum(["xxx", "yyy", "zzz"]).optional()",
              "sameSchemaSameName": "z.enum(["xxx", "yyy", "zzz"]).optional()",
              "schemaNameAlreadyUsed": "z.enum(["aaa", "bbb", "ccc"]).optional()",
              "schemaNameAlreadyUsed__2": "z.enum(["ggg", "hhh", "iii"]).optional()",
          },
          "types": {},
      }
    `);

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { complexityThreshold: 2, exportAllNamedSchemas: true },
    });

    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const sameSchemaSameName = z.enum(["xxx", "yyy", "zzz"]).optional();
      const schemaNameAlreadyUsed = z.enum(["aaa", "bbb", "ccc"]).optional();
      const sameSchemaDifferentName = z.enum(["xxx", "yyy", "zzz"]).optional();
      const schemaNameAlreadyUsed__2 = z.enum(["ggg", "hhh", "iii"]).optional();

      export const schemas = {
        sameSchemaSameName,
        schemaNameAlreadyUsed,
        sameSchemaDifferentName,
        schemaNameAlreadyUsed__2,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/export-all-named-schemas",
          requestFormat: "json",
          parameters: [
            {
              name: "sameSchemaSameName",
              type: "Query",
              schema: sameSchemaSameName,
            },
          ],
          response: z.string(),
        },
        {
          method: "put",
          path: "/export-all-named-schemas",
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
          method: "delete",
          path: "/export-all-named-schemas",
          requestFormat: "json",
          parameters: [
            {
              name: "sameSchemaDifferentName",
              type: "Query",
              schema: sameSchemaDifferentName,
            },
            {
              name: "sameSchemaSameName",
              type: "Query",
              schema: sameSchemaSameName,
            },
          ],
          response: z.string(),
        },
        {
          method: "post",
          path: "/export-all-named-schemas",
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

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("same-schema-different-name", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/same-schema-different-name": {
                put: {
                    operationId: "putSameSchemaDifferentName",
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
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                    ],
                },
                post: {
                    operationId: "postSameSchemaDifferentName",
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
                            name: "differentNameSameSchema",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"] },
                        },
                        {
                            name: "anotherDifferentNameWithSlightlyDifferentSchema",
                            in: "query",
                            schema: { type: "string", enum: ["aaa", "bbb", "ccc"], default: "aaa" },
                        },
                    ],
                },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
    expect(ctx).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {},
          "endpoints": [
              {
                  "alias": "putSameSchemaDifferentName",
                  "description": undefined,
                  "errors": [],
                  "method": "put",
                  "parameters": [
                      {
                          "name": "sameSchemaDifferentName",
                          "schema": "sameSchemaDifferentName",
                          "type": "Query",
                      },
                  ],
                  "path": "/same-schema-different-name",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "alias": "postSameSchemaDifferentName",
                  "description": undefined,
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "name": "differentNameSameSchema",
                          "schema": "sameSchemaDifferentName",
                          "type": "Query",
                      },
                      {
                          "name": "anotherDifferentNameWithSlightlyDifferentSchema",
                          "schema": "anotherDifferentNameWithSlightlyDifferentSchema",
                          "type": "Query",
                      },
                  ],
                  "path": "/same-schema-different-name",
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
              "anotherDifferentNameWithSlightlyDifferentSchema": "z.enum(["aaa", "bbb", "ccc"]).optional().default("aaa")",
              "sameSchemaDifferentName": "z.enum(["aaa", "bbb", "ccc"]).optional()",
          },
          "types": {},
      }
    `);

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { complexityThreshold: 2 },
    });
    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const sameSchemaDifferentName = z.enum(["aaa", "bbb", "ccc"]).optional();
      const anotherDifferentNameWithSlightlyDifferentSchema = z
        .enum(["aaa", "bbb", "ccc"])
        .optional()
        .default("aaa");

      const endpoints = makeApi([
        {
          method: "put",
          path: "/same-schema-different-name",
          requestFormat: "json",
          parameters: [
            {
              name: "sameSchemaDifferentName",
              type: "Query",
              schema: sameSchemaDifferentName,
            },
          ],
          response: z.string(),
        },
        {
          method: "post",
          path: "/same-schema-different-name",
          requestFormat: "json",
          parameters: [
            {
              name: "differentNameSameSchema",
              type: "Query",
              schema: sameSchemaDifferentName,
            },
            {
              name: "anotherDifferentNameWithSlightlyDifferentSchema",
              type: "Query",
              schema: anotherDifferentNameWithSlightlyDifferentSchema,
            },
          ],
          response: z.string(),
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

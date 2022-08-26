import { getZodiosEndpointDescriptionFromOpenApiDoc } from "../src";
import { expect, test } from "vitest";

test("autofix-unusual-ref-format", () => {
    expect(
        getZodiosEndpointDescriptionFromOpenApiDoc({
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
                "/unusual-ref-format": {
                    get: {
                        operationId: "getWithUnusualRefFormat",
                        responses: {
                            "200": {
                                content: { "application/json": { schema: { $ref: "#components/schemas/Basic" } } },
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
        })
    ).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {
              "#/components/schemas/Basic": "@circular__Dx47XJAfat",
              "#components/schemas/Basic": "@circular__FEo0hW6EyR",
          },
          "codeMetaByRef": {
              "#/components/schemas/Basic": "z.string().optional()",
              "#components/schemas/Basic": "z.string().optional()",
          },
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "alias": "getWithUsualRefFormat",
                  "description": undefined,
                  "method": "get",
                  "parameters": [],
                  "path": "/usual-ref-format",
                  "requestFormat": "json",
                  "response": "@var/Basic",
              },
              {
                  "alias": "getWithUnusualRefFormat",
                  "description": undefined,
                  "method": "get",
                  "parameters": [],
                  "path": "/unusual-ref-format",
                  "requestFormat": "json",
                  "response": "@var/Basic",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/Basic": "@ref__vJAv5J1oLvr__",
              "@var/getWithUnusualRefFormat": "@ref__vJAv5J1oLvr__",
              "@var/getWithUsualRefFormat": "@ref__vJAv5J1oLvr__",
          },
          "refsDependencyGraph": {},
          "responsesByOperationId": {
              "getWithUnusualRefFormat": {
                  "200": "@var/getWithUnusualRefFormat",
              },
              "getWithUsualRefFormat": {
                  "200": "@var/getWithUsualRefFormat",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Basic": "@ref__vJAv5J1oLvr__",
              "#components/schemas/Basic": "@ref__vJAv5J1oLvr__",
          },
          "zodSchemaByHash": {
              "@ref__vJAv5J1oLvr__": "z.string().optional()",
          },
      }
    `);
});

import { getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";

test("handle-refs-with-dots-in-name", () => {
    expect(
        getZodiosEndpointDefinitionList({
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
                    "Basic.Thing": { type: "number" },
                },
            },
        })
    ).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "alias": "getWithUsualRefFormat",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/usual-ref-format",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "alias": "getWithUnusualRefFormat",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/ref-with-dot-in-name",
                  "requestFormat": "json",
                  "response": "z.number()",
              },
          ],
          "getSchemaByRef": [Function],
          "issues": {
              "ignoredFallbackResponse": [],
              "ignoredGenericError": [],
          },
          "refsDependencyGraph": {},
          "schemaByName": {},
          "zodSchemaByName": {
              "Basic": "z.string()",
              "BasicThing": "z.number()",
          },
      }
    `);
});

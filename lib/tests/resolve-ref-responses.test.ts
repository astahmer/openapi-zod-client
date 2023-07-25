import { getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";

test("resolve-ref-responses", () => {
    // Without the refiner function passed.
    expect(
        getZodiosEndpointDefinitionList({
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/": {
                    get: {
                        operationId: "getExample",
                        responses: {
                            "200": {
                                $ref: "#/components/responses/ExampleResponse"
                            },
                        },
                    },
                },
            },
            components: {
                responses: {
                    ExampleResponse: {
                        description: "example response",
                        content: { "application/json": { schema: { type: "string" } } },
                    }
                }
            },
        })
    ).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
          ],
          "issues": {
              "ignoredFallbackResponse": [],
              "ignoredGenericError": [],
          },
          "refsDependencyGraph": {},
          "resolver": {
              "getSchemaByRef": [Function],
              "resolveRef": [Function],
              "resolveSchemaName": [Function],
          },
          "schemaByName": {},
          "zodSchemaByName": {},
      }
    `);
});

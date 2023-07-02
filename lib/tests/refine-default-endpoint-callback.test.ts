import { getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";

test("refine-default-endpoint-callback", () => {
    // Without the refiner function passed.
    expect(
        getZodiosEndpointDefinitionList({
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/basic-schema": {
                    get: {
                        operationId: "getBasicSchema",
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
                  "path": "/basic-schema",
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
          "zodSchemaByName": {
              "Basic": "z.string()",
          },
      }
    `);

    // With the refiner function passed.
    expect(
        getZodiosEndpointDefinitionList(
            {
                openapi: "3.0.3",
                info: { version: "1", title: "Example API" },
                paths: {
                    "/basic-schema": {
                        get: {
                            operationId: "getBasicSchema",
                            responses: {
                                "200": {
                                    content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                                },
                            },
                            security: [
                                {
                                    petstore_auth: ["read:schema"],
                                },
                            ],
                        },
                    },
                },
                components: {
                    schemas: {
                        Basic: { type: "string" },
                    },
                },
            },
            {
                endpointDefinitionRefiner: (defaultDefinition, operation) => ({
                    ...defaultDefinition,
                    operationId: operation.operationId,
                    security: operation.security,
                }),
            }
        )
    ).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "operationId": "getBasicSchema",
                  "parameters": [],
                  "path": "/basic-schema",
                  "requestFormat": "json",
                  "response": "z.string()",
                  "security": [
                      {
                          "petstore_auth": [
                              "read:schema",
                          ],
                      },
                  ],
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
          "zodSchemaByName": {
              "Basic": "z.string()",
          },
      }
    `);
});

import { expect, test } from "vitest";
import { getZodiosEndpointDefinitionFromOpenApiDoc } from "../src";

test("missing operationId outputs variables['undefined_Body']", () => {
    const result = getZodiosEndpointDefinitionFromOpenApiDoc({
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/media-objects/{id}": {
                put: {
                    requestBody: {
                        content: { "application/json": { schema: { $ref: "#/components/schemas/Basic" } } },
                    },
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
                Payload: { type: "object", properties: { thing: { type: "number" } } },
                Basic: { type: "string" },
            },
        },
    });
    expect(result.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "putMediaObjectsId",
              "description": undefined,
              "errors": [],
              "method": "put",
              "parameters": [
                  {
                      "description": undefined,
                      "name": "body",
                      "schema": "Basic",
                      "type": "Body",
                  },
              ],
              "path": "/media-objects/:id",
              "requestFormat": "json",
              "response": "Basic",
          },
      ]
    `);
});

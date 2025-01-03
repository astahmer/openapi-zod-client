import { getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";
import { OpenAPIObject } from "openapi3-ts/oas31";

test("with-deprecated", () => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/deprecated-endpoint": {
                get: {
                    operationId: "deprecatedEndpoint",
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                    deprecated: true,
                },
            },
            "/new-endpoint": {
                get: {
                    operationId: "newEndpoint",
                    responses: { "200": { content: { "application/json": { schema: { type: "number" } } } } },
                },
            },
        },
    };

    const defaultResult = getZodiosEndpointDefinitionList(doc);
    expect(defaultResult.endpoints).toMatchInlineSnapshot(`
      [
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/new-endpoint",
              "requestFormat": "json",
              "response": "z.number()",
          },
      ]
    `);

    const withCustomOption = getZodiosEndpointDefinitionList(doc, {
        withDeprecatedEndpoints: true,
    });
    expect(withCustomOption.endpoints).toMatchInlineSnapshot(`
      [
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/deprecated-endpoint",
              "requestFormat": "json",
              "response": "z.string()",
          },
          {
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/new-endpoint",
              "requestFormat": "json",
              "response": "z.number()",
          },
      ]
    `);
});

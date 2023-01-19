import { getZodClientTemplateContext, getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";
import { OpenAPIObject } from "openapi3-ts";

test("defaut-status-behavior", () => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/with-default-response": {
                get: {
                    operationId: "withDefaultResponse",
                    responses: { default: { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/with-default-error": {
                get: {
                    operationId: "withDefaultError",
                    responses: {
                        "200": { content: { "application/json": { schema: { type: "number" } } } },
                        default: { content: { "application/json": { schema: { type: "string" } } } },
                    },
                },
            },
        },
    };

    const defaultResult = getZodClientTemplateContext(doc);
    expect(defaultResult.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "withDefaultError",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/with-default-error",
              "requestFormat": "json",
              "response": "z.number()",
          },
          {
              "alias": "withDefaultResponse",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/with-default-response",
              "requestFormat": "json",
              "response": "z.void()",
          },
      ]
    `);

    const withAutoCorrectResult = getZodClientTemplateContext(doc, { defaultStatusBehavior: "auto-correct" });
    expect(withAutoCorrectResult.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "withDefaultError",
              "description": undefined,
              "errors": [
                  {
                      "description": undefined,
                      "schema": "z.string()",
                      "status": "default",
                  },
              ],
              "method": "get",
              "parameters": [],
              "path": "/with-default-error",
              "requestFormat": "json",
              "response": "z.number()",
          },
          {
              "alias": "withDefaultResponse",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/with-default-response",
              "requestFormat": "json",
              "response": "z.string()",
          },
      ]
    `);
});

import { getZodiosEndpointDefinitionFromOpenApiDoc } from "../src";
import { expect, test } from "vitest";
import { OpenAPIObject } from "openapi3-ts";

test("is-media-type-allowed", () => {
    const doc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/unusual-ref-format": {
                get: {
                    operationId: "getWithUnusualRefFormat",
                    responses: {
                        "200": {
                            content: {
                                "application/json": { schema: { $ref: "#components/schemas/Basic" } },
                                "application/json-ld": { schema: { $ref: "#components/schemas/CustomMediaType" } },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                Basic: { type: "string" },
                CustomMediaType: { type: "number" },
            },
        },
    };
    const defaultResult = getZodiosEndpointDefinitionFromOpenApiDoc(doc);
    expect(defaultResult.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "getWithUnusualRefFormat",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/unusual-ref-format",
              "requestFormat": "json",
              "response": "@var/Basic",
          },
      ]
    `);

    const withCustomOption = getZodiosEndpointDefinitionFromOpenApiDoc(doc, {
        isMediaTypeAllowed: (mediaType) => mediaType === "application/json-ld",
    });
    expect(withCustomOption.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "getWithUnusualRefFormat",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/unusual-ref-format",
              "requestFormat": "json",
              "response": "@var/CustomMediaType",
          },
      ]
    `);
});

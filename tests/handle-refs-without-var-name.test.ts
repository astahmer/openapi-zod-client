import { getZodClientTemplateContext } from "../src";
import { expect, test } from "vitest";

test("handle-refs-without-var-name", () => {
    expect(
        getZodClientTemplateContext({
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/something": {
                    get: {
                        operationId: "getSomething",
                        responses: {
                            "200": {
                                content: {
                                    "application/json": {
                                        schema: { type: "array", items: { $ref: "#/components/schemas/Basic" } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    Basic: { type: "object" },
                },
            },
        })
    ).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {},
          "endpoints": [
              {
                  "alias": "getSomething",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/something",
                  "requestFormat": "json",
                  "response": "z.array(Basic)",
              },
          ],
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "Basic": "z.object({}).partial()",
          },
          "types": {},
          "variables": {},
      }
    `);
});

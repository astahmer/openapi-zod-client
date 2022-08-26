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
          "endpoints": [
              {
                  "alias": "getSomething",
                  "description": undefined,
                  "method": "get",
                  "parameters": [],
                  "path": "/something",
                  "requestFormat": "json",
                  "response": "z.array(variables["getSomething"])",
              },
          ],
          "options": {
              "baseUrl": "__baseurl__",
              "withAlias": false,
          },
          "schemas": {
              "vIufVqrVmtM": "z.array(vpjM3iK32LY)",
              "vpjM3iK32LY": "z.object({}).partial().optional()",
          },
          "typeNameByRefHash": {},
          "types": {},
          "variables": {
              "getSomething": "vIufVqrVmtM",
          },
      }
    `);
});

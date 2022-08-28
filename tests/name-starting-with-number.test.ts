import { expect, test } from "vitest";
import { getZodClientTemplateContext } from "../src";

test("operationId-starting-with-number", () => {
    const ctx = getZodClientTemplateContext({
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/operationId-starting-with-number": {
                get: {
                    operationId: "123_example",
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
    });
    expect(ctx.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "123_example",
              "description": undefined,
              "method": "get",
              "parameters": [],
              "path": "/operationId-starting-with-number",
              "requestFormat": "json",
              "response": "variables["Basic"]",
          },
      ]
    `);

    expect(ctx.variables).toMatchInlineSnapshot(`
      {
          "Basic": "vZwdCSvA9Xq",
          "_123_example": "vZwdCSvA9Xq",
      }
    `);
});

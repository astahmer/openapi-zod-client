import { expect, test } from "vitest";
import { getZodClientTemplateContext } from "../src";

test("export-schemas-option", () => {
    const ctx = getZodClientTemplateContext(
        {
            openapi: "3.0.3",
            info: { version: "1", title: "Example API" },
            paths: {
                "/export-schemas-option": {
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
                    UnusedSchemas: {
                        type: "object",
                        properties: {
                            nested_prop: { type: "boolean" },
                            another: { type: "string" },
                        },
                    },
                },
            },
        },
        { shouldExportAllSchemas: true }
    );
    expect(ctx.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "123_example",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/export-schemas-option",
              "requestFormat": "json",
              "response": "variables["Basic"]",
          },
      ]
    `);

    expect(ctx.variables).toMatchInlineSnapshot(`
      {
          "Basic": "vZwdCSvA9Xq",
          "UnusedSchemas": "vwpxzXzCh7o",
          "_123_example": "vZwdCSvA9Xq",
      }
    `);
    expect(ctx.schemas).toMatchInlineSnapshot(`
      {
          "vZwdCSvA9Xq": "z.string()",
          "vwpxzXzCh7o": "z.object({ nested_prop: z.boolean(), another: z.string() }).partial()",
      }
    `);
});

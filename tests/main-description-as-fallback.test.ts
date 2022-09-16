import { SchemasObject } from "openapi3-ts";
import { expect, it } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

it("use main-description-as-fallback", async () => {
    const schemas = {
        Main: {
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
            },
            required: ["str", "nb"],
        },
    } as SchemasObject;

    const openApiDoc = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/example": {
                get: {
                    operationId: "getExample",
                    responses: {
                        "200": {
                            description: "get example",
                            content: { "application/json": { schema: schemas.Main } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { useMainResponseDescriptionAsEndpointDescriptionFallback: true },
    });

    expect(result).toMatchInlineSnapshot(`
      "import { asApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const vssLgQd9tqs = z.object({ str: z.string(), nb: z.number() });

      const variables = {
        getExample: vssLgQd9tqs,
      };

      const endpoints = asApi([
        {
          method: "get",
          path: "/example",
          description: \`get example\`,
          requestFormat: "json",
          response: z.object({ str: z.string(), nb: z.number() }),
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

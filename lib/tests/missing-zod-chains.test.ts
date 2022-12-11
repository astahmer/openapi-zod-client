import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("missing-zod-chains", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: { title: "Schema test", version: "1.0.0" },
        components: {
            schemas: {
                test1: { type: "string", minLength: 5 },
                test2: { type: "integer", minimum: 10 },
                test3: {
                    required: ["text", "num"],
                    properties: { text: { type: "string", minLength: 5 }, num: { type: "integer", minimum: 10 } },
                },
            },
        },
        paths: {
            "/pet": {
                put: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test1" } } },
                        },
                        "401": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test2" } } },
                        },
                        "402": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test3" } } },
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const test1 = z.string();
      const test2 = z.number();
      const test3 = z.object({
        text: z.string().min(5),
        num: z.number().int().gte(10),
      });

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: z.string().min(5),
          errors: [
            {
              status: 401,
              description: \`Successful operation\`,
              schema: z.number().int().gte(10),
            },
            {
              status: 402,
              description: \`Successful operation\`,
              schema: z.object({
                text: z.string().min(5),
                num: z.number().int().gte(10),
              }),
            },
          ],
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

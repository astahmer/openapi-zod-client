import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("allOf-missing-and", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/pet": {
                put: {
                    responses: {
                        "200": {
                            description: "Successful operation",
                            content: { "application/json": { schema: { $ref: "#/components/schemas/test4" } } },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                test1: { type: "object", properties: { text1: { type: "string" } } },
                test2: { type: "object", properties: { text2: { type: "number" } } },
                test3: { type: "object", properties: { text3: { type: "boolean" } } },
                test4: {
                    allOf: [
                        { $ref: "#/components/schemas/test1" },
                        { $ref: "#/components/schemas/test2" },
                        { $ref: "#/components/schemas/test3" },
                    ],
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const test1 = z.object({ text1: z.string() }).partial();
      const test2 = z.object({ text2: z.number() }).partial();
      const test3 = z.object({ text3: z.boolean() }).partial();
      const test4 = test1.and(test2).and(test3);

      const endpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: test4,
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("name-with-special-characters", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/name-with-special-characters": {
                get: {
                    operationId: "nameWithSPecialCharacters",
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { $ref: "#/components/schemas/1Name-With-Special---Characters" },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                "1Name-With-Special---Characters": { type: "string" },
            },
        },
    };
    const ctx = getZodClientTemplateContext(openApiDoc);
    expect(ctx.endpoints).toMatchInlineSnapshot(`
      [
          {
              "alias": "nameWithSPecialCharacters",
              "description": undefined,
              "errors": [],
              "method": "get",
              "parameters": [],
              "path": "/name-with-special-characters",
              "requestFormat": "json",
              "response": "_1Name_With_Special_Characters",
          },
      ]
    `);

    expect(ctx.variables).toMatchInlineSnapshot("{}");

    const result = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const _1Name_With_Special_Characters = z.string();

      const variables = {};

      const endpoints = makeApi([
        {
          method: "get",
          path: "/name-with-special-characters",
          requestFormat: "json",
          response: _1Name_With_Special_Characters,
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

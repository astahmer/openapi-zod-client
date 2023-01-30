import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";
import type { OpenAPIObject, SchemaObject } from "openapi3-ts";

test("handle-props-with-special-characters", async () => {
    const schemaWithSpecialCharacters = {
        properties: {
            "@id": { type: "string" },
            id: { type: "number" },
        },
    } as SchemaObject;

    expect(getZodSchema({ schema: schemaWithSpecialCharacters })).toMatchInlineSnapshot(
        '"z.object({ "@id": z.string(), id: z.number() }).partial()"'
    );

    const output = await generateZodClientFromOpenAPI({
        openApiDoc: {
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
                                        schema: schemaWithSpecialCharacters,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        } as OpenAPIObject,
        disableWriteToFile: true,
    });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const endpoints = makeApi([
        {
          method: "get",
          path: "/something",
          requestFormat: "json",
          response: z.object({ "@id": z.string(), id: z.number() }).partial(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("union-array", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Union array",
        },
        paths: {},
        components: {
            schemas: {
                Foo: {
                    type: "object",
                    properties: {
                        foo: { type: "integer", enum: [1, 2] },
                    },
                },
                Bar: {
                    type: "object",
                    properties: {
                        bar: { type: "string", enum: ["a", "b"] },
                    },
                },
                Union: {
                    type: "object",
                    properties: {
                        unionArray: {
                            items: {
                                anyOf: [{ $ref: "#/components/schemas/Foo" }, { $ref: "#/components/schemas/Bar" }],
                            },
                            type: "array",
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { shouldExportAllTypes: true },
    });
    expect(output).toMatchInlineSnapshot(`
    "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
    import { z } from "zod";

    type Union = Partial<{
      unionArray: Array<Foo | Bar>;
    }>;
    type Foo = Partial<{
      foo: 1 | 2;
    }>;
    type Bar = Partial<{
      bar: "a" | "b";
    }>;

    const endpoints = makeApi([]);

    export const api = new Zodios(endpoints);

    export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
      return new Zodios(baseUrl, endpoints, options);
    }
    "
    `);
});

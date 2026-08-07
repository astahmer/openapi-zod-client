import type { OpenAPIObject } from "openapi3-ts";
import { describe, expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
describe("missing-zod-chains", () => {
    test("string with chains", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    stringWithChains: { type: "string", minLength: 5 },
                },
            },
            paths: {
                "/pet": {
                    put: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": { schema: { $ref: "#/components/schemas/stringWithChains" } },
                                },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const stringWithChains = z.string().min(5);

          export const schemas = {
            stringWithChains,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              requestFormat: "json",
              response: z.string().min(5),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });

    test("integer with chains", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    integerWithChains: { type: "integer", minimum: 10 },
                },
            },
            paths: {
                "/pet": {
                    put: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": { schema: { $ref: "#/components/schemas/integerWithChains" } },
                                },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const integerWithChains = z.number().int().gte(10);

          export const schemas = {
            integerWithChains,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              requestFormat: "json",
              response: z.number().int().gte(10),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });

    test("object without required", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    objectWithoutRequired: {
                        properties: {
                            text: { type: "string", minLength: 5 },
                            num: { type: "integer", minimum: 10 },
                            bool: { type: "boolean" },
                        },
                    },
                },
            },
            paths: {
                "/pet": {
                    put: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/objectWithoutRequired" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const objectWithoutRequired = z
            .object({
              text: z.string().min(5),
              num: z.number().int().gte(10),
              bool: z.boolean(),
            })
            .partial()
            .passthrough();

          export const schemas = {
            objectWithoutRequired,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              requestFormat: "json",
              response: z
                .object({
                  text: z.string().min(5),
                  num: z.number().int().gte(10),
                  bool: z.boolean(),
                })
                .partial()
                .passthrough(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });

    test("object with required", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    objectWithRequired: {
                        required: ["text", "num"],
                        properties: {
                            text: { type: "string", minLength: 5 },
                            num: { type: "integer", minimum: 10 },
                            bool: { type: "boolean" },
                        },
                    },
                },
            },
            paths: {
                "/pet": {
                    put: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": { schema: { $ref: "#/components/schemas/objectWithRequired" } },
                                },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const objectWithRequired = z
            .object({
              text: z.string().min(5),
              num: z.number().int().gte(10),
              bool: z.boolean().optional(),
            })
            .passthrough();

          export const schemas = {
            objectWithRequired,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              requestFormat: "json",
              response: z
                .object({
                  text: z.string().min(5),
                  num: z.number().int().gte(10),
                  bool: z.boolean().optional(),
                })
                .passthrough(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });

    test("nullable object", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    nullable: { type: "object", nullable: true },
                },
            },
            paths: {
                "/pet": {
                    put: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/nullable" } } },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const nullable = z.object({}).partial().passthrough().nullable();

          export const schemas = {
            nullable,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              requestFormat: "json",
              response: z.object({}).partial().passthrough().nullable(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });

    test("anyOf, oneOf, allOf, array", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    anyOfType: {
                        anyOf: [
                            { type: "object", nullable: true },
                            { type: "object", properties: { foo: { type: "string" } } },
                        ],
                    },
                    oneOfType: {
                        oneOf: [
                            { type: "object", nullable: true },
                            { type: "object", properties: { foo: { type: "string" } } },
                        ],
                    },
                    allOfType: {
                        allOf: [
                            { type: "object", properties: { foo: { type: "string" } } },
                            { type: "object", properties: { bar: { type: "string" } } },
                        ],
                    },
                },
            },
            paths: {
                "/anyOf": {
                    get: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/anyOfType" } } },
                            },
                        },
                    },
                },
                "/oneOf": {
                    get: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/oneOfType" } } },
                            },
                        },
                    },
                },
                "/allOf": {
                    get: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/allOfType" } } },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const anyOfType = z.union([
            z.object({}).partial().passthrough().nullable(),
            z.object({ foo: z.string() }).partial().passthrough(),
          ]);
          const oneOfType = z.union([
            z.object({}).partial().passthrough().nullable(),
            z.object({ foo: z.string() }).partial().passthrough(),
          ]);
          const allOfType = z
            .object({ foo: z.string() })
            .partial()
            .passthrough()
            .and(z.object({ bar: z.string() }).partial().passthrough());

          export const schemas = {
            anyOfType,
            oneOfType,
            allOfType,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/allOf",
              requestFormat: "json",
              response: allOfType,
            },
            {
              method: "get",
              path: "/anyOf",
              requestFormat: "json",
              response: anyOfType,
            },
            {
              method: "get",
              path: "/oneOf",
              requestFormat: "json",
              response: oneOfType,
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });

    test("nullable primitive", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.0",
            info: { title: "Schema test", version: "1.0.0" },
            components: {
                schemas: {
                    nullableString: {
                        type: "string",
                        nullable: true,
                    },
                },
            },
            paths: {
                "/pet": {
                    put: {
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/nullableString" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const nullableString = z.string().nullable();

          export const schemas = {
            nullableString,
          };

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              requestFormat: "json",
              response: z.string().nullable(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });
});

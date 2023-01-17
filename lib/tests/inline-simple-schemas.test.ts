import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("inline-simple-schemas", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/inline-simple-schemas": {
                get: {
                    operationId: "123_example",
                    responses: {
                        "200": {
                            content: { "application/json": { schema: { $ref: "#/components/schemas/BasicString" } } },
                        },
                        400: {
                            content: {
                                "application/json": { schema: { type: "string", enum: ["xxx", "yyy", "zzz"] } },
                            },
                        },
                        401: {
                            content: {
                                "application/json": { schema: { type: "string", enum: ["xxx", "yyy", "zzz"] } },
                            },
                        },
                        402: {
                            content: { "application/json": { schema: { type: "array", items: { type: "string" } } } },
                        },
                        403: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            str: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        404: {
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/SimpleObject",
                                    },
                                },
                            },
                        },
                        405: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/SimpleObject",
                                        },
                                    },
                                },
                            },
                        },
                        406: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                str: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        407: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: {
                                            $ref: "#/components/schemas/ComplexObject",
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                BasicString: { type: "string" },
                SimpleObject: {
                    type: "object",
                    properties: {
                        str: { type: "string" },
                    },
                },
                ComplexObject: {
                    type: "object",
                    properties: {
                        str: { type: "string" },
                        strRef: { $ref: "#/components/schemas/BasicString" },
                        num: { type: "number" },
                        bool: { type: "boolean" },
                        ref: { $ref: "#/components/schemas/SimpleObject" },
                        refArray: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/SimpleObject",
                            },
                        },
                    },
                },
            },
        },
    };

    const ctx = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
    expect(ctx).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const BasicString = z.string();
      const SimpleObject = z.object({ str: z.string() }).partial();
      const ComplexObject = z
        .object({
          str: z.string(),
          strRef: BasicString,
          num: z.number(),
          bool: z.boolean(),
          ref: SimpleObject,
          refArray: z.array(SimpleObject),
        })
        .partial();

      export const schemas = {
        BasicString,
        SimpleObject,
        ComplexObject,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/inline-simple-schemas",
          requestFormat: "json",
          response: z.string(),
          errors: [
            {
              status: 400,
              schema: z.enum(["xxx", "yyy", "zzz"]),
            },
            {
              status: 401,
              schema: z.enum(["xxx", "yyy", "zzz"]),
            },
            {
              status: 402,
              schema: z.array(z.string()),
            },
            {
              status: 403,
              schema: z.object({ str: z.string() }).partial(),
            },
            {
              status: 404,
              schema: z.object({ str: z.string() }).partial(),
            },
            {
              status: 405,
              schema: z.array(SimpleObject),
            },
            {
              status: 406,
              schema: z.array(z.object({ str: z.string() }).partial()),
            },
            {
              status: 407,
              schema: z.array(ComplexObject),
            },
          ],
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string) {
        return new Zodios(baseUrl, endpoints);
      }
      "
    `);
});

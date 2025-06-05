import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

test("description-in-zod", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "Numerical enums",
        },
        paths: {
            "/sample": {
                get: {
                    parameters: [
                        {
                            in: "query",
                            name: "foo",
                            schema: {
                                type: "integer",
                                enum: [1, -2, 3],
                            },
                            description: "foo description",
                        },
                        {
                            in: "query",
                            name: "bar",
                            schema: {
                                type: "number",
                                enum: [1.2, 34, -56.789],
                            },
                            description: "bar description",
                        },
                        {
                            in: "query",
                            name: "baz",
                            schema: {
                                type: "number",
                                enum: [1.3, 34.1, -57.89],
                            },
                            description: "baz\nmultiline\ndescription",
                        },
                        {
                            in: "query",
                            name: "qux",
                            schema: {
                                type: "string",
                            },
                            description: "      ", // spaces only description
                        },
                        {
                            in: "query",
                            name: "backtick",
                            schema: {
                                type: "string",
                            },
                            description: "This is a `code` example\nwith multiline\nand more `backticks`",
                        },
                        {
                            in: "query",
                            name: "singleBacktick",
                            schema: {
                                type: "string",
                            },
                            description: "Single line with `backticks` should work",
                        },
                        {
                            in: "query",
                            name: "doubleQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'This has "double quotes" in single line',
                        },
                        {
                            in: "query",
                            name: "mixedQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Mixed `backticks` and "quotes"\nover multiple\nlines',
                        },
                        {
                            in: "query",
                            name: "carriageReturn",
                            schema: {
                                type: "string",
                            },
                            description: "Line with carriage\rreturn only",
                        },
                        {
                            in: "query",
                            name: "windowsNewline",
                            schema: {
                                type: "string",
                            },
                            description: "Windows style\r\nnewlines with `code`",
                        },
                    ],
                    responses: {
                        "200": {
                            description: "resoponse",
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: { withDescription: true },
    });
    expect(output).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const endpoints = makeApi([
        {
          method: "get",
          path: "/sample",
          requestFormat: "json",
          parameters: [
            {
              name: "foo",
              type: "Query",
              schema: z
                .union([z.literal(1), z.literal(-2), z.literal(3)])
                .describe("foo description")
                .optional(),
            },
            {
              name: "bar",
              type: "Query",
              schema: z
                .union([z.literal(1.2), z.literal(34), z.literal(-56.789)])
                .describe("bar description")
                .optional(),
            },
            {
              name: "baz",
              type: "Query",
              schema: z
                .union([z.literal(1.3), z.literal(34.1), z.literal(-57.89)])
                .describe(
                  \`baz
      multiline
      description\`
                )
                .optional(),
            },
            {
              name: "qux",
              type: "Query",
              schema: z.string().optional(),
            },
            {
              name: "backtick",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`This is a \\\`code\\\` example
      with multiline
      and more \\\`backticks\\\`\`
                )
                .optional(),
            },
            {
              name: "singleBacktick",
              type: "Query",
              schema: z
                .string()
                .describe("Single line with \`backticks\` should work")
                .optional(),
            },
            {
              name: "doubleQuotes",
              type: "Query",
              schema: z
                .string()
                .describe('This has "double quotes" in single line')
                .optional(),
            },
            {
              name: "mixedQuotes",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`Mixed \\\`backticks\\\` and "quotes"
      over multiple
      lines\`
                )
                .optional(),
            },
            {
              name: "carriageReturn",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`Line with carriage
      return only\`
                )
                .optional(),
            },
            {
              name: "windowsNewline",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`Windows style
      newlines with \\\`code\\\`\`
                )
                .optional(),
            },
          ],
          response: z.void(),
        },
      ]);

      export const api = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      "
    `);
});

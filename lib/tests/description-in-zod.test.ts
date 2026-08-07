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
                            name: "multilineBackticks",
                            schema: {
                                type: "string",
                            },
                            description: "`Multiline`\n with \n`backticks`\n",
                        },
                        {
                            in: "query",
                            name: "singleLineBackticks",
                            schema: {
                                type: "string",
                            },
                            description: "`Single line` with `backticks`",
                        },
                        {
                            in: "query",
                            name: "multiLineDoubleQuotes",
                            schema: {
                                type: "string",
                            },
                            description: '"Multiline"\n with \n"double quotes"\n',
                        },
                        {
                            in: "query",
                            name: "singleLineDoubleQuotes",
                            schema: {
                                type: "string",
                            },
                            description: '"Single line" with "double quotes"',
                        },
                        {
                            in: "query",
                            name: "multilineMixedQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Multiline with `backticks`\n and "double quotes"\n',
                        },
                        {
                            in: "query",
                            name: "singleLineMixedQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Single line with `backticks` and "double quotes"',
                        },
                        {
                            in: "query",
                            name: "carriageReturnBackticks",
                            schema: {
                                type: "string",
                            },
                            description: "Carrige return with `backticks`\r",
                        },
                        {
                            in: "query",
                            name: "carriageReturnDoubleQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Carrige return with "double quotes"\r',
                        },
                        {
                            in: "query",
                            name: "carriageReturnMixedQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Carrige return with `backticks` and "double quotes"\r',
                        },
                        {
                            in: "query",
                            name: "windowsStyleNewlineWithBackticks",
                            schema: {
                                type: "string",
                            },
                            description: "Windows style newline with `backticks`\r\n",
                        },
                        {
                            in: "query",
                            name: "windowsStyleNewlineWithDoubleQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Windows style newline with "double quotes"\r\n',
                        },
                        {
                            in: "query",
                            name: "windowsStyleNewlineWithMixedQuotes",
                            schema: {
                                type: "string",
                            },
                            description: 'Windows style newline with `backticks` and "double quotes"\r\n',
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
              name: "multilineBackticks",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`\\\`Multiline\\\`
       with 
      \\\`backticks\\\`\`
                )
                .optional(),
            },
            {
              name: "singleLineBackticks",
              type: "Query",
              schema: z
                .string()
                .describe("\`Single line\` with \`backticks\`")
                .optional(),
            },
            {
              name: "multiLineDoubleQuotes",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`"Multiline"
       with 
      "double quotes"\`
                )
                .optional(),
            },
            {
              name: "singleLineDoubleQuotes",
              type: "Query",
              schema: z
                .string()
                .describe('"Single line" with "double quotes"')
                .optional(),
            },
            {
              name: "multilineMixedQuotes",
              type: "Query",
              schema: z
                .string()
                .describe(
                  \`Multiline with \\\`backticks\\\`
       and "double quotes"\`
                )
                .optional(),
            },
            {
              name: "singleLineMixedQuotes",
              type: "Query",
              schema: z
                .string()
                .describe('Single line with \`backticks\` and "double quotes"')
                .optional(),
            },
            {
              name: "carriageReturnBackticks",
              type: "Query",
              schema: z
                .string()
                .describe("Carrige return with \`backticks\`")
                .optional(),
            },
            {
              name: "carriageReturnDoubleQuotes",
              type: "Query",
              schema: z
                .string()
                .describe('Carrige return with "double quotes"')
                .optional(),
            },
            {
              name: "carriageReturnMixedQuotes",
              type: "Query",
              schema: z
                .string()
                .describe('Carrige return with \`backticks\` and "double quotes"')
                .optional(),
            },
            {
              name: "windowsStyleNewlineWithBackticks",
              type: "Query",
              schema: z
                .string()
                .describe("Windows style newline with \`backticks\`")
                .optional(),
            },
            {
              name: "windowsStyleNewlineWithDoubleQuotes",
              type: "Query",
              schema: z
                .string()
                .describe('Windows style newline with "double quotes"')
                .optional(),
            },
            {
              name: "windowsStyleNewlineWithMixedQuotes",
              type: "Query",
              schema: z
                .string()
                .describe(
                  'Windows style newline with \`backticks\` and "double quotes"'
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

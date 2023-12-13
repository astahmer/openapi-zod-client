import type { OpenAPIObject } from "openapi3-ts";
import { describe, expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../src';
import type { TemplateContextGroupStrategy } from '../src/template-context';

// https://github.com/astahmer/openapi-zod-client/issues/157
describe("file group strategy with multi-props object as query parameter", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.1",
        info: {
            version: "v1",
            title: "file group strategy with multi-props object as query parameter"
        },
        paths: {
            "/api/v1/test": {
                post: {
                    parameters: [{
                        name: "req",
                        in: "query",
                        required: true,
                        schema: {
                            required: ["prop1", "prop2"],
                            type: "object",
                            properties: {
                                "prop1": { "type": "integer", "format": "int32" },
                                "prop2": { "type": "integer", "format": "int32" }
                            }
                        }
                    }],
                    responses: {
                        200: {
                            description: "OK"
                        }
                    }
                }
            }
        }
    };

    const runTest = async (groupStrategy: TemplateContextGroupStrategy): Promise<void> => {
        const output = await generateZodClientFromOpenAPI({
            disableWriteToFile: true,
            openApiDoc,
            options: { groupStrategy }
        });

        const expectedIndex = `    "__index": "export { ${groupStrategy === "method-file" ? "PostApi" : "DefaultApi"} } from "./${groupStrategy === "method-file" ? "post" : "Default"}";\n",`;

        const expectedApi = `    "${groupStrategy === "method-file" ? "post" : "Default"}": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const req = z
  .object({ prop1: z.number().int(), prop2: z.number().int() })
  .passthrough();

export const schemas = {
  req,
};

const endpoints = makeApi([
  {
    method: "post",
    path: "/api/v1/test",
    requestFormat: "json",
    parameters: [
      {
        name: "req",
        type: "Query",
        schema: req,
      },
    ],
    response: z.void(),
  },
]);

export const ${groupStrategy === 'method-file' ? 'PostApi' : 'DefaultApi'} = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}\n",`;

        const expected = groupStrategy === 'method-file'
          ? `{\n${expectedIndex}\n${expectedApi}\n}`
          : `{\n${expectedApi}\n${expectedIndex}\n}`;

        expect(output).toMatchInlineSnapshot(expected);
    };

    test('tag file', () => runTest('tag-file'));
    test('method file', () => runTest('method-file'));
});

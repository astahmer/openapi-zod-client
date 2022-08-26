import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolve } from "path";
import { getZodiosEndpointDescriptionFromOpenApiDoc } from "../src";
import { expect, test } from "vitest";

test("ref-in-another-file", async () => {
    const openApiDoc = (await SwaggerParser.bundle(
        resolve(__dirname, "ref-in-another-file", "partial.yaml")
    )) as OpenAPIObject;
    expect(getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc)).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {},
          "codeMetaByRef": {},
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "alias": undefined,
                  "description": "Gets robots.txt",
                  "method": "get",
                  "parameters": [],
                  "path": "/robots.txt",
                  "requestFormat": "json",
                  "response": "z.object({ name: z.string(), completed: z.boolean() })",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {},
          "refsDependencyGraph": {},
          "responsesByOperationId": {},
          "schemaHashByRef": {},
          "zodSchemaByHash": {},
      }
    `);
});

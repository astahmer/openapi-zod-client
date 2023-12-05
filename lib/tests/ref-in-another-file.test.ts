import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolve } from "path";
import { getZodiosEndpointDefinitionList } from "../src";
import { expect, test } from "vitest";

test("ref-in-another-file", async () => {
    const openApiDoc = (await SwaggerParser.bundle(
        resolve(__dirname, "ref-in-another-file", "partial.yaml")
    )) as OpenAPIObject;
    expect(getZodiosEndpointDefinitionList(openApiDoc)).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "description": "Gets robots.txt",
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/robots.txt",
                  "requestFormat": "json",
                  "response": "z.object({ name: z.string(), completed: z.boolean(), "0_property_starting_with_number": z.number() }).passthrough()",
              },
          ],
          "issues": {
              "ignoredFallbackResponse": [],
              "ignoredGenericError": [],
          },
          "refsDependencyGraph": {},
          "resolver": {
              "getSchemaByRef": [Function],
              "resolveRef": [Function],
              "resolveSchemaName": [Function],
          },
          "schemaByName": {},
          "zodSchemaByName": {},
      }
    `);
});

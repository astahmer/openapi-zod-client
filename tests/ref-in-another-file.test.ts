import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { resolve } from "path";
import { getZodiosEndpointDefinitionFromOpenApiDoc } from "../src";
import { expect, test } from "vitest";

test("ref-in-another-file", async () => {
    const openApiDoc = (await SwaggerParser.bundle(
        resolve(__dirname, "ref-in-another-file", "partial.yaml")
    )) as OpenAPIObject;
    expect(getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc)).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "alias": "getRobots_txt",
                  "description": "Gets robots.txt",
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/robots.txt",
                  "requestFormat": "json",
                  "response": "z.object({ name: z.string(), completed: z.boolean() })",
              },
          ],
          "getSchemaByRef": [Function],
          "refsDependencyGraph": {},
          "schemaByName": {},
          "zodSchemaByName": {},
      }
    `);
});

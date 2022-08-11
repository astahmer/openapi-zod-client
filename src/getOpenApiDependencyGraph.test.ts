import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { get } from "pastable/server";
import { expect, test } from "vitest";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";

test("petstore.yaml", async () => {
    const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
    const getSchemaByRef = (ref: string) => get(openApiDoc, ref.replace("#/", "").replaceAll("/", ".")) as SchemaObject;
    const result = getOpenApiDependencyGraph(
        Object.keys(openApiDoc.components?.schemas || {}).map((name) => `#/components/schemas/${name}`),
        getSchemaByRef
    );
    expect(result).toMatchInlineSnapshot(`
      {
          "#/components/schemas/Customer": Set {
              "#/components/schemas/Address",
          },
          "#/components/schemas/Pet": Set {
              "#/components/schemas/Category",
              "#/components/schemas/Tag",
          },
      }
    `);
});

test("complex relations", () => {
    const schemas = {
        Basic: { type: "object", properties: { prop: { type: "string" }, second: { type: "number" } } },
        WithNested: { type: "object", properties: { nested: { type: "string" }, nestedRef: { $ref: "DeepNested" } } },
        ObjectWithArrayOfRef: {
            type: "object",
            properties: {
                exampleProp: { type: "string" },
                another: { type: "number" },
                link: { type: "array", items: { $ref: "WithNested" } },
                someReference: { $ref: "Basic" },
            },
        },
        DeepNested: { type: "object", properties: { deep: { type: "boolean" } } },
        Root: {
            type: "object",
            properties: {
                str: { type: "string" },
                reference: {
                    $ref: "ObjectWithArrayOfRef",
                },
                inline: {
                    type: "object",
                    properties: {
                        nested_prop: { type: "boolean" },
                    },
                },
                another: { $ref: "WithNested" },
                basic: { $ref: "Basic" },
                differentPropSameRef: { $ref: "Basic" },
            },
        },
    } as Record<string, SchemaObject>;

    const getSchemaByRef = (ref: string) => schemas[ref];
    const result = getOpenApiDependencyGraph(Object.keys(schemas), getSchemaByRef);
    expect(result).toMatchInlineSnapshot(`
      {
          "ObjectWithArrayOfRef": Set {
              "WithNested",
              "Basic",
          },
          "Root": Set {
              "ObjectWithArrayOfRef",
              "WithNested",
              "Basic",
          },
          "WithNested": Set {
              "DeepNested",
          },
      }
    `);
});

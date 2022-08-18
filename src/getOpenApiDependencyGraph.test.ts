import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { get } from "pastable/server";
import { expect, test } from "vitest";
import { getOpenApiDependencyGraph } from "./getOpenApiDependencyGraph";
import { topologicalSort } from "./topologicalSort";

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
    expect(topologicalSort(result)).toMatchInlineSnapshot(`
      [
          "#/components/schemas/Address",
          "#/components/schemas/Customer",
          "#/components/schemas/Category",
          "#/components/schemas/Tag",
          "#/components/schemas/Pet",
      ]
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
    expect(topologicalSort(result)).toMatchInlineSnapshot(`
      [
          "DeepNested",
          "WithNested",
          "Basic",
          "ObjectWithArrayOfRef",
          "Root",
      ]
    `);
});

test("recursive relations", () => {
    const UserWithFriends = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "UserWithFriends" },
            friends: { type: "array", items: { $ref: "Friend" } },
            bestFriend: { $ref: "Friend" },
        },
    } as SchemaObject;

    const Friend = {
        type: "object",
        properties: {
            nickname: { type: "string" },
            user: { $ref: "UserWithFriends" },
            circle: { type: "array", items: { $ref: "Friend" } },
        },
    } as SchemaObject;
    const schemas = { UserWithFriends, Friend } as Record<string, SchemaObject>;

    const getSchemaByRef = (ref: string) => schemas[ref];
    const result = getOpenApiDependencyGraph(Object.keys(schemas), getSchemaByRef);
    expect(result).toMatchInlineSnapshot(`
      {
          "Friend": Set {
              "UserWithFriends",
              "Friend",
          },
          "UserWithFriends": Set {
              "UserWithFriends",
              "Friend",
          },
      }
    `);
    expect(topologicalSort(result)).toMatchInlineSnapshot(`
      [
          "Friend",
          "UserWithFriends",
      ]
    `);
});

test("recursive relations along with some basics schemas", () => {
    const schemas = {
        UserWithFriends: {
            type: "object",
            properties: {
                name: { type: "string" },
                parent: { $ref: "UserWithFriends" },
                friends: { type: "array", items: { $ref: "Friend" } },
                bestFriend: { $ref: "Friend" },
                withNested: { $ref: "WithNested" },
            },
        },
        Friend: {
            type: "object",
            properties: {
                nickname: { type: "string" },
                user: { $ref: "UserWithFriends" },
                circle: { type: "array", items: { $ref: "Friend" } },
                basic: { $ref: "Basic" },
            },
        },
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
          "Friend": Set {
              "UserWithFriends",
              "Friend",
              "Basic",
          },
          "ObjectWithArrayOfRef": Set {
              "WithNested",
              "Basic",
          },
          "Root": Set {
              "ObjectWithArrayOfRef",
              "WithNested",
              "Basic",
          },
          "UserWithFriends": Set {
              "UserWithFriends",
              "Friend",
              "WithNested",
          },
          "WithNested": Set {
              "DeepNested",
          },
      }
    `);
    expect(topologicalSort(result)).toMatchInlineSnapshot(`
      [
          "Basic",
          "Friend",
          "DeepNested",
          "WithNested",
          "UserWithFriends",
          "ObjectWithArrayOfRef",
          "Root",
      ]
    `);
});

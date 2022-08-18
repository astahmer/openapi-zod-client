import { getZodSchema, getZodiosEndpointDescriptionFromOpenApiDoc } from "../src";
import { test, expect, describe } from "vitest";
import { SchemaObject } from "openapi3-ts";

describe("recursive-schema", () => {
    const UserSchema = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "#/components/schemas/User" },
        },
    } as SchemaObject;

    test("indirect single recursive", () => {
        const ctx = {
            dependenciesByHashRef: {},
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            getSchemaByRef: (ref) => UserSchema,
        };
        expect(
            getZodSchema({
                schema: {
                    type: "object",
                    properties: {
                        recursive: {
                            $ref: "#/components/schemas/User",
                        },
                        basic: { type: "number" },
                    },
                },
                ctx,
            })
        ).toMatchInlineSnapshot(
            '"z.object({ recursive: @ref__vhbrYSISkDY__, basic: z.number() }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "codeMetaByRef": {
                  "#/components/schemas/User": "z.object({ name: z.string(), parent: @ref__vhbrYSISkDY__ }).partial().optional()",
              },
              "dependenciesByHashRef": {},
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/User": "@ref__vhbrYSISkDY__",
              },
              "zodSchemaByHash": {
                  "@ref__vhbrYSISkDY__": "z.object({ name: z.string(), parent: @circular__#/components/schemas/User }).partial().optional()",
              },
          }
        `);
    });

    test("direct recursive", () => {
        const ctx = {
            dependenciesByHashRef: {},
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            getSchemaByRef: (ref) => UserSchema,
        };
        expect(getZodSchema({ schema: UserSchema, ctx })).toMatchInlineSnapshot(
            '"z.object({ name: z.string(), parent: @ref__vhbrYSISkDY__ }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "codeMetaByRef": {
                  "#/components/schemas/User": "z.object({ name: z.string(), parent: @ref__vhbrYSISkDY__ }).partial().optional()",
              },
              "dependenciesByHashRef": {},
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/User": "@ref__vhbrYSISkDY__",
              },
              "zodSchemaByHash": {
                  "@ref__vhbrYSISkDY__": "z.object({ name: z.string(), parent: @circular__#/components/schemas/User }).partial().optional()",
              },
          }
        `);
    });

    const UserWithFriends = {
        type: "object",
        properties: {
            name: { type: "string" },
            parent: { $ref: "#/components/schemas/UserWithFriends" },
            friends: { type: "array", items: { $ref: "#/components/schemas/Friend" } },
            bestFriend: { $ref: "#/components/schemas/Friend" },
        },
    } as SchemaObject;

    const Friend = {
        type: "object",
        properties: {
            nickname: { type: "string" },
            user: { $ref: "#/components/schemas/UserWithFriends" },
            circle: { type: "array", items: { $ref: "#/components/schemas/Friend" } },
        },
    } as SchemaObject;
    const schemas = { UserWithFriends, Friend };

    test("multiple recursive in one root schema", () => {
        const ctx = {
            dependenciesByHashRef: {},
            hashByVariableName: {},
            schemaHashByRef: {},
            zodSchemaByHash: {},
            codeMetaByRef: {},
            getSchemaByRef: (ref: string) => schemas[ref.replace("#/components/schemas/", "")],
        };
        expect(
            getZodSchema({
                schema: {
                    type: "object",
                    properties: {
                        recursiveUser: {
                            $ref: "UserWithFriends",
                        },
                        basic: { type: "number" },
                    },
                },
                ctx,
            })
        ).toMatchInlineSnapshot(
            '"z.object({ recursiveUser: @ref__vYrXydXnHzX__, basic: z.number() }).partial().optional()"'
        );
        expect(ctx).toMatchInlineSnapshot(`
          {
              "codeMetaByRef": {
                  "#/components/schemas/Friend": "z.object({ nickname: z.string(), user: @circular__#/components/schemas/UserWithFriends, circle: z.array(@circular__#/components/schemas/Friend) }).partial().optional()",
                  "#/components/schemas/UserWithFriends": "z.object({ name: z.string(), parent: @circular__#/components/schemas/UserWithFriends, friends: z.array(@ref__v2St8s4oWft__), bestFriend: @ref__v2St8s4oWft__ }).partial().optional()",
                  "UserWithFriends": "z.object({ name: z.string(), parent: @ref__vMGi8roYpAx__, friends: z.array(@ref__v2St8s4oWft__), bestFriend: @ref__v2St8s4oWft__ }).partial().optional()",
              },
              "dependenciesByHashRef": {},
              "getSchemaByRef": [Function],
              "hashByVariableName": {},
              "schemaHashByRef": {
                  "#/components/schemas/Friend": "@ref__v2St8s4oWft__",
                  "#/components/schemas/UserWithFriends": "@ref__vMGi8roYpAx__",
                  "UserWithFriends": "@ref__vYrXydXnHzX__",
              },
              "zodSchemaByHash": {
                  "@ref__v2St8s4oWft__": "z.object({ nickname: z.string(), user: @circular__#/components/schemas/UserWithFriends, circle: z.array(@circular__#/components/schemas/Friend) }).partial().optional()",
                  "@ref__vMGi8roYpAx__": "z.object({ name: z.string(), parent: @circular__#/components/schemas/UserWithFriends, friends: z.array(@ref__v2St8s4oWft__), bestFriend: @ref__v2St8s4oWft__ }).partial().optional()",
                  "@ref__vYrXydXnHzX__": "z.object({ name: z.string(), parent: @ref__vMGi8roYpAx__, friends: z.array(@ref__v2St8s4oWft__), bestFriend: @ref__v2St8s4oWft__ }).partial().optional()",
              },
          }
        `);

        expect(
            getZodiosEndpointDescriptionFromOpenApiDoc({
                openapi: "3.0.3",
                info: {
                    title: "Swagger Petstore - OpenAPI 3.0",
                    description:
                        "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about\nSwagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!\nYou can now help us improve the API whether it's by making changes to the definition itself or to the code.\nThat way, with time, we can improve the API in general, and expose some of the new features in OAS3.\n\n_If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the `Edit > Load Petstore OAS 2.0` menu option!_\n\nSome useful links:\n- [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)\n- [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                    termsOfService: "http://swagger.io/terms/",
                    contact: {
                        email: "apiteam@swagger.io",
                    },
                    license: {
                        name: "Apache 2.0",
                        url: "http://www.apache.org/licenses/LICENSE-2.0.html",
                    },
                    version: "1.0.11",
                },
                paths: {
                    "/example": {
                        get: {
                            operationId: "getExample",
                            responses: {
                                "200": {
                                    description: "OK",
                                    content: {
                                        "application/json": {
                                            schema: {
                                                type: "object",
                                                properties: {
                                                    someUser: {
                                                        $ref: "#/components/schemas/UserWithFriends",
                                                    },
                                                    someProp: { type: "boolean" },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                components: { schemas },
            })
        ).toMatchInlineSnapshot(`
          {
              "codeMetaByRef": {
                  "#/components/schemas/Friend": "z.object({ nickname: z.string(), user: @circular__#/components/schemas/UserWithFriends, circle: z.array(@circular__#/components/schemas/Friend) }).partial().optional()",
                  "#/components/schemas/UserWithFriends": "z.object({ name: z.string(), parent: @ref__vMGi8roYpAx__, friends: z.array(@ref__v2St8s4oWft__), bestFriend: @ref__v2St8s4oWft__ }).partial().optional()",
              },
              "dependenciesByHashRef": {},
              "endpoints": [
                  {
                      "alias": "getExample",
                      "description": undefined,
                      "method": "get",
                      "parameters": [],
                      "path": "/example",
                      "requestFormat": "json",
                      "response": "z.object({ someUser: @ref__vMGi8roYpAx__, someProp: z.boolean() }).partial()",
                  },
              ],
              "getSchemaByRef": [Function],
              "hashByVariableName": {
                  "@var/getExample": "@ref__v50o3OSl8k4__",
              },
              "refsDependencyGraph": {
                  "#/components/schemas/Friend": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
                  "#/components/schemas/UserWithFriends": Set {
                      "#/components/schemas/UserWithFriends",
                      "#/components/schemas/Friend",
                  },
              },
              "responsesByOperationId": {
                  "getExample": {
                      "200": "@var/getExample",
                  },
              },
              "schemaHashByRef": {
                  "#/components/schemas/Friend": "@ref__v2St8s4oWft__",
                  "#/components/schemas/UserWithFriends": "@ref__vMGi8roYpAx__",
              },
              "zodSchemaByHash": {
                  "@ref__v2St8s4oWft__": "z.object({ nickname: z.string(), user: @circular__#/components/schemas/UserWithFriends, circle: z.array(@circular__#/components/schemas/Friend) }).partial().optional()",
                  "@ref__v50o3OSl8k4__": "z.object({ someUser: @ref__vMGi8roYpAx__, someProp: z.boolean() }).partial()",
                  "@ref__vMGi8roYpAx__": "z.object({ name: z.string(), parent: @circular__#/components/schemas/UserWithFriends, friends: z.array(@ref__v2St8s4oWft__), bestFriend: @ref__v2St8s4oWft__ }).partial().optional()",
              },
          }
        `);
    });
});

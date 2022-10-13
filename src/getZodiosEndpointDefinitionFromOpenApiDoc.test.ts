import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getZodiosEndpointDefinitionFromOpenApiDoc } from "./getZodiosEndpointDefinitionFromOpenApiDoc";

const baseDoc = {
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
} as OpenAPIObject;

const schemas = {
    Order: {
        type: "object",
        properties: {
            id: { type: "integer", format: "int64", example: 10 },
            petId: { type: "integer", format: "int64", example: 198772 },
            quantity: { type: "integer", format: "int32", example: 7 },
            shipDate: { type: "string", format: "date-time" },
            status: {
                type: "string",
                description: "Order Status",
                example: "approved",
                enum: ["placed", "approved", "delivered"],
            },
            complete: { type: "boolean" },
        },
        xml: { name: "order" },
    } as SchemaObject,
    Pet: {
        required: ["name", "photoUrls"],
        type: "object",
        properties: {
            id: { type: "integer", format: "int64", example: 10 },
            name: { type: "string", example: "doggie" },
            category: { $ref: "#/components/schemas/Category" },
            photoUrls: { type: "array", xml: { wrapped: true }, items: { type: "string", xml: { name: "photoUrl" } } },
            tags: { type: "array", xml: { wrapped: true }, items: { $ref: "#/components/schemas/Tag" } },
            status: { type: "string", description: "pet status in the store", enum: ["available", "pending", "sold"] },
        },
        xml: { name: "pet" },
    } as SchemaObject,
    Category: {
        type: "object",
        properties: { id: { type: "integer", format: "int64", example: 1 }, name: { type: "string", example: "Dogs" } },
        xml: { name: "category" },
    } as SchemaObject,
    Tag: {
        type: "object",
        properties: { id: { type: "integer", format: "int64" }, name: { type: "string" } },
        xml: { name: "tag" },
    } as SchemaObject,
} as const;

test("getZodiosEndpointDefinitionFromOpenApiDoc /store/order", () => {
    expect(
        getZodiosEndpointDefinitionFromOpenApiDoc({
            ...baseDoc,
            components: { schemas: { Order: schemas.Order } },
            paths: {
                "/store/order": {
                    post: {
                        tags: ["store"],
                        summary: "Place an order for a pet",
                        description: "Place a new order in the store",
                        operationId: "placeOrder",
                        requestBody: {
                            content: {
                                "application/json": { schema: { $ref: "#/components/schemas/Order" } },
                                "application/xml": { schema: { $ref: "#/components/schemas/Order" } },
                                "application/x-www-form-urlencoded": { schema: { $ref: "#/components/schemas/Order" } },
                            },
                        },
                        responses: {
                            "200": {
                                description: "successful operation",
                                content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } },
                            },
                            "405": { description: "Invalid input" },
                        },
                    },
                },
            },
        })
    ).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {
              "#/components/schemas/Order": "@circular__wK9RiJx7oC",
          },
          "codeMetaByRef": {
              "#/components/schemas/Order": "z.object({ id: z.number(), petId: z.number(), quantity: z.number(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
          },
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "alias": "placeOrder",
                  "description": "Place a new order in the store",
                  "errors": [
                      {
                          "description": "Invalid input",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "@var/placeOrder_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/store/order",
                  "requestFormat": "json",
                  "response": "@var/Order",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/Order": "@ref__vLBYC40hXo1__",
              "@var/placeOrder": "@ref__vLBYC40hXo1__",
              "@var/placeOrder_Body": "@ref__vLBYC40hXo1__",
          },
          "refsDependencyGraph": {},
          "responsesByOperationId": {
              "placeOrder": {
                  "200": "@var/placeOrder",
                  "405": "z.void()",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Order": "@ref__vLBYC40hXo1__",
          },
          "zodSchemaByHash": {
              "@ref__vLBYC40hXo1__": "z.object({ id: z.number(), petId: z.number(), quantity: z.number(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
          },
      }
    `);
});

test("getZodiosEndpointDefinitionFromOpenApiDoc /pet", () => {
    expect(
        getZodiosEndpointDefinitionFromOpenApiDoc({
            ...baseDoc,
            components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
            paths: {
                "/pet": {
                    put: {
                        tags: ["pet"],
                        summary: "Update an existing pet",
                        description: "Update an existing pet by Id",
                        operationId: "updatePet",
                        requestBody: {
                            description: "Update an existent pet in the store",
                            content: {
                                "application/json": { schema: { $ref: "#/components/schemas/Pet" } },
                                "application/xml": { schema: { $ref: "#/components/schemas/Pet" } },
                                "application/x-www-form-urlencoded": { schema: { $ref: "#/components/schemas/Pet" } },
                            },
                            required: true,
                        },
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": { schema: { $ref: "#/components/schemas/Pet" } },
                                    "application/xml": { schema: { $ref: "#/components/schemas/Pet" } },
                                },
                            },
                            "400": { description: "Invalid ID supplied" },
                            "404": { description: "Pet not found" },
                            "405": { description: "Validation exception" },
                        },
                        security: [{ petstore_auth: ["write:pets", "read:pets"] }],
                    },
                    post: {
                        tags: ["pet"],
                        summary: "Add a new pet to the store",
                        description: "Add a new pet to the store",
                        operationId: "addPet",
                        requestBody: {
                            description: "Create a new pet in the store",
                            content: {
                                "application/json": { schema: { $ref: "#/components/schemas/Pet" } },
                                "application/xml": { schema: { $ref: "#/components/schemas/Pet" } },
                                "application/x-www-form-urlencoded": { schema: { $ref: "#/components/schemas/Pet" } },
                            },
                            required: true,
                        },
                        responses: {
                            "200": {
                                description: "Successful operation",
                                content: {
                                    "application/json": { schema: { $ref: "#/components/schemas/Pet" } },
                                    "application/xml": { schema: { $ref: "#/components/schemas/Pet" } },
                                },
                            },
                            "405": { description: "Invalid input" },
                        },
                        security: [{ petstore_auth: ["write:pets", "read:pets"] }],
                    },
                },
            },
        })
    ).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {
              "#/components/schemas/Category": "@circular__xzXS1LrlKn",
              "#/components/schemas/Pet": "@circular__nUVh3ER5kL",
              "#/components/schemas/Tag": "@circular__ihL6q6cZXP",
          },
          "codeMetaByRef": {
              "#/components/schemas/Category": "z.object({ id: z.number(), name: z.string() }).partial()",
              "#/components/schemas/Pet": "z.object({ id: z.number().optional(), name: z.string(), category: @ref__vR1x0k5qaLk__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vR1x0k5qaLk__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "#/components/schemas/Tag": "z.object({ id: z.number(), name: z.string() }).partial()",
          },
          "deepDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "endpoints": [
              {
                  "alias": "updatePet",
                  "description": "Update an existing pet by Id",
                  "errors": [
                      {
                          "description": "Invalid ID supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "Pet not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                      {
                          "description": "Validation exception",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "put",
                  "parameters": [
                      {
                          "description": "Update an existent pet in the store",
                          "name": "body",
                          "schema": "@var/updatePet_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "@var/Pet",
              },
              {
                  "alias": "addPet",
                  "description": "Add a new pet to the store",
                  "errors": [
                      {
                          "description": "Invalid input",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "post",
                  "parameters": [
                      {
                          "description": "Create a new pet in the store",
                          "name": "body",
                          "schema": "@var/addPet_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "@var/Pet",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/Pet": "@ref__v8JbFEq2fUl__",
              "@var/addPet": "@ref__v8JbFEq2fUl__",
              "@var/addPet_Body": "@ref__v8JbFEq2fUl__",
              "@var/updatePet": "@ref__v8JbFEq2fUl__",
              "@var/updatePet_Body": "@ref__v8JbFEq2fUl__",
          },
          "refsDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "responsesByOperationId": {
              "addPet": {
                  "200": "@var/addPet",
                  "405": "z.void()",
              },
              "updatePet": {
                  "200": "@var/updatePet",
                  "400": "z.void()",
                  "404": "z.void()",
                  "405": "z.void()",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Category": "@ref__vR1x0k5qaLk__",
              "#/components/schemas/Pet": "@ref__v8JbFEq2fUl__",
              "#/components/schemas/Tag": "@ref__vR1x0k5qaLk__",
          },
          "zodSchemaByHash": {
              "@ref__v8JbFEq2fUl__": "z.object({ id: z.number().optional(), name: z.string(), category: @ref__vR1x0k5qaLk__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vR1x0k5qaLk__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "@ref__vR1x0k5qaLk__": "z.object({ id: z.number(), name: z.string() }).partial()",
          },
      }
    `);
});

test("getZodiosEndpointDefinitionFromOpenApiDoc /pet/findXXX", () => {
    expect(
        getZodiosEndpointDefinitionFromOpenApiDoc({
            ...baseDoc,
            components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
            paths: {
                "/pet/findByStatus": {
                    get: {
                        tags: ["pet"],
                        summary: "Finds Pets by status",
                        description: "Multiple status values can be provided with comma separated strings",
                        operationId: "findPetsByStatus",
                        parameters: [
                            {
                                name: "status",
                                in: "query",
                                description: "Status values that need to be considered for filter",
                                required: false,
                                explode: true,
                                schema: {
                                    type: "string",
                                    default: "available",
                                    enum: ["available", "pending", "sold"],
                                },
                            },
                        ],
                        responses: {
                            "200": {
                                description: "successful operation",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Pet",
                                            },
                                        },
                                    },
                                    "application/xml": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Pet",
                                            },
                                        },
                                    },
                                },
                            },
                            "400": {
                                description: "Invalid status value",
                            },
                        },
                        security: [
                            {
                                petstore_auth: ["write:pets", "read:pets"],
                            },
                        ],
                    },
                },
                "/pet/findByTags": {
                    get: {
                        tags: ["pet"],
                        summary: "Finds Pets by tags",
                        description:
                            "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                        operationId: "findPetsByTags",
                        parameters: [
                            {
                                name: "tags",
                                in: "query",
                                description: "Tags to filter by",
                                required: false,
                                explode: true,
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "string",
                                    },
                                },
                            },
                        ],
                        responses: {
                            "200": {
                                description: "successful operation",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Pet",
                                            },
                                        },
                                    },
                                    "application/xml": {
                                        schema: {
                                            type: "array",
                                            items: {
                                                $ref: "#/components/schemas/Pet",
                                            },
                                        },
                                    },
                                },
                            },
                            "400": {
                                description: "Invalid tag value",
                            },
                        },
                        security: [
                            {
                                petstore_auth: ["write:pets", "read:pets"],
                            },
                        ],
                    },
                },
            },
        })
    ).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {
              "#/components/schemas/Category": "@circular__xzXS1LrlKn",
              "#/components/schemas/Pet": "@circular__nUVh3ER5kL",
              "#/components/schemas/Tag": "@circular__ihL6q6cZXP",
          },
          "codeMetaByRef": {
              "#/components/schemas/Category": "z.object({ id: z.number(), name: z.string() }).partial()",
              "#/components/schemas/Pet": "z.object({ id: z.number().optional(), name: z.string(), category: @ref__vR1x0k5qaLk__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vR1x0k5qaLk__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "#/components/schemas/Tag": "z.object({ id: z.number(), name: z.string() }).partial()",
          },
          "deepDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "endpoints": [
              {
                  "alias": "findPetsByStatus",
                  "description": "Multiple status values can be provided with comma separated strings",
                  "errors": [
                      {
                          "description": "Invalid status value",
                          "schema": "z.void()",
                          "status": 400,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "status",
                          "schema": "@var/status",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByStatus",
                  "requestFormat": "json",
                  "response": "z.array(@ref__v8JbFEq2fUl__)",
              },
              {
                  "alias": "findPetsByTags",
                  "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                  "errors": [
                      {
                          "description": "Invalid tag value",
                          "schema": "z.void()",
                          "status": 400,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "tags",
                          "schema": "@var/tags",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByTags",
                  "requestFormat": "json",
                  "response": "z.array(@ref__v8JbFEq2fUl__)",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/findPetsByStatus": "@ref__vh4fxCvnN1b__",
              "@var/findPetsByTags": "@ref__vh4fxCvnN1b__",
              "@var/status": "@ref__vlh4E1pXYTG__",
              "@var/tags": "@ref__vGqL1kemtHF__",
          },
          "refsDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "responsesByOperationId": {
              "findPetsByStatus": {
                  "200": "@var/findPetsByStatus",
                  "400": "z.void()",
              },
              "findPetsByTags": {
                  "200": "@var/findPetsByTags",
                  "400": "z.void()",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Category": "@ref__vR1x0k5qaLk__",
              "#/components/schemas/Pet": "@ref__v8JbFEq2fUl__",
              "#/components/schemas/Tag": "@ref__vR1x0k5qaLk__",
          },
          "zodSchemaByHash": {
              "@ref__v8JbFEq2fUl__": "z.object({ id: z.number().optional(), name: z.string(), category: @ref__vR1x0k5qaLk__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vR1x0k5qaLk__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "@ref__vGqL1kemtHF__": "z.array(z.string()).optional()",
              "@ref__vR1x0k5qaLk__": "z.object({ id: z.number(), name: z.string() }).partial()",
              "@ref__vh4fxCvnN1b__": "z.array(@ref__v8JbFEq2fUl__)",
              "@ref__vlh4E1pXYTG__": "z.enum(["available", "pending", "sold"]).optional()",
          },
      }
    `);
});

test("petstore.yaml", async () => {
    const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
    const result = getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc);
    expect(result).toMatchInlineSnapshot(`
      {
          "circularTokenByRef": {
              "#/components/schemas/ApiResponse": "@circular__UW2sXbIQK7",
              "#/components/schemas/Category": "@circular__xzXS1LrlKn",
              "#/components/schemas/Order": "@circular__wK9RiJx7oC",
              "#/components/schemas/Pet": "@circular__nUVh3ER5kL",
              "#/components/schemas/Tag": "@circular__ihL6q6cZXP",
              "#/components/schemas/User": "@circular__9Dvq68jEoU",
          },
          "codeMetaByRef": {
              "#/components/schemas/ApiResponse": "z.object({ code: z.number(), type: z.string(), message: z.string() }).partial()",
              "#/components/schemas/Category": "z.object({ id: z.number(), name: z.string() }).partial()",
              "#/components/schemas/Order": "z.object({ id: z.number(), petId: z.number(), quantity: z.number(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "#/components/schemas/Pet": "z.object({ id: z.number().optional(), name: z.string(), category: @ref__vR1x0k5qaLk__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vR1x0k5qaLk__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "#/components/schemas/Tag": "z.object({ id: z.number(), name: z.string() }).partial()",
              "#/components/schemas/User": "z.object({ id: z.number(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number() }).partial()",
          },
          "deepDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "endpoints": [
              {
                  "alias": "updatePet",
                  "description": "Update an existing pet by Id",
                  "errors": [
                      {
                          "description": "Invalid ID supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "Pet not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                      {
                          "description": "Validation exception",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "put",
                  "parameters": [
                      {
                          "description": "Update an existent pet in the store",
                          "name": "body",
                          "schema": "@var/updatePet_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "@var/Pet",
              },
              {
                  "alias": "addPet",
                  "description": "Add a new pet to the store",
                  "errors": [
                      {
                          "description": "Invalid input",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "post",
                  "parameters": [
                      {
                          "description": "Create a new pet in the store",
                          "name": "body",
                          "schema": "@var/addPet_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "@var/Pet",
              },
              {
                  "alias": "findPetsByStatus",
                  "description": "Multiple status values can be provided with comma separated strings",
                  "errors": [
                      {
                          "description": "Invalid status value",
                          "schema": "z.void()",
                          "status": 400,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "status",
                          "schema": "@var/status",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByStatus",
                  "requestFormat": "json",
                  "response": "z.array(@ref__v8JbFEq2fUl__)",
              },
              {
                  "alias": "findPetsByTags",
                  "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                  "errors": [
                      {
                          "description": "Invalid tag value",
                          "schema": "z.void()",
                          "status": 400,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "tags",
                          "schema": "@var/tags",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByTags",
                  "requestFormat": "json",
                  "response": "z.array(@ref__v8JbFEq2fUl__)",
              },
              {
                  "alias": "getPetById",
                  "description": "Returns a single pet",
                  "errors": [
                      {
                          "description": "Invalid ID supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "Pet not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "petId",
                          "schema": "z.number()",
                          "type": "Path",
                      },
                  ],
                  "path": "/pet/:petId",
                  "requestFormat": "json",
                  "response": "@var/Pet",
              },
              {
                  "alias": "updatePetWithForm",
                  "description": "",
                  "errors": [
                      {
                          "description": "Invalid input",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "post",
                  "parameters": [
                      {
                          "name": "petId",
                          "schema": "z.number()",
                          "type": "Path",
                      },
                      {
                          "name": "name",
                          "schema": "z.string().optional()",
                          "type": "Query",
                      },
                      {
                          "name": "status",
                          "schema": "z.string().optional()",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/:petId",
                  "requestFormat": "json",
              },
              {
                  "alias": "deletePet",
                  "description": "delete a pet",
                  "errors": [
                      {
                          "description": "Invalid pet value",
                          "schema": "z.void()",
                          "status": 400,
                      },
                  ],
                  "method": "delete",
                  "parameters": [
                      {
                          "name": "api_key",
                          "schema": "z.string().optional()",
                          "type": "Header",
                      },
                      {
                          "name": "petId",
                          "schema": "z.number()",
                          "type": "Path",
                      },
                  ],
                  "path": "/pet/:petId",
                  "requestFormat": "json",
              },
              {
                  "alias": "uploadFile",
                  "description": "",
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "name": "petId",
                          "schema": "z.number()",
                          "type": "Path",
                      },
                      {
                          "name": "additionalMetadata",
                          "schema": "z.string().optional()",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/:petId/uploadImage",
                  "requestFormat": "json",
                  "response": "@var/ApiResponse",
              },
              {
                  "alias": "getInventory",
                  "description": "Returns a map of status codes to quantities",
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/store/inventory",
                  "requestFormat": "json",
                  "response": "z.record(z.number())",
              },
              {
                  "alias": "placeOrder",
                  "description": "Place a new order in the store",
                  "errors": [
                      {
                          "description": "Invalid input",
                          "schema": "z.void()",
                          "status": 405,
                      },
                  ],
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "@var/placeOrder_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/store/order",
                  "requestFormat": "json",
                  "response": "@var/Order",
              },
              {
                  "alias": "getOrderById",
                  "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                  "errors": [
                      {
                          "description": "Invalid ID supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "Order not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "orderId",
                          "schema": "z.number()",
                          "type": "Path",
                      },
                  ],
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
                  "response": "@var/Order",
              },
              {
                  "alias": "deleteOrder",
                  "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                  "errors": [
                      {
                          "description": "Invalid ID supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "Order not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                  ],
                  "method": "delete",
                  "parameters": [
                      {
                          "name": "orderId",
                          "schema": "z.number()",
                          "type": "Path",
                      },
                  ],
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
              },
              {
                  "alias": "createUser",
                  "description": "This can only be done by the logged in user.",
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "description": "Created user object",
                          "name": "body",
                          "schema": "@var/createUser_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/user",
                  "requestFormat": "json",
                  "response": "@var/User",
              },
              {
                  "alias": "createUsersWithListInput",
                  "description": "Creates list of users with given input array",
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "@var/createUsersWithListInput_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/user/createWithList",
                  "requestFormat": "json",
                  "response": "@var/User",
              },
              {
                  "alias": "loginUser",
                  "description": "",
                  "errors": [
                      {
                          "description": "Invalid username/password supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "username",
                          "schema": "z.string().optional()",
                          "type": "Query",
                      },
                      {
                          "name": "password",
                          "schema": "z.string().optional()",
                          "type": "Query",
                      },
                  ],
                  "path": "/user/login",
                  "requestFormat": "json",
                  "response": "z.string()",
              },
              {
                  "alias": "logoutUser",
                  "description": "",
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/user/logout",
                  "requestFormat": "json",
                  "response": "z.void()",
              },
              {
                  "alias": "getUserByName",
                  "description": "",
                  "errors": [
                      {
                          "description": "Invalid username supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "User not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                  ],
                  "method": "get",
                  "parameters": [
                      {
                          "name": "username",
                          "schema": "z.string()",
                          "type": "Path",
                      },
                  ],
                  "path": "/user/:username",
                  "requestFormat": "json",
                  "response": "@var/User",
              },
              {
                  "alias": "updateUser",
                  "description": "This can only be done by the logged in user.",
                  "errors": [],
                  "method": "put",
                  "parameters": [
                      {
                          "description": "Update an existent user in the store",
                          "name": "body",
                          "schema": "@var/updateUser_Body",
                          "type": "Body",
                      },
                      {
                          "name": "username",
                          "schema": "z.string()",
                          "type": "Path",
                      },
                  ],
                  "path": "/user/:username",
                  "requestFormat": "json",
                  "response": "z.void()",
              },
              {
                  "alias": "deleteUser",
                  "description": "This can only be done by the logged in user.",
                  "errors": [
                      {
                          "description": "Invalid username supplied",
                          "schema": "z.void()",
                          "status": 400,
                      },
                      {
                          "description": "User not found",
                          "schema": "z.void()",
                          "status": 404,
                      },
                  ],
                  "method": "delete",
                  "parameters": [
                      {
                          "name": "username",
                          "schema": "z.string()",
                          "type": "Path",
                      },
                  ],
                  "path": "/user/:username",
                  "requestFormat": "json",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/ApiResponse": "@ref__vBaxCoPHbgy__",
              "@var/Order": "@ref__vLBYC40hXo1__",
              "@var/Pet": "@ref__v8JbFEq2fUl__",
              "@var/User": "@ref__veNKKR5W6KW__",
              "@var/addPet": "@ref__v8JbFEq2fUl__",
              "@var/addPet_Body": "@ref__v8JbFEq2fUl__",
              "@var/createUser": "@ref__veNKKR5W6KW__",
              "@var/createUser_Body": "@ref__veNKKR5W6KW__",
              "@var/createUsersWithListInput": "@ref__veNKKR5W6KW__",
              "@var/createUsersWithListInput_Body": "@ref__vVrSPZVa6q7__",
              "@var/findPetsByStatus": "@ref__vh4fxCvnN1b__",
              "@var/findPetsByTags": "@ref__vh4fxCvnN1b__",
              "@var/getOrderById": "@ref__vLBYC40hXo1__",
              "@var/getPetById": "@ref__v8JbFEq2fUl__",
              "@var/getUserByName": "@ref__veNKKR5W6KW__",
              "@var/placeOrder": "@ref__vLBYC40hXo1__",
              "@var/placeOrder_Body": "@ref__vLBYC40hXo1__",
              "@var/status": "@ref__vlh4E1pXYTG__",
              "@var/tags": "@ref__vGqL1kemtHF__",
              "@var/updatePet": "@ref__v8JbFEq2fUl__",
              "@var/updatePet_Body": "@ref__v8JbFEq2fUl__",
              "@var/updateUser_Body": "@ref__veNKKR5W6KW__",
              "@var/uploadFile": "@ref__vBaxCoPHbgy__",
          },
          "refsDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "responsesByOperationId": {
              "addPet": {
                  "200": "@var/addPet",
                  "405": "z.void()",
              },
              "createUser": {
                  "default": "@var/createUser",
              },
              "createUsersWithListInput": {
                  "200": "@var/createUsersWithListInput",
                  "default": "z.void()",
              },
              "deleteOrder": {
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "deletePet": {
                  "400": "z.void()",
              },
              "deleteUser": {
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "findPetsByStatus": {
                  "200": "@var/findPetsByStatus",
                  "400": "z.void()",
              },
              "findPetsByTags": {
                  "200": "@var/findPetsByTags",
                  "400": "z.void()",
              },
              "getInventory": {
                  "200": "z.record(z.number())",
              },
              "getOrderById": {
                  "200": "@var/getOrderById",
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "getPetById": {
                  "200": "@var/getPetById",
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "getUserByName": {
                  "200": "@var/getUserByName",
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "loginUser": {
                  "200": "z.string()",
                  "400": "z.void()",
              },
              "logoutUser": {
                  "default": "z.void()",
              },
              "placeOrder": {
                  "200": "@var/placeOrder",
                  "405": "z.void()",
              },
              "updatePet": {
                  "200": "@var/updatePet",
                  "400": "z.void()",
                  "404": "z.void()",
                  "405": "z.void()",
              },
              "updatePetWithForm": {
                  "405": "z.void()",
              },
              "updateUser": {
                  "default": "z.void()",
              },
              "uploadFile": {
                  "200": "@var/uploadFile",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/ApiResponse": "@ref__vBaxCoPHbgy__",
              "#/components/schemas/Category": "@ref__vR1x0k5qaLk__",
              "#/components/schemas/Order": "@ref__vLBYC40hXo1__",
              "#/components/schemas/Pet": "@ref__v8JbFEq2fUl__",
              "#/components/schemas/Tag": "@ref__vR1x0k5qaLk__",
              "#/components/schemas/User": "@ref__veNKKR5W6KW__",
          },
          "zodSchemaByHash": {
              "@ref__v8JbFEq2fUl__": "z.object({ id: z.number().optional(), name: z.string(), category: @ref__vR1x0k5qaLk__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vR1x0k5qaLk__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "@ref__vBaxCoPHbgy__": "z.object({ code: z.number(), type: z.string(), message: z.string() }).partial()",
              "@ref__vGqL1kemtHF__": "z.array(z.string()).optional()",
              "@ref__vLBYC40hXo1__": "z.object({ id: z.number(), petId: z.number(), quantity: z.number(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "@ref__vR1x0k5qaLk__": "z.object({ id: z.number(), name: z.string() }).partial()",
              "@ref__vVrSPZVa6q7__": "z.array(@ref__veNKKR5W6KW__)",
              "@ref__veNKKR5W6KW__": "z.object({ id: z.number(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number() }).partial()",
              "@ref__vh4fxCvnN1b__": "z.array(@ref__v8JbFEq2fUl__)",
              "@ref__vlh4E1pXYTG__": "z.enum(["available", "pending", "sold"]).optional()",
          },
      }
    `);
});

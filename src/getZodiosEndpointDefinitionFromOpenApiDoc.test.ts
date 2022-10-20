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
                          "schema": "Order",
                          "type": "Body",
                      },
                  ],
                  "path": "/store/order",
                  "requestFormat": "json",
                  "response": "Order",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {},
          "refsDependencyGraph": {},
          "responsesByOperationId": {
              "placeOrder": {
                  "200": "Order",
                  "405": "z.void()",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Order": "Order",
          },
          "zodSchemaByHash": {
              "Order": "z.object({ id: z.number().int(), petId: z.number().int(), quantity: z.number().int(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
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
                          "schema": "Pet",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "Pet",
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
                          "schema": "Pet",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "Pet",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {},
          "refsDependencyGraph": {
              "#/components/schemas/Pet": Set {
                  "#/components/schemas/Category",
                  "#/components/schemas/Tag",
              },
          },
          "responsesByOperationId": {
              "addPet": {
                  "200": "Pet",
                  "405": "z.void()",
              },
              "updatePet": {
                  "200": "Pet",
                  "400": "z.void()",
                  "404": "z.void()",
                  "405": "z.void()",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Category": "Category",
              "#/components/schemas/Pet": "Pet",
              "#/components/schemas/Tag": "Tag",
          },
          "zodSchemaByHash": {
              "Category": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial()",
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
                  "response": "z.array(Pet)",
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
                  "response": "z.array(Pet)",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/findPetsByStatus": "@ref__vuJkCuHe8KS__",
              "@var/findPetsByTags": "@ref__vuJkCuHe8KS__",
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
              "#/components/schemas/Category": "Category",
              "#/components/schemas/Pet": "Pet",
              "#/components/schemas/Tag": "Tag",
          },
          "zodSchemaByHash": {
              "@ref__vGqL1kemtHF__": "z.array(z.string()).optional()",
              "@ref__vlh4E1pXYTG__": "z.enum(["available", "pending", "sold"]).optional()",
              "@ref__vuJkCuHe8KS__": "z.array(Pet)",
              "Category": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial()",
          },
      }
    `);
});

test("petstore.yaml", async () => {
    const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
    const result = getZodiosEndpointDefinitionFromOpenApiDoc(openApiDoc);
    expect(result).toMatchInlineSnapshot(`
      {
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
                          "schema": "Pet",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "Pet",
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
                          "schema": "Pet",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "Pet",
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
                  "response": "z.array(Pet)",
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
                  "response": "z.array(Pet)",
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
                  "response": "Pet",
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
                  "response": "ApiResponse",
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
                          "schema": "Order",
                          "type": "Body",
                      },
                  ],
                  "path": "/store/order",
                  "requestFormat": "json",
                  "response": "Order",
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
                  "response": "Order",
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
                          "schema": "User",
                          "type": "Body",
                      },
                  ],
                  "path": "/user",
                  "requestFormat": "json",
                  "response": "User",
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
                  "response": "User",
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
                  "response": "User",
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
                          "schema": "User",
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
              "@var/createUsersWithListInput_Body": "@ref__vhZunxssSBT__",
              "@var/findPetsByStatus": "@ref__vuJkCuHe8KS__",
              "@var/findPetsByTags": "@ref__vuJkCuHe8KS__",
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
              "addPet": {
                  "200": "Pet",
                  "405": "z.void()",
              },
              "createUser": {
                  "default": "User",
              },
              "createUsersWithListInput": {
                  "200": "User",
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
                  "200": "Order",
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "getPetById": {
                  "200": "Pet",
                  "400": "z.void()",
                  "404": "z.void()",
              },
              "getUserByName": {
                  "200": "User",
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
                  "200": "Order",
                  "405": "z.void()",
              },
              "updatePet": {
                  "200": "Pet",
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
                  "200": "ApiResponse",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/ApiResponse": "ApiResponse",
              "#/components/schemas/Category": "Category",
              "#/components/schemas/Order": "Order",
              "#/components/schemas/Pet": "Pet",
              "#/components/schemas/Tag": "Tag",
              "#/components/schemas/User": "User",
          },
          "zodSchemaByHash": {
              "@ref__vGqL1kemtHF__": "z.array(z.string()).optional()",
              "@ref__vhZunxssSBT__": "z.array(User)",
              "@ref__vlh4E1pXYTG__": "z.enum(["available", "pending", "sold"]).optional()",
              "@ref__vuJkCuHe8KS__": "z.array(Pet)",
              "ApiResponse": "z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial()",
              "Category": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "Order": "z.object({ id: z.number().int(), petId: z.number().int(), quantity: z.number().int(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "User": "z.object({ id: z.number().int(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number().int() }).partial()",
          },
      }
    `);
});

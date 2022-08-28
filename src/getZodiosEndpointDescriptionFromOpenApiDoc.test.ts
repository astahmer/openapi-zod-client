import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject, SchemaObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getZodiosEndpointDescriptionFromOpenApiDoc } from "./getZodiosEndpointDescriptionFromOpenApiDoc";

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

test("getZodiosEndpointDescriptionFromOpenApiDoc /store/order", () => {
    expect(
        getZodiosEndpointDescriptionFromOpenApiDoc({
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
              "#/components/schemas/Order": "z.object({ id: z.bigint(), petId: z.bigint(), quantity: z.bigint(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
          },
          "deepDependencyGraph": {},
          "endpoints": [
              {
                  "alias": "placeOrder",
                  "description": "Place a new order in the store",
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
              "@var/Order": "@ref__vMXzDdmPwwi__",
              "@var/placeOrder": "@ref__vMXzDdmPwwi__",
              "@var/placeOrder_Body": "@ref__vMXzDdmPwwi__",
          },
          "refsDependencyGraph": {},
          "responsesByOperationId": {
              "placeOrder": {
                  "200": "@var/placeOrder",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Order": "@ref__vMXzDdmPwwi__",
          },
          "zodSchemaByHash": {
              "@ref__vMXzDdmPwwi__": "z.object({ id: z.bigint(), petId: z.bigint(), quantity: z.bigint(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
          },
      }
    `);
});

test("getZodiosEndpointDescriptionFromOpenApiDoc /pet", () => {
    expect(
        getZodiosEndpointDescriptionFromOpenApiDoc({
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
              "#/components/schemas/Category": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "#/components/schemas/Pet": "z.object({ id: z.bigint().optional(), name: z.string(), category: @ref__vjRtoG5L21b__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vjRtoG5L21b__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "#/components/schemas/Tag": "z.object({ id: z.bigint(), name: z.string() }).partial()",
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
              "@var/Pet": "@ref__vnp2gpvFZCj__",
              "@var/addPet": "@ref__vnp2gpvFZCj__",
              "@var/addPet_Body": "@ref__vnp2gpvFZCj__",
              "@var/updatePet": "@ref__vnp2gpvFZCj__",
              "@var/updatePet_Body": "@ref__vnp2gpvFZCj__",
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
              },
              "updatePet": {
                  "200": "@var/updatePet",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Category": "@ref__vjRtoG5L21b__",
              "#/components/schemas/Pet": "@ref__vnp2gpvFZCj__",
              "#/components/schemas/Tag": "@ref__vjRtoG5L21b__",
          },
          "zodSchemaByHash": {
              "@ref__vjRtoG5L21b__": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "@ref__vnp2gpvFZCj__": "z.object({ id: z.bigint().optional(), name: z.string(), category: @ref__vjRtoG5L21b__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vjRtoG5L21b__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
          },
      }
    `);
});

test("getZodiosEndpointDescriptionFromOpenApiDoc /pet/findXXX", () => {
    expect(
        getZodiosEndpointDescriptionFromOpenApiDoc({
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
              "#/components/schemas/Category": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "#/components/schemas/Pet": "z.object({ id: z.bigint().optional(), name: z.string(), category: @ref__vjRtoG5L21b__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vjRtoG5L21b__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "#/components/schemas/Tag": "z.object({ id: z.bigint(), name: z.string() }).partial()",
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
                  "response": "z.array(@ref__vnp2gpvFZCj__)",
              },
              {
                  "alias": "findPetsByTags",
                  "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
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
                  "response": "z.array(@ref__vnp2gpvFZCj__)",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/findPetsByStatus": "@ref__vP9z4ayAy35__",
              "@var/findPetsByTags": "@ref__vP9z4ayAy35__",
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
              },
              "findPetsByTags": {
                  "200": "@var/findPetsByTags",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/Category": "@ref__vjRtoG5L21b__",
              "#/components/schemas/Pet": "@ref__vnp2gpvFZCj__",
              "#/components/schemas/Tag": "@ref__vjRtoG5L21b__",
          },
          "zodSchemaByHash": {
              "@ref__vGqL1kemtHF__": "z.array(z.string()).optional()",
              "@ref__vP9z4ayAy35__": "z.array(@ref__vnp2gpvFZCj__)",
              "@ref__vjRtoG5L21b__": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "@ref__vlh4E1pXYTG__": "z.enum(["available", "pending", "sold"]).optional()",
              "@ref__vnp2gpvFZCj__": "z.object({ id: z.bigint().optional(), name: z.string(), category: @ref__vjRtoG5L21b__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vjRtoG5L21b__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
          },
      }
    `);
});

test("petstore.yaml", async () => {
    const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
    const result = getZodiosEndpointDescriptionFromOpenApiDoc(openApiDoc);
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
              "#/components/schemas/ApiResponse": "z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial()",
              "#/components/schemas/Category": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "#/components/schemas/Order": "z.object({ id: z.bigint(), petId: z.bigint(), quantity: z.bigint(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "#/components/schemas/Pet": "z.object({ id: z.bigint().optional(), name: z.string(), category: @ref__vjRtoG5L21b__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vjRtoG5L21b__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "#/components/schemas/Tag": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "#/components/schemas/User": "z.object({ id: z.bigint(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.bigint() }).partial()",
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
                  "response": "z.array(@ref__vnp2gpvFZCj__)",
              },
              {
                  "alias": "findPetsByTags",
                  "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
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
                  "response": "z.array(@ref__vnp2gpvFZCj__)",
              },
              {
                  "alias": "getPetById",
                  "description": "Returns a single pet",
                  "method": "get",
                  "parameters": [],
                  "path": "/pet/:petId",
                  "requestFormat": "json",
                  "response": "@var/Pet",
              },
              {
                  "alias": "updatePetWithForm",
                  "description": "",
                  "method": "post",
                  "parameters": [
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
                  "method": "delete",
                  "parameters": [
                      {
                          "name": "api_key",
                          "schema": "z.string().optional()",
                          "type": "Header",
                      },
                  ],
                  "path": "/pet/:petId",
                  "requestFormat": "json",
              },
              {
                  "alias": "uploadFile",
                  "description": "",
                  "method": "post",
                  "parameters": [
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
                  "method": "get",
                  "parameters": [],
                  "path": "/store/inventory",
                  "requestFormat": "json",
                  "response": "z.record(z.bigint())",
              },
              {
                  "alias": "placeOrder",
                  "description": "Place a new order in the store",
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
                  "method": "get",
                  "parameters": [],
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
                  "response": "@var/Order",
              },
              {
                  "alias": "deleteOrder",
                  "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                  "method": "delete",
                  "parameters": [],
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
              },
              {
                  "alias": "createUser",
                  "description": "This can only be done by the logged in user.",
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
                  "method": "get",
                  "parameters": [],
                  "path": "/user/logout",
                  "requestFormat": "json",
              },
              {
                  "alias": "getUserByName",
                  "description": "",
                  "method": "get",
                  "parameters": [],
                  "path": "/user/:username",
                  "requestFormat": "json",
                  "response": "@var/User",
              },
              {
                  "alias": "updateUser",
                  "description": "This can only be done by the logged in user.",
                  "method": "put",
                  "parameters": [
                      {
                          "description": "Update an existent user in the store",
                          "name": "body",
                          "schema": "@var/updateUser_Body",
                          "type": "Body",
                      },
                  ],
                  "path": "/user/:username",
                  "requestFormat": "json",
              },
              {
                  "alias": "deleteUser",
                  "description": "This can only be done by the logged in user.",
                  "method": "delete",
                  "parameters": [],
                  "path": "/user/:username",
                  "requestFormat": "json",
              },
          ],
          "getSchemaByRef": [Function],
          "hashByVariableName": {
              "@var/ApiResponse": "@ref__vUMmIUy5eXh__",
              "@var/Order": "@ref__vMXzDdmPwwi__",
              "@var/Pet": "@ref__vnp2gpvFZCj__",
              "@var/User": "@ref__vtA6zvELdW2__",
              "@var/addPet": "@ref__vnp2gpvFZCj__",
              "@var/addPet_Body": "@ref__vnp2gpvFZCj__",
              "@var/createUser": "@ref__vtA6zvELdW2__",
              "@var/createUser_Body": "@ref__vtA6zvELdW2__",
              "@var/createUsersWithListInput": "@ref__vtA6zvELdW2__",
              "@var/createUsersWithListInput_Body": "@ref__vIuVRTTFbUj__",
              "@var/findPetsByStatus": "@ref__vP9z4ayAy35__",
              "@var/findPetsByTags": "@ref__vP9z4ayAy35__",
              "@var/getOrderById": "@ref__vMXzDdmPwwi__",
              "@var/getPetById": "@ref__vnp2gpvFZCj__",
              "@var/getUserByName": "@ref__vtA6zvELdW2__",
              "@var/placeOrder": "@ref__vMXzDdmPwwi__",
              "@var/placeOrder_Body": "@ref__vMXzDdmPwwi__",
              "@var/status": "@ref__vlh4E1pXYTG__",
              "@var/tags": "@ref__vGqL1kemtHF__",
              "@var/updatePet": "@ref__vnp2gpvFZCj__",
              "@var/updatePet_Body": "@ref__vnp2gpvFZCj__",
              "@var/updateUser_Body": "@ref__vtA6zvELdW2__",
              "@var/uploadFile": "@ref__vUMmIUy5eXh__",
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
              },
              "createUser": {
                  "default": "@var/createUser",
              },
              "createUsersWithListInput": {
                  "200": "@var/createUsersWithListInput",
              },
              "findPetsByStatus": {
                  "200": "@var/findPetsByStatus",
              },
              "findPetsByTags": {
                  "200": "@var/findPetsByTags",
              },
              "getInventory": {
                  "200": "z.record(z.bigint())",
              },
              "getOrderById": {
                  "200": "@var/getOrderById",
              },
              "getPetById": {
                  "200": "@var/getPetById",
              },
              "getUserByName": {
                  "200": "@var/getUserByName",
              },
              "loginUser": {
                  "200": "z.string()",
              },
              "placeOrder": {
                  "200": "@var/placeOrder",
              },
              "updatePet": {
                  "200": "@var/updatePet",
              },
              "uploadFile": {
                  "200": "@var/uploadFile",
              },
          },
          "schemaHashByRef": {
              "#/components/schemas/ApiResponse": "@ref__vUMmIUy5eXh__",
              "#/components/schemas/Category": "@ref__vjRtoG5L21b__",
              "#/components/schemas/Order": "@ref__vMXzDdmPwwi__",
              "#/components/schemas/Pet": "@ref__vnp2gpvFZCj__",
              "#/components/schemas/Tag": "@ref__vjRtoG5L21b__",
              "#/components/schemas/User": "@ref__vtA6zvELdW2__",
          },
          "zodSchemaByHash": {
              "@ref__vGqL1kemtHF__": "z.array(z.string()).optional()",
              "@ref__vIuVRTTFbUj__": "z.array(@ref__vtA6zvELdW2__)",
              "@ref__vMXzDdmPwwi__": "z.object({ id: z.bigint(), petId: z.bigint(), quantity: z.bigint(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "@ref__vP9z4ayAy35__": "z.array(@ref__vnp2gpvFZCj__)",
              "@ref__vUMmIUy5eXh__": "z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial()",
              "@ref__vjRtoG5L21b__": "z.object({ id: z.bigint(), name: z.string() }).partial()",
              "@ref__vlh4E1pXYTG__": "z.enum(["available", "pending", "sold"]).optional()",
              "@ref__vnp2gpvFZCj__": "z.object({ id: z.bigint().optional(), name: z.string(), category: @ref__vjRtoG5L21b__.optional(), photoUrls: z.array(z.string()), tags: z.array(@ref__vjRtoG5L21b__).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "@ref__vtA6zvELdW2__": "z.object({ id: z.bigint(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.bigint() }).partial()",
          },
      }
    `);
});

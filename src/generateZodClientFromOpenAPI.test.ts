import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { getZodClientTemplateContext } from "./generateZodClientFromOpenAPI";

test("getZodClientTemplateContext", async () => {
    const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
    const result = getZodClientTemplateContext(openApiDoc);
    expect(result).toMatchInlineSnapshot(`
      {
          "endpoints": [
              {
                  "alias": "updatePet",
                  "description": "Update an existing pet by Id",
                  "method": "put",
                  "parameters": [
                      {
                          "description": "Update an existent pet in the store",
                          "name": "body",
                          "schema": "variables["updatePet_Body"]",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "variables["Pet"]",
              },
              {
                  "alias": "addPet",
                  "description": "Add a new pet to the store",
                  "method": "post",
                  "parameters": [
                      {
                          "description": "Create a new pet in the store",
                          "name": "body",
                          "schema": "variables["addPet_Body"]",
                          "type": "Body",
                      },
                  ],
                  "path": "/pet",
                  "requestFormat": "json",
                  "response": "variables["Pet"]",
              },
              {
                  "alias": "getPetById",
                  "description": "Returns a single pet",
                  "method": "get",
                  "parameters": [],
                  "path": "/pet/{petId}",
                  "requestFormat": "json",
                  "response": "variables["Pet"]",
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
                  "path": "/pet/{petId}/uploadImage",
                  "requestFormat": "json",
                  "response": "variables["ApiResponse"]",
              },
              {
                  "alias": "findPetsByStatus",
                  "description": "Multiple status values can be provided with comma separated strings",
                  "method": "get",
                  "parameters": [
                      {
                          "name": "status",
                          "schema": "variables["status"]",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByStatus",
                  "requestFormat": "json",
                  "response": "z.array(variables["getPetById"])",
              },
              {
                  "alias": "findPetsByTags",
                  "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                  "method": "get",
                  "parameters": [
                      {
                          "name": "tags",
                          "schema": "variables["tags"]",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByTags",
                  "requestFormat": "json",
                  "response": "z.array(variables["getPetById"])",
              },
              {
                  "alias": "getInventory",
                  "description": "Returns a map of status codes to quantities",
                  "method": "get",
                  "parameters": [],
                  "path": "/store/inventory",
                  "requestFormat": "json",
                  "response": "z.record(z.bigint().optional())",
              },
              {
                  "alias": "placeOrder",
                  "description": "Place a new order in the store",
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "variables["placeOrder_Body"]",
                          "type": "Body",
                      },
                  ],
                  "path": "/store/order",
                  "requestFormat": "json",
                  "response": "variables["Order"]",
              },
              {
                  "alias": "getOrderById",
                  "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                  "method": "get",
                  "parameters": [],
                  "path": "/store/order/{orderId}",
                  "requestFormat": "json",
                  "response": "variables["Order"]",
              },
              {
                  "alias": "getUserByName",
                  "description": "",
                  "method": "get",
                  "parameters": [],
                  "path": "/user/{username}",
                  "requestFormat": "json",
                  "response": "variables["User"]",
              },
              {
                  "alias": "createUsersWithListInput",
                  "description": "Creates list of users with given input array",
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "variables["createUsersWithListInput_Body"]",
                          "type": "Body",
                      },
                  ],
                  "path": "/user/createWithList",
                  "requestFormat": "json",
                  "response": "variables["User"]",
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
          ],
          "options": {
              "withAlias": false,
          },
          "schemas": {
              "3tXnrjZr7t": "z.array(KyXfnTjbWz)",
              "KyXfnTjbWz": "z.object({ id: z.bigint().optional(), name: z.string(), category: hu8VM64CQw, photoUrls: z.array(z.string().optional()), tags: z.array(hu8VM64CQw).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).optional()",
              "YgP96SZsFk": "z.array(dkmtDx9IhK)",
              "dkmtDx9IhK": "z.object({ id: z.bigint(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.bigint() }).partial().optional()",
              "dqJo8eOFaZ": "z.object({ id: z.bigint(), petId: z.bigint(), quantity: z.bigint(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial().optional()",
              "hu8VM64CQw": "z.object({ id: z.bigint(), name: z.string() }).partial().optional()",
              "lBJyXSdkxV": "z.array(z.string().optional()).optional()",
              "lh4E1pXYTG": "z.enum(["available", "pending", "sold"]).optional()",
              "oE4gkLXxTn": "z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional()",
          },
          "variables": {
              "ApiResponse": "oE4gkLXxTn",
              "Order": "dqJo8eOFaZ",
              "Pet": "KyXfnTjbWz",
              "User": "dkmtDx9IhK",
              "addPet": "KyXfnTjbWz",
              "addPet_Body": "KyXfnTjbWz",
              "createUser": "dkmtDx9IhK",
              "createUser_Body": "dkmtDx9IhK",
              "createUsersWithListInput": "dkmtDx9IhK",
              "createUsersWithListInput_Body": "YgP96SZsFk",
              "findPetsByStatus": "3tXnrjZr7t",
              "findPetsByTags": "3tXnrjZr7t",
              "getOrderById": "dqJo8eOFaZ",
              "getPetById": "KyXfnTjbWz",
              "getUserByName": "dkmtDx9IhK",
              "placeOrder": "dqJo8eOFaZ",
              "placeOrder_Body": "dqJo8eOFaZ",
              "status": "lh4E1pXYTG",
              "tags": "lBJyXSdkxV",
              "updatePet": "KyXfnTjbWz",
              "updatePet_Body": "KyXfnTjbWz",
              "updateUser_Body": "dkmtDx9IhK",
              "uploadFile": "oE4gkLXxTn",
          },
      }
    `);
});

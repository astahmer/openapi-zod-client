import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIObject, SchemasObject } from "openapi3-ts";
import { beforeAll, describe, expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "./generateZodClientFromOpenAPI";
import { getZodClientTemplateContext } from "./template-context";

let openApiDoc: OpenAPIObject;
beforeAll(async () => {
    openApiDoc = (await SwaggerParser.parse("./tests/petstore.yaml")) as OpenAPIObject;
});

test("getZodClientTemplateContext", async () => {
    const result = getZodClientTemplateContext(openApiDoc);
    expect(result).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {},
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
                          "schema": "z.number().int()",
                          "type": "Path",
                      },
                  ],
                  "path": "/pet/:petId",
                  "requestFormat": "json",
                  "response": "Pet",
              },
              {
                  "alias": "uploadFile",
                  "description": "",
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "z.instanceof(File)",
                          "type": "Body",
                      },
                      {
                          "name": "petId",
                          "schema": "z.number().int()",
                          "type": "Path",
                      },
                      {
                          "name": "additionalMetadata",
                          "schema": "z.string().optional()",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/:petId/uploadImage",
                  "requestFormat": "binary",
                  "response": "ApiResponse",
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
                          "schema": "z.enum(["available", "pending", "sold"]).optional().default("available")",
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
                          "schema": "z.array(z.string()).optional()",
                          "type": "Query",
                      },
                  ],
                  "path": "/pet/findByTags",
                  "requestFormat": "json",
                  "response": "z.array(Pet)",
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
                          "schema": "z.number().int()",
                          "type": "Path",
                      },
                  ],
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
                  "response": "Order",
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
                  "alias": "createUsersWithListInput",
                  "description": "Creates list of users with given input array",
                  "errors": [],
                  "method": "post",
                  "parameters": [
                      {
                          "description": undefined,
                          "name": "body",
                          "schema": "z.array(User)",
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
          ],
          "endpointsGroups": {},
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "ApiResponse": "z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial()",
              "Category": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "Order": "z.object({ id: z.number().int(), petId: z.number().int(), quantity: z.number().int(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "User": "z.object({ id: z.number().int(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number().int() }).partial()",
          },
          "types": {},
      }
    `);
});

describe("generateZodClientFromOpenAPI", () => {
    test("without options", async () => {
        const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const Category = z.object({ id: z.number().int(), name: z.string() }).partial();
          const Tag = z.object({ id: z.number().int(), name: z.string() }).partial();
          const Pet = z.object({
            id: z.number().int().optional(),
            name: z.string(),
            category: Category.optional(),
            photoUrls: z.array(z.string()),
            tags: z.array(Tag).optional(),
            status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const ApiResponse = z
            .object({ code: z.number().int(), type: z.string(), message: z.string() })
            .partial();
          const Order = z
            .object({
              id: z.number().int(),
              petId: z.number().int(),
              quantity: z.number().int(),
              shipDate: z.string(),
              status: z.enum(["placed", "approved", "delivered"]),
              complete: z.boolean(),
            })
            .partial();
          const User = z
            .object({
              id: z.number().int(),
              username: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              email: z.string(),
              password: z.string(),
              phone: z.string(),
              userStatus: z.number().int(),
            })
            .partial();

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              description: \`Update an existing pet by Id\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Update an existent pet in the store\`,
                  type: "Body",
                  schema: Pet,
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Pet not found\`,
                  schema: z.void(),
                },
                {
                  status: 405,
                  description: \`Validation exception\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/pet",
              description: \`Add a new pet to the store\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Create a new pet in the store\`,
                  type: "Body",
                  schema: Pet,
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 405,
                  description: \`Invalid input\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/pet/:petId",
              description: \`Returns a single pet\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "petId",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Pet not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/pet/:petId/uploadImage",
              requestFormat: "binary",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: z.instanceof(File),
                },
                {
                  name: "petId",
                  type: "Path",
                  schema: z.number().int(),
                },
                {
                  name: "additionalMetadata",
                  type: "Query",
                  schema: z.string().optional(),
                },
              ],
              response: ApiResponse,
            },
            {
              method: "get",
              path: "/pet/findByStatus",
              description: \`Multiple status values can be provided with comma separated strings\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "status",
                  type: "Query",
                  schema: z
                    .enum(["available", "pending", "sold"])
                    .optional()
                    .default("available"),
                },
              ],
              response: z.array(Pet),
              errors: [
                {
                  status: 400,
                  description: \`Invalid status value\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/pet/findByTags",
              description: \`Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "tags",
                  type: "Query",
                  schema: z.array(z.string()).optional(),
                },
              ],
              response: z.array(Pet),
              errors: [
                {
                  status: 400,
                  description: \`Invalid tag value\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/store/inventory",
              description: \`Returns a map of status codes to quantities\`,
              requestFormat: "json",
              response: z.record(z.number()),
            },
            {
              method: "post",
              path: "/store/order",
              description: \`Place a new order in the store\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: Order,
                },
              ],
              response: Order,
              errors: [
                {
                  status: 405,
                  description: \`Invalid input\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/store/order/:orderId",
              description: \`For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "orderId",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Order,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Order not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/user/:username",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: User,
              errors: [
                {
                  status: 400,
                  description: \`Invalid username supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`User not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/user/createWithList",
              description: \`Creates list of users with given input array\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: z.array(User),
                },
              ],
              response: User,
            },
            {
              method: "get",
              path: "/user/login",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Query",
                  schema: z.string().optional(),
                },
                {
                  name: "password",
                  type: "Query",
                  schema: z.string().optional(),
                },
              ],
              response: z.string(),
              errors: [
                {
                  status: 400,
                  description: \`Invalid username/password supplied\`,
                  schema: z.void(),
                },
              ],
            },
          ]);

          export const api = new Zodios(endpoints);
          "
        `);
    });

    test("withAlias", async () => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: { withAlias: true },
        });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const Category = z.object({ id: z.number().int(), name: z.string() }).partial();
          const Tag = z.object({ id: z.number().int(), name: z.string() }).partial();
          const Pet = z.object({
            id: z.number().int().optional(),
            name: z.string(),
            category: Category.optional(),
            photoUrls: z.array(z.string()),
            tags: z.array(Tag).optional(),
            status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const ApiResponse = z
            .object({ code: z.number().int(), type: z.string(), message: z.string() })
            .partial();
          const Order = z
            .object({
              id: z.number().int(),
              petId: z.number().int(),
              quantity: z.number().int(),
              shipDate: z.string(),
              status: z.enum(["placed", "approved", "delivered"]),
              complete: z.boolean(),
            })
            .partial();
          const User = z
            .object({
              id: z.number().int(),
              username: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              email: z.string(),
              password: z.string(),
              phone: z.string(),
              userStatus: z.number().int(),
            })
            .partial();

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              alias: "updatePet",
              description: \`Update an existing pet by Id\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Update an existent pet in the store\`,
                  type: "Body",
                  schema: Pet,
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Pet not found\`,
                  schema: z.void(),
                },
                {
                  status: 405,
                  description: \`Validation exception\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/pet",
              alias: "addPet",
              description: \`Add a new pet to the store\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Create a new pet in the store\`,
                  type: "Body",
                  schema: Pet,
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 405,
                  description: \`Invalid input\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/pet/:petId",
              alias: "getPetById",
              description: \`Returns a single pet\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "petId",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Pet not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/pet/:petId/uploadImage",
              alias: "uploadFile",
              requestFormat: "binary",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: z.instanceof(File),
                },
                {
                  name: "petId",
                  type: "Path",
                  schema: z.number().int(),
                },
                {
                  name: "additionalMetadata",
                  type: "Query",
                  schema: z.string().optional(),
                },
              ],
              response: ApiResponse,
            },
            {
              method: "get",
              path: "/pet/findByStatus",
              alias: "findPetsByStatus",
              description: \`Multiple status values can be provided with comma separated strings\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "status",
                  type: "Query",
                  schema: z
                    .enum(["available", "pending", "sold"])
                    .optional()
                    .default("available"),
                },
              ],
              response: z.array(Pet),
              errors: [
                {
                  status: 400,
                  description: \`Invalid status value\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/pet/findByTags",
              alias: "findPetsByTags",
              description: \`Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "tags",
                  type: "Query",
                  schema: z.array(z.string()).optional(),
                },
              ],
              response: z.array(Pet),
              errors: [
                {
                  status: 400,
                  description: \`Invalid tag value\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/store/inventory",
              alias: "getInventory",
              description: \`Returns a map of status codes to quantities\`,
              requestFormat: "json",
              response: z.record(z.number()),
            },
            {
              method: "post",
              path: "/store/order",
              alias: "placeOrder",
              description: \`Place a new order in the store\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: Order,
                },
              ],
              response: Order,
              errors: [
                {
                  status: 405,
                  description: \`Invalid input\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/store/order/:orderId",
              alias: "getOrderById",
              description: \`For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "orderId",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Order,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Order not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/user/:username",
              alias: "getUserByName",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: User,
              errors: [
                {
                  status: 400,
                  description: \`Invalid username supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`User not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/user/createWithList",
              alias: "createUsersWithListInput",
              description: \`Creates list of users with given input array\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: z.array(User),
                },
              ],
              response: User,
            },
            {
              method: "get",
              path: "/user/login",
              alias: "loginUser",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Query",
                  schema: z.string().optional(),
                },
                {
                  name: "password",
                  type: "Query",
                  schema: z.string().optional(),
                },
              ],
              response: z.string(),
              errors: [
                {
                  status: 400,
                  description: \`Invalid username/password supplied\`,
                  schema: z.void(),
                },
              ],
            },
          ]);

          export const api = new Zodios(endpoints);
          "
        `);
    });

    test("with baseUrl", async () => {
        const prettyOutput = await generateZodClientFromOpenAPI({
            openApiDoc,
            disableWriteToFile: true,
            options: {
                baseUrl: "http://example.com",
            },
        });
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const Category = z.object({ id: z.number().int(), name: z.string() }).partial();
          const Tag = z.object({ id: z.number().int(), name: z.string() }).partial();
          const Pet = z.object({
            id: z.number().int().optional(),
            name: z.string(),
            category: Category.optional(),
            photoUrls: z.array(z.string()),
            tags: z.array(Tag).optional(),
            status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const ApiResponse = z
            .object({ code: z.number().int(), type: z.string(), message: z.string() })
            .partial();
          const Order = z
            .object({
              id: z.number().int(),
              petId: z.number().int(),
              quantity: z.number().int(),
              shipDate: z.string(),
              status: z.enum(["placed", "approved", "delivered"]),
              complete: z.boolean(),
            })
            .partial();
          const User = z
            .object({
              id: z.number().int(),
              username: z.string(),
              firstName: z.string(),
              lastName: z.string(),
              email: z.string(),
              password: z.string(),
              phone: z.string(),
              userStatus: z.number().int(),
            })
            .partial();

          const endpoints = makeApi([
            {
              method: "put",
              path: "/pet",
              description: \`Update an existing pet by Id\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Update an existent pet in the store\`,
                  type: "Body",
                  schema: Pet,
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Pet not found\`,
                  schema: z.void(),
                },
                {
                  status: 405,
                  description: \`Validation exception\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/pet",
              description: \`Add a new pet to the store\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  description: \`Create a new pet in the store\`,
                  type: "Body",
                  schema: Pet,
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 405,
                  description: \`Invalid input\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/pet/:petId",
              description: \`Returns a single pet\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "petId",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Pet,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Pet not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/pet/:petId/uploadImage",
              requestFormat: "binary",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: z.instanceof(File),
                },
                {
                  name: "petId",
                  type: "Path",
                  schema: z.number().int(),
                },
                {
                  name: "additionalMetadata",
                  type: "Query",
                  schema: z.string().optional(),
                },
              ],
              response: ApiResponse,
            },
            {
              method: "get",
              path: "/pet/findByStatus",
              description: \`Multiple status values can be provided with comma separated strings\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "status",
                  type: "Query",
                  schema: z
                    .enum(["available", "pending", "sold"])
                    .optional()
                    .default("available"),
                },
              ],
              response: z.array(Pet),
              errors: [
                {
                  status: 400,
                  description: \`Invalid status value\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/pet/findByTags",
              description: \`Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "tags",
                  type: "Query",
                  schema: z.array(z.string()).optional(),
                },
              ],
              response: z.array(Pet),
              errors: [
                {
                  status: 400,
                  description: \`Invalid tag value\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/store/inventory",
              description: \`Returns a map of status codes to quantities\`,
              requestFormat: "json",
              response: z.record(z.number()),
            },
            {
              method: "post",
              path: "/store/order",
              description: \`Place a new order in the store\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: Order,
                },
              ],
              response: Order,
              errors: [
                {
                  status: 405,
                  description: \`Invalid input\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/store/order/:orderId",
              description: \`For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "orderId",
                  type: "Path",
                  schema: z.number().int(),
                },
              ],
              response: Order,
              errors: [
                {
                  status: 400,
                  description: \`Invalid ID supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`Order not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "get",
              path: "/user/:username",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Path",
                  schema: z.string(),
                },
              ],
              response: User,
              errors: [
                {
                  status: 400,
                  description: \`Invalid username supplied\`,
                  schema: z.void(),
                },
                {
                  status: 404,
                  description: \`User not found\`,
                  schema: z.void(),
                },
              ],
            },
            {
              method: "post",
              path: "/user/createWithList",
              description: \`Creates list of users with given input array\`,
              requestFormat: "json",
              parameters: [
                {
                  name: "body",
                  type: "Body",
                  schema: z.array(User),
                },
              ],
              response: User,
            },
            {
              method: "get",
              path: "/user/login",
              requestFormat: "json",
              parameters: [
                {
                  name: "username",
                  type: "Query",
                  schema: z.string().optional(),
                },
                {
                  name: "password",
                  type: "Query",
                  schema: z.string().optional(),
                },
              ],
              response: z.string(),
              errors: [
                {
                  status: 400,
                  description: \`Invalid username/password supplied\`,
                  schema: z.void(),
                },
              ],
            },
          ]);

          export const api = new Zodios("http://example.com", endpoints);
          "
        `);
    });
});

test("with optional, partial, all required objects", async () => {
    const schemas = {
        Root2: {
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
                nested: { $ref: "#/components/schemas/Nested2" },
                partial: { $ref: "#/components/schemas/PartialObject" },
                optionalProp: { type: "string" },
            },
            required: ["str", "nb", "nested"],
        },
        Nested2: {
            type: "object",
            properties: {
                nested_prop: { type: "boolean" },
                deeplyNested: { $ref: "#/components/schemas/DeeplyNested" },
                circularToRoot: { $ref: "#/components/schemas/Root2" },
                requiredProp: { type: "string" },
            },
            required: ["requiredProp"],
        },
        PartialObject: {
            type: "object",
            properties: {
                something: { type: "string" },
                another: { type: "number" },
            },
        },
        DeeplyNested: {
            type: "array",
            items: { $ref: "#/components/schemas/VeryDeeplyNested" },
        },
        VeryDeeplyNested: {
            type: "string",
            enum: ["aaa", "bbb", "ccc"],
        },
    } as SchemasObject;
    const openApiDoc = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/root": {
                get: {
                    operationId: "getRoot",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas["Root2"] } } },
                    },
                },
            },
            "/nested": {
                get: {
                    operationId: "getNested",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas["Nested2"] } } },
                    },
                },
            },
            "/deeplyNested": {
                get: {
                    operationId: "getDeeplyNested",
                    responses: {
                        "200": {
                            description: "OK",
                            content: { "application/json": { schema: schemas["DeeplyNested"] } },
                        },
                    },
                },
            },
            "/veryDeeplyNested": {
                get: {
                    operationId: "getVeryDeeplyNested",
                    responses: {
                        "200": {
                            description: "OK",
                            content: { "application/json": { schema: schemas["VeryDeeplyNested"] } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };

    const data = getZodClientTemplateContext(openApiDoc);

    expect(data).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {
              "Nested2": true,
              "Root2": true,
          },
          "endpoints": [
              {
                  "alias": "getDeeplyNested",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/deeplyNested",
                  "requestFormat": "json",
                  "response": "z.array(VeryDeeplyNested)",
              },
              {
                  "alias": "getNested",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/nested",
                  "requestFormat": "json",
                  "response": "z.object({ nested_prop: z.boolean().optional(), deeplyNested: DeeplyNested.optional(), circularToRoot: Root2.optional(), requiredProp: z.string() })",
              },
              {
                  "alias": "getRoot",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/root",
                  "requestFormat": "json",
                  "response": "z.object({ str: z.string(), nb: z.number(), nested: Nested2, partial: PartialObject.optional(), optionalProp: z.string().optional() })",
              },
              {
                  "alias": "getVeryDeeplyNested",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/veryDeeplyNested",
                  "requestFormat": "json",
                  "response": "z.enum(["aaa", "bbb", "ccc"])",
              },
          ],
          "endpointsGroups": {},
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "DeeplyNested": "z.array(VeryDeeplyNested)",
              "Nested2": "z.lazy(() => z.object({ nested_prop: z.boolean().optional(), deeplyNested: DeeplyNested.optional(), circularToRoot: Root2.optional(), requiredProp: z.string() }))",
              "PartialObject": "z.object({ something: z.string(), another: z.number() }).partial()",
              "Root2": "z.lazy(() => z.object({ str: z.string(), nb: z.number(), nested: Nested2, partial: PartialObject.optional(), optionalProp: z.string().optional() }))",
              "VeryDeeplyNested": "z.enum(["aaa", "bbb", "ccc"])",
          },
          "types": {
              "DeeplyNested": "type DeeplyNested = Array<VeryDeeplyNested>;",
              "Nested2": "type Nested2 = {
          nested_prop?: boolean | undefined;
          deeplyNested?: DeeplyNested | undefined;
          circularToRoot?: Root2 | undefined;
          requiredProp: string;
      };",
              "PartialObject": "type PartialObject = Partial<{
          something: string;
          another: number;
      }>;",
              "Root2": "type Root2 = {
          str: string;
          nb: number;
          nested: Nested2;
          partial?: PartialObject | undefined;
          optionalProp?: string | undefined;
      };",
              "VeryDeeplyNested": "type VeryDeeplyNested = "aaa" | "bbb" | "ccc";",
          },
      }
    `);

    const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      type Root2 = {
        str: string;
        nb: number;
        nested: Nested2;
        partial?: PartialObject | undefined;
        optionalProp?: string | undefined;
      };
      type DeeplyNested = Array<VeryDeeplyNested>;
      type VeryDeeplyNested = "aaa" | "bbb" | "ccc";
      type PartialObject = Partial<{
        something: string;
        another: number;
      }>;
      type Nested2 = {
        nested_prop?: boolean | undefined;
        deeplyNested?: DeeplyNested | undefined;
        circularToRoot?: Root2 | undefined;
        requiredProp: string;
      };

      const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
      const DeeplyNested = z.array(VeryDeeplyNested);
      const Nested2: z.ZodType<Nested2> = z.lazy(() =>
        z.object({
          nested_prop: z.boolean().optional(),
          deeplyNested: DeeplyNested.optional(),
          circularToRoot: Root2.optional(),
          requiredProp: z.string(),
        })
      );
      const PartialObject = z
        .object({ something: z.string(), another: z.number() })
        .partial();
      const Root2: z.ZodType<Root2> = z.lazy(() =>
        z.object({
          str: z.string(),
          nb: z.number(),
          nested: Nested2,
          partial: PartialObject.optional(),
          optionalProp: z.string().optional(),
        })
      );

      const endpoints = makeApi([
        {
          method: "get",
          path: "/deeplyNested",
          requestFormat: "json",
          response: z.array(VeryDeeplyNested),
        },
        {
          method: "get",
          path: "/nested",
          requestFormat: "json",
          response: z.object({
            nested_prop: z.boolean().optional(),
            deeplyNested: DeeplyNested.optional(),
            circularToRoot: Root2.optional(),
            requiredProp: z.string(),
          }),
        },
        {
          method: "get",
          path: "/root",
          requestFormat: "json",
          response: z.object({
            str: z.string(),
            nb: z.number(),
            nested: Nested2,
            partial: PartialObject.optional(),
            optionalProp: z.string().optional(),
          }),
        },
        {
          method: "get",
          path: "/veryDeeplyNested",
          requestFormat: "json",
          response: z.enum(["aaa", "bbb", "ccc"]),
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

import SwaggerParser from "@apidevtools/swagger-parser";
import { compile } from "handlebars";
import { readFile } from "node:fs/promises";
import { OpenAPIObject, SchemasObject } from "openapi3-ts";
import { resolveConfig } from "prettier";
import { beforeAll, describe, expect, test } from "vitest";
import { getZodClientTemplateContext, maybePretty, TemplateContext } from "./generateZodClientFromOpenAPI";

let openApiDoc: OpenAPIObject;
beforeAll(async () => {
    openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
});

test("getZodClientTemplateContext", async () => {
    const result = getZodClientTemplateContext(openApiDoc);
    expect(result).toMatchInlineSnapshot(`
      {
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
                  "response": "variables["Pet"]",
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
                  "response": "variables["ApiResponse"]",
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
                  "response": "variables["Order"]",
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
                  "response": "variables["User"]",
              },
              {
                  "alias": "createUsersWithListInput",
                  "description": "Creates list of users with given input array",
                  "errors": [
                      {
                          "description": "successful operation",
                          "schema": "z.void()",
                          "status": "default",
                      },
                  ],
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
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "v1QfJ6T3SbL": "z.array(vuZawvBEAhG)",
              "vGqL1kemtHF": "z.array(z.string()).optional()",
              "vVNOkMuhu59": "z.object({ id: z.number().int(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number().int() }).partial()",
              "vimJdKcOZX8": "z.object({ id: z.number().int(), petId: z.number().int(), quantity: z.number().int(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "vjrUWIUkeIl": "z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial()",
              "vlh4E1pXYTG": "z.enum(["available", "pending", "sold"]).optional()",
              "vqZ2pR7iMi4": "z.object({ id: z.number().int(), name: z.string() }).partial()",
              "vrMyJmYcfcf": "z.array(vVNOkMuhu59)",
              "vuZawvBEAhG": "z.object({ id: z.number().int().optional(), name: z.string(), category: vqZ2pR7iMi4.optional(), photoUrls: z.array(z.string()), tags: z.array(vqZ2pR7iMi4).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
          },
          "typeNameByRefHash": {},
          "types": {},
          "variables": {
              "ApiResponse": "vjrUWIUkeIl",
              "Order": "vimJdKcOZX8",
              "Pet": "vuZawvBEAhG",
              "User": "vVNOkMuhu59",
              "addPet": "vuZawvBEAhG",
              "addPet_Body": "vuZawvBEAhG",
              "createUser": "vVNOkMuhu59",
              "createUser_Body": "vVNOkMuhu59",
              "createUsersWithListInput": "vVNOkMuhu59",
              "createUsersWithListInput_Body": "vrMyJmYcfcf",
              "findPetsByStatus": "v1QfJ6T3SbL",
              "findPetsByTags": "v1QfJ6T3SbL",
              "getOrderById": "vimJdKcOZX8",
              "getPetById": "vuZawvBEAhG",
              "getUserByName": "vVNOkMuhu59",
              "placeOrder": "vimJdKcOZX8",
              "placeOrder_Body": "vimJdKcOZX8",
              "status": "vlh4E1pXYTG",
              "tags": "vGqL1kemtHF",
              "updatePet": "vuZawvBEAhG",
              "updatePet_Body": "vuZawvBEAhG",
              "updateUser_Body": "vVNOkMuhu59",
              "uploadFile": "vjrUWIUkeIl",
          },
      }
    `);
});

describe("generateZodClientFromOpenAPI", () => {
    test("without options", async () => {
        const data = getZodClientTemplateContext(openApiDoc);

        const source = await readFile("./src/template.hbs", "utf-8");
        const template = compile(source);
        const prettierConfig = await resolveConfig("./");

        const output = template(data);
        const prettyOutput = maybePretty(output, prettierConfig);
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const vqZ2pR7iMi4 = z.object({ id: z.number().int(), name: z.string() }).partial();
          const vuZawvBEAhG = z.object({
              id: z.number().int().optional(),
              name: z.string(),
              category: vqZ2pR7iMi4.optional(),
              photoUrls: z.array(z.string()),
              tags: z.array(vqZ2pR7iMi4).optional(),
              status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const v1QfJ6T3SbL = z.array(vuZawvBEAhG);
          const vGqL1kemtHF = z.array(z.string()).optional();
          const vjrUWIUkeIl = z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial();
          const vimJdKcOZX8 = z
              .object({
                  id: z.number().int(),
                  petId: z.number().int(),
                  quantity: z.number().int(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial();
          const vVNOkMuhu59 = z
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
          const vrMyJmYcfcf = z.array(vVNOkMuhu59);

          const variables = {
              ApiResponse: vjrUWIUkeIl,
              Order: vimJdKcOZX8,
              Pet: vuZawvBEAhG,
              User: vVNOkMuhu59,
              addPet: vuZawvBEAhG,
              addPet_Body: vuZawvBEAhG,
              createUser: vVNOkMuhu59,
              createUser_Body: vVNOkMuhu59,
              createUsersWithListInput: vVNOkMuhu59,
              createUsersWithListInput_Body: vrMyJmYcfcf,
              findPetsByStatus: v1QfJ6T3SbL,
              findPetsByTags: v1QfJ6T3SbL,
              getOrderById: vimJdKcOZX8,
              getPetById: vuZawvBEAhG,
              getUserByName: vVNOkMuhu59,
              placeOrder: vimJdKcOZX8,
              placeOrder_Body: vimJdKcOZX8,
              status: vlh4E1pXYTG,
              tags: vGqL1kemtHF,
              updatePet: vuZawvBEAhG,
              updatePet_Body: vuZawvBEAhG,
              updateUser_Body: vVNOkMuhu59,
              uploadFile: vjrUWIUkeIl,
          };

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
                          schema: variables["updatePet_Body"],
                      },
                  ],
                  response: variables["Pet"],
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
                          schema: variables["addPet_Body"],
                      },
                  ],
                  response: variables["Pet"],
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
                          schema: z.number(),
                      },
                  ],
                  response: variables["Pet"],
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
                  requestFormat: "json",
                  parameters: [
                      {
                          name: "petId",
                          type: "Path",
                          schema: z.number(),
                      },
                      {
                          name: "additionalMetadata",
                          type: "Query",
                          schema: z.string().optional(),
                      },
                  ],
                  response: variables["ApiResponse"],
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
                          schema: variables["status"],
                      },
                  ],
                  response: z.array(variables["getPetById"]),
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
                          schema: variables["tags"],
                      },
                  ],
                  response: z.array(variables["getPetById"]),
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
                          schema: variables["placeOrder_Body"],
                      },
                  ],
                  response: variables["Order"],
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
                          schema: z.number(),
                      },
                  ],
                  response: variables["Order"],
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
                  response: variables["User"],
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
                          schema: variables["createUsersWithListInput_Body"],
                      },
                  ],
                  response: variables["User"],
                  errors: [
                      {
                          status: "default",
                          description: \`successful operation\`,
                          schema: z.void(),
                      },
                  ],
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
        const data = getZodClientTemplateContext(openApiDoc);

        const source = await readFile("./src/template.hbs", "utf-8");
        const template = compile(source);
        const prettierConfig = await resolveConfig("./");

        const output = template({ ...data, options: { withAlias: true } } as TemplateContext);
        const prettyOutput = maybePretty(output, prettierConfig);
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const vqZ2pR7iMi4 = z.object({ id: z.number().int(), name: z.string() }).partial();
          const vuZawvBEAhG = z.object({
              id: z.number().int().optional(),
              name: z.string(),
              category: vqZ2pR7iMi4.optional(),
              photoUrls: z.array(z.string()),
              tags: z.array(vqZ2pR7iMi4).optional(),
              status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const v1QfJ6T3SbL = z.array(vuZawvBEAhG);
          const vGqL1kemtHF = z.array(z.string()).optional();
          const vjrUWIUkeIl = z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial();
          const vimJdKcOZX8 = z
              .object({
                  id: z.number().int(),
                  petId: z.number().int(),
                  quantity: z.number().int(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial();
          const vVNOkMuhu59 = z
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
          const vrMyJmYcfcf = z.array(vVNOkMuhu59);

          const variables = {
              ApiResponse: vjrUWIUkeIl,
              Order: vimJdKcOZX8,
              Pet: vuZawvBEAhG,
              User: vVNOkMuhu59,
              addPet: vuZawvBEAhG,
              addPet_Body: vuZawvBEAhG,
              createUser: vVNOkMuhu59,
              createUser_Body: vVNOkMuhu59,
              createUsersWithListInput: vVNOkMuhu59,
              createUsersWithListInput_Body: vrMyJmYcfcf,
              findPetsByStatus: v1QfJ6T3SbL,
              findPetsByTags: v1QfJ6T3SbL,
              getOrderById: vimJdKcOZX8,
              getPetById: vuZawvBEAhG,
              getUserByName: vVNOkMuhu59,
              placeOrder: vimJdKcOZX8,
              placeOrder_Body: vimJdKcOZX8,
              status: vlh4E1pXYTG,
              tags: vGqL1kemtHF,
              updatePet: vuZawvBEAhG,
              updatePet_Body: vuZawvBEAhG,
              updateUser_Body: vVNOkMuhu59,
              uploadFile: vjrUWIUkeIl,
          };

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
                          schema: variables["updatePet_Body"],
                      },
                  ],
                  response: variables["Pet"],
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
                          schema: variables["addPet_Body"],
                      },
                  ],
                  response: variables["Pet"],
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
                          schema: z.number(),
                      },
                  ],
                  response: variables["Pet"],
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
                  requestFormat: "json",
                  parameters: [
                      {
                          name: "petId",
                          type: "Path",
                          schema: z.number(),
                      },
                      {
                          name: "additionalMetadata",
                          type: "Query",
                          schema: z.string().optional(),
                      },
                  ],
                  response: variables["ApiResponse"],
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
                          schema: variables["status"],
                      },
                  ],
                  response: z.array(variables["getPetById"]),
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
                          schema: variables["tags"],
                      },
                  ],
                  response: z.array(variables["getPetById"]),
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
                          schema: variables["placeOrder_Body"],
                      },
                  ],
                  response: variables["Order"],
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
                          schema: z.number(),
                      },
                  ],
                  response: variables["Order"],
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
                  response: variables["User"],
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
                          schema: variables["createUsersWithListInput_Body"],
                      },
                  ],
                  response: variables["User"],
                  errors: [
                      {
                          status: "default",
                          description: \`successful operation\`,
                          schema: z.void(),
                      },
                  ],
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
        const data = getZodClientTemplateContext(openApiDoc);

        const source = await readFile("./src/template.hbs", "utf-8");
        const template = compile(source);
        const prettierConfig = await resolveConfig("./");

        const output = template({ ...data, options: { baseUrl: "http://example.com" } } as TemplateContext);
        const prettyOutput = maybePretty(output, prettierConfig);
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { makeApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const vqZ2pR7iMi4 = z.object({ id: z.number().int(), name: z.string() }).partial();
          const vuZawvBEAhG = z.object({
              id: z.number().int().optional(),
              name: z.string(),
              category: vqZ2pR7iMi4.optional(),
              photoUrls: z.array(z.string()),
              tags: z.array(vqZ2pR7iMi4).optional(),
              status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const v1QfJ6T3SbL = z.array(vuZawvBEAhG);
          const vGqL1kemtHF = z.array(z.string()).optional();
          const vjrUWIUkeIl = z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial();
          const vimJdKcOZX8 = z
              .object({
                  id: z.number().int(),
                  petId: z.number().int(),
                  quantity: z.number().int(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial();
          const vVNOkMuhu59 = z
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
          const vrMyJmYcfcf = z.array(vVNOkMuhu59);

          const variables = {
              ApiResponse: vjrUWIUkeIl,
              Order: vimJdKcOZX8,
              Pet: vuZawvBEAhG,
              User: vVNOkMuhu59,
              addPet: vuZawvBEAhG,
              addPet_Body: vuZawvBEAhG,
              createUser: vVNOkMuhu59,
              createUser_Body: vVNOkMuhu59,
              createUsersWithListInput: vVNOkMuhu59,
              createUsersWithListInput_Body: vrMyJmYcfcf,
              findPetsByStatus: v1QfJ6T3SbL,
              findPetsByTags: v1QfJ6T3SbL,
              getOrderById: vimJdKcOZX8,
              getPetById: vuZawvBEAhG,
              getUserByName: vVNOkMuhu59,
              placeOrder: vimJdKcOZX8,
              placeOrder_Body: vimJdKcOZX8,
              status: vlh4E1pXYTG,
              tags: vGqL1kemtHF,
              updatePet: vuZawvBEAhG,
              updatePet_Body: vuZawvBEAhG,
              updateUser_Body: vVNOkMuhu59,
              uploadFile: vjrUWIUkeIl,
          };

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
                          schema: variables["updatePet_Body"],
                      },
                  ],
                  response: variables["Pet"],
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
                          schema: variables["addPet_Body"],
                      },
                  ],
                  response: variables["Pet"],
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
                          schema: z.number(),
                      },
                  ],
                  response: variables["Pet"],
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
                  requestFormat: "json",
                  parameters: [
                      {
                          name: "petId",
                          type: "Path",
                          schema: z.number(),
                      },
                      {
                          name: "additionalMetadata",
                          type: "Query",
                          schema: z.string().optional(),
                      },
                  ],
                  response: variables["ApiResponse"],
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
                          schema: variables["status"],
                      },
                  ],
                  response: z.array(variables["getPetById"]),
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
                          schema: variables["tags"],
                      },
                  ],
                  response: z.array(variables["getPetById"]),
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
                          schema: variables["placeOrder_Body"],
                      },
                  ],
                  response: variables["Order"],
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
                          schema: z.number(),
                      },
                  ],
                  response: variables["Order"],
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
                  response: variables["User"],
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
                          schema: variables["createUsersWithListInput_Body"],
                      },
                  ],
                  response: variables["User"],
                  errors: [
                      {
                          status: "default",
                          description: \`successful operation\`,
                          schema: z.void(),
                      },
                  ],
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
                        "200": { description: "OK", content: { "application/json": { schema: schemas.Root2 } } },
                    },
                },
            },
            "/nested": {
                get: {
                    operationId: "getNested",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas.Nested2 } } },
                    },
                },
            },
            "/deeplyNested": {
                get: {
                    operationId: "getDeeplyNested",
                    responses: {
                        "200": {
                            description: "OK",
                            content: { "application/json": { schema: schemas.DeeplyNested } },
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
                            content: { "application/json": { schema: schemas.VeryDeeplyNested } },
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
          "endpoints": [
              {
                  "alias": "getDeeplyNested",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/deeplyNested",
                  "requestFormat": "json",
                  "response": "z.array(variables["getVeryDeeplyNested"])",
              },
              {
                  "alias": "getNested",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/nested",
                  "requestFormat": "json",
                  "response": "z.object({ nested_prop: z.boolean().optional(), deeplyNested: variables["getDeeplyNested"].optional(), circularToRoot: variables["getRoot"].optional(), requiredProp: z.string() })",
              },
              {
                  "alias": "getRoot",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/root",
                  "requestFormat": "json",
                  "response": "z.object({ str: z.string(), nb: z.number(), nested: variables["getRoot"], partial: variables["getRoot"].optional(), optionalProp: z.string().optional() })",
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
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "v0a43T4TEdB": "z.enum(["aaa", "bbb", "ccc"])",
              "v6JdpQSn4Hj": "z.object({ something: z.string(), another: z.number() }).partial()",
              "vCj2di4DExd": "z.lazy(() => z.object({ str: z.string(), nb: z.number(), nested: vmYnun0sFdZ, partial: v6JdpQSn4Hj.optional(), optionalProp: z.string().optional() }))",
              "vFHcIEhV0A3": "z.object({ nested_prop: z.boolean().optional(), deeplyNested: vm0znqO5M3d.optional(), circularToRoot: vCj2di4DExd.optional(), requiredProp: z.string() })",
              "vm0znqO5M3d": "z.array(v0a43T4TEdB)",
              "vmYnun0sFdZ": "z.lazy(() => z.object({ nested_prop: z.boolean().optional(), deeplyNested: vm0znqO5M3d.optional(), circularToRoot: vCj2di4DExd.optional(), requiredProp: z.string() }))",
          },
          "typeNameByRefHash": {
              "vCj2di4DExd": "Root2",
              "vmYnun0sFdZ": "Nested2",
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
          "variables": {
              "getDeeplyNested": "vm0znqO5M3d",
              "getNested": "vFHcIEhV0A3",
              "getRoot": "vCj2di4DExd",
              "getVeryDeeplyNested": "v0a43T4TEdB",
          },
      }
    `);

    const source = await readFile("./src/template.hbs", "utf-8");
    const template = compile(source);
    const prettierConfig = await resolveConfig("./");

    const output = template(data);
    const prettyOutput = maybePretty(output, prettierConfig);
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      type Nested2 = {
          nested_prop?: boolean | undefined;
          deeplyNested?: DeeplyNested | undefined;
          circularToRoot?: Root2 | undefined;
          requiredProp: string;
      };
      type DeeplyNested = Array<VeryDeeplyNested>;
      type VeryDeeplyNested = "aaa" | "bbb" | "ccc";
      type PartialObject = Partial<{
          something: string;
          another: number;
      }>;
      type Root2 = {
          str: string;
          nb: number;
          nested: Nested2;
          partial?: PartialObject | undefined;
          optionalProp?: string | undefined;
      };

      const v0a43T4TEdB = z.enum(["aaa", "bbb", "ccc"]);
      const vm0znqO5M3d = z.array(v0a43T4TEdB);
      const vmYnun0sFdZ: z.ZodType<Nested2> = z.lazy(() =>
          z.object({
              nested_prop: z.boolean().optional(),
              deeplyNested: vm0znqO5M3d.optional(),
              circularToRoot: vCj2di4DExd.optional(),
              requiredProp: z.string(),
          })
      );
      const v6JdpQSn4Hj = z.object({ something: z.string(), another: z.number() }).partial();
      const vCj2di4DExd: z.ZodType<Root2> = z.lazy(() =>
          z.object({
              str: z.string(),
              nb: z.number(),
              nested: vmYnun0sFdZ,
              partial: v6JdpQSn4Hj.optional(),
              optionalProp: z.string().optional(),
          })
      );
      const vFHcIEhV0A3 = z.object({
          nested_prop: z.boolean().optional(),
          deeplyNested: vm0znqO5M3d.optional(),
          circularToRoot: vCj2di4DExd.optional(),
          requiredProp: z.string(),
      });

      const variables = {
          getDeeplyNested: vm0znqO5M3d,
          getNested: vFHcIEhV0A3,
          getRoot: vCj2di4DExd,
          getVeryDeeplyNested: v0a43T4TEdB,
      };

      const endpoints = makeApi([
          {
              method: "get",
              path: "/deeplyNested",
              requestFormat: "json",
              response: z.array(variables["getVeryDeeplyNested"]),
          },
          {
              method: "get",
              path: "/nested",
              requestFormat: "json",
              response: z.object({
                  nested_prop: z.boolean().optional(),
                  deeplyNested: variables["getDeeplyNested"].optional(),
                  circularToRoot: variables["getRoot"].optional(),
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
                  nested: variables["getRoot"],
                  partial: variables["getRoot"].optional(),
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

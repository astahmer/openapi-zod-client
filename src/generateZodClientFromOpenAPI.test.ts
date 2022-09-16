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
                  "errors": [],
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
                  "errors": [],
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
                  "errors": [],
                  "method": "get",
                  "parameters": [],
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
                  "errors": [],
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
                  "errors": [],
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
                  "errors": [],
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
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
                  "response": "variables["Order"]",
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
                          "schema": "variables["createUser_Body"]",
                          "type": "Body",
                      },
                  ],
                  "path": "/user",
                  "requestFormat": "json",
                  "response": "variables["User"]",
              },
              {
                  "alias": "getUserByName",
                  "description": "",
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/user/:username",
                  "requestFormat": "json",
                  "response": "variables["User"]",
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
                  "errors": [],
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
              "v8JbFEq2fUl": "z.object({ id: z.number().optional(), name: z.string(), category: vR1x0k5qaLk.optional(), photoUrls: z.array(z.string()), tags: z.array(vR1x0k5qaLk).optional(), status: z.enum(["available", "pending", "sold"]).optional() })",
              "vBaxCoPHbgy": "z.object({ code: z.number(), type: z.string(), message: z.string() }).partial()",
              "vGqL1kemtHF": "z.array(z.string()).optional()",
              "vLBYC40hXo1": "z.object({ id: z.number(), petId: z.number(), quantity: z.number(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial()",
              "vR1x0k5qaLk": "z.object({ id: z.number(), name: z.string() }).partial()",
              "vVrSPZVa6q7": "z.array(veNKKR5W6KW)",
              "veNKKR5W6KW": "z.object({ id: z.number(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number() }).partial()",
              "vh4fxCvnN1b": "z.array(v8JbFEq2fUl)",
              "vlh4E1pXYTG": "z.enum(["available", "pending", "sold"]).optional()",
          },
          "typeNameByRefHash": {},
          "types": {},
          "variables": {
              "ApiResponse": "vBaxCoPHbgy",
              "Order": "vLBYC40hXo1",
              "Pet": "v8JbFEq2fUl",
              "User": "veNKKR5W6KW",
              "addPet": "v8JbFEq2fUl",
              "addPet_Body": "v8JbFEq2fUl",
              "createUser": "veNKKR5W6KW",
              "createUser_Body": "veNKKR5W6KW",
              "createUsersWithListInput": "veNKKR5W6KW",
              "createUsersWithListInput_Body": "vVrSPZVa6q7",
              "findPetsByStatus": "vh4fxCvnN1b",
              "findPetsByTags": "vh4fxCvnN1b",
              "getOrderById": "vLBYC40hXo1",
              "getPetById": "v8JbFEq2fUl",
              "getUserByName": "veNKKR5W6KW",
              "placeOrder": "vLBYC40hXo1",
              "placeOrder_Body": "vLBYC40hXo1",
              "status": "vlh4E1pXYTG",
              "tags": "vGqL1kemtHF",
              "updatePet": "v8JbFEq2fUl",
              "updatePet_Body": "v8JbFEq2fUl",
              "updateUser_Body": "veNKKR5W6KW",
              "uploadFile": "vBaxCoPHbgy",
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
          "import { asApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const vR1x0k5qaLk = z.object({ id: z.number(), name: z.string() }).partial();
          const v8JbFEq2fUl = z.object({
              id: z.number().optional(),
              name: z.string(),
              category: vR1x0k5qaLk.optional(),
              photoUrls: z.array(z.string()),
              tags: z.array(vR1x0k5qaLk).optional(),
              status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const vh4fxCvnN1b = z.array(v8JbFEq2fUl);
          const vGqL1kemtHF = z.array(z.string()).optional();
          const vBaxCoPHbgy = z.object({ code: z.number(), type: z.string(), message: z.string() }).partial();
          const vLBYC40hXo1 = z
              .object({
                  id: z.number(),
                  petId: z.number(),
                  quantity: z.number(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial();
          const veNKKR5W6KW = z
              .object({
                  id: z.number(),
                  username: z.string(),
                  firstName: z.string(),
                  lastName: z.string(),
                  email: z.string(),
                  password: z.string(),
                  phone: z.string(),
                  userStatus: z.number(),
              })
              .partial();
          const vVrSPZVa6q7 = z.array(veNKKR5W6KW);

          const variables = {
              ApiResponse: vBaxCoPHbgy,
              Order: vLBYC40hXo1,
              Pet: v8JbFEq2fUl,
              User: veNKKR5W6KW,
              addPet: v8JbFEq2fUl,
              addPet_Body: v8JbFEq2fUl,
              createUser: veNKKR5W6KW,
              createUser_Body: veNKKR5W6KW,
              createUsersWithListInput: veNKKR5W6KW,
              createUsersWithListInput_Body: vVrSPZVa6q7,
              findPetsByStatus: vh4fxCvnN1b,
              findPetsByTags: vh4fxCvnN1b,
              getOrderById: vLBYC40hXo1,
              getPetById: v8JbFEq2fUl,
              getUserByName: veNKKR5W6KW,
              placeOrder: vLBYC40hXo1,
              placeOrder_Body: vLBYC40hXo1,
              status: vlh4E1pXYTG,
              tags: vGqL1kemtHF,
              updatePet: v8JbFEq2fUl,
              updatePet_Body: v8JbFEq2fUl,
              updateUser_Body: veNKKR5W6KW,
              uploadFile: vBaxCoPHbgy,
          };

          const endpoints = asApi([
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
              },
              {
                  method: "get",
                  path: "/pet/:petId",
                  description: \`Returns a single pet\`,
                  requestFormat: "json",
                  response: variables["Pet"],
              },
              {
                  method: "post",
                  path: "/pet/:petId/uploadImage",
                  requestFormat: "json",
                  parameters: [
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
              },
              {
                  method: "get",
                  path: "/store/order/:orderId",
                  description: \`For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.\`,
                  requestFormat: "json",
                  response: variables["Order"],
              },
              {
                  method: "post",
                  path: "/user",
                  description: \`This can only be done by the logged in user.\`,
                  requestFormat: "json",
                  parameters: [
                      {
                          name: "body",
                          description: \`Created user object\`,
                          type: "Body",
                          schema: variables["createUser_Body"],
                      },
                  ],
                  response: variables["User"],
              },
              {
                  method: "get",
                  path: "/user/:username",
                  requestFormat: "json",
                  response: variables["User"],
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
          "import { asApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const vR1x0k5qaLk = z.object({ id: z.number(), name: z.string() }).partial();
          const v8JbFEq2fUl = z.object({
              id: z.number().optional(),
              name: z.string(),
              category: vR1x0k5qaLk.optional(),
              photoUrls: z.array(z.string()),
              tags: z.array(vR1x0k5qaLk).optional(),
              status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const vh4fxCvnN1b = z.array(v8JbFEq2fUl);
          const vGqL1kemtHF = z.array(z.string()).optional();
          const vBaxCoPHbgy = z.object({ code: z.number(), type: z.string(), message: z.string() }).partial();
          const vLBYC40hXo1 = z
              .object({
                  id: z.number(),
                  petId: z.number(),
                  quantity: z.number(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial();
          const veNKKR5W6KW = z
              .object({
                  id: z.number(),
                  username: z.string(),
                  firstName: z.string(),
                  lastName: z.string(),
                  email: z.string(),
                  password: z.string(),
                  phone: z.string(),
                  userStatus: z.number(),
              })
              .partial();
          const vVrSPZVa6q7 = z.array(veNKKR5W6KW);

          const variables = {
              ApiResponse: vBaxCoPHbgy,
              Order: vLBYC40hXo1,
              Pet: v8JbFEq2fUl,
              User: veNKKR5W6KW,
              addPet: v8JbFEq2fUl,
              addPet_Body: v8JbFEq2fUl,
              createUser: veNKKR5W6KW,
              createUser_Body: veNKKR5W6KW,
              createUsersWithListInput: veNKKR5W6KW,
              createUsersWithListInput_Body: vVrSPZVa6q7,
              findPetsByStatus: vh4fxCvnN1b,
              findPetsByTags: vh4fxCvnN1b,
              getOrderById: vLBYC40hXo1,
              getPetById: v8JbFEq2fUl,
              getUserByName: veNKKR5W6KW,
              placeOrder: vLBYC40hXo1,
              placeOrder_Body: vLBYC40hXo1,
              status: vlh4E1pXYTG,
              tags: vGqL1kemtHF,
              updatePet: v8JbFEq2fUl,
              updatePet_Body: v8JbFEq2fUl,
              updateUser_Body: veNKKR5W6KW,
              uploadFile: vBaxCoPHbgy,
          };

          const endpoints = asApi([
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
              },
              {
                  method: "get",
                  path: "/pet/:petId",
                  alias: "getPetById",
                  description: \`Returns a single pet\`,
                  requestFormat: "json",
                  response: variables["Pet"],
              },
              {
                  method: "post",
                  path: "/pet/:petId/uploadImage",
                  alias: "uploadFile",
                  requestFormat: "json",
                  parameters: [
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
              },
              {
                  method: "get",
                  path: "/store/order/:orderId",
                  alias: "getOrderById",
                  description: \`For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.\`,
                  requestFormat: "json",
                  response: variables["Order"],
              },
              {
                  method: "post",
                  path: "/user",
                  alias: "createUser",
                  description: \`This can only be done by the logged in user.\`,
                  requestFormat: "json",
                  parameters: [
                      {
                          name: "body",
                          description: \`Created user object\`,
                          type: "Body",
                          schema: variables["createUser_Body"],
                      },
                  ],
                  response: variables["User"],
              },
              {
                  method: "get",
                  path: "/user/:username",
                  alias: "getUserByName",
                  requestFormat: "json",
                  response: variables["User"],
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
          "import { asApi, Zodios } from "@zodios/core";
          import { z } from "zod";

          const vR1x0k5qaLk = z.object({ id: z.number(), name: z.string() }).partial();
          const v8JbFEq2fUl = z.object({
              id: z.number().optional(),
              name: z.string(),
              category: vR1x0k5qaLk.optional(),
              photoUrls: z.array(z.string()),
              tags: z.array(vR1x0k5qaLk).optional(),
              status: z.enum(["available", "pending", "sold"]).optional(),
          });
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const vh4fxCvnN1b = z.array(v8JbFEq2fUl);
          const vGqL1kemtHF = z.array(z.string()).optional();
          const vBaxCoPHbgy = z.object({ code: z.number(), type: z.string(), message: z.string() }).partial();
          const vLBYC40hXo1 = z
              .object({
                  id: z.number(),
                  petId: z.number(),
                  quantity: z.number(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial();
          const veNKKR5W6KW = z
              .object({
                  id: z.number(),
                  username: z.string(),
                  firstName: z.string(),
                  lastName: z.string(),
                  email: z.string(),
                  password: z.string(),
                  phone: z.string(),
                  userStatus: z.number(),
              })
              .partial();
          const vVrSPZVa6q7 = z.array(veNKKR5W6KW);

          const variables = {
              ApiResponse: vBaxCoPHbgy,
              Order: vLBYC40hXo1,
              Pet: v8JbFEq2fUl,
              User: veNKKR5W6KW,
              addPet: v8JbFEq2fUl,
              addPet_Body: v8JbFEq2fUl,
              createUser: veNKKR5W6KW,
              createUser_Body: veNKKR5W6KW,
              createUsersWithListInput: veNKKR5W6KW,
              createUsersWithListInput_Body: vVrSPZVa6q7,
              findPetsByStatus: vh4fxCvnN1b,
              findPetsByTags: vh4fxCvnN1b,
              getOrderById: vLBYC40hXo1,
              getPetById: v8JbFEq2fUl,
              getUserByName: veNKKR5W6KW,
              placeOrder: vLBYC40hXo1,
              placeOrder_Body: vLBYC40hXo1,
              status: vlh4E1pXYTG,
              tags: vGqL1kemtHF,
              updatePet: v8JbFEq2fUl,
              updatePet_Body: v8JbFEq2fUl,
              updateUser_Body: veNKKR5W6KW,
              uploadFile: vBaxCoPHbgy,
          };

          const endpoints = asApi([
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
              },
              {
                  method: "get",
                  path: "/pet/:petId",
                  description: \`Returns a single pet\`,
                  requestFormat: "json",
                  response: variables["Pet"],
              },
              {
                  method: "post",
                  path: "/pet/:petId/uploadImage",
                  requestFormat: "json",
                  parameters: [
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
              },
              {
                  method: "get",
                  path: "/store/order/:orderId",
                  description: \`For valid response try integer IDs with value &lt;&#x3D; 5 or &gt; 10. Other values will generate exceptions.\`,
                  requestFormat: "json",
                  response: variables["Order"],
              },
              {
                  method: "post",
                  path: "/user",
                  description: \`This can only be done by the logged in user.\`,
                  requestFormat: "json",
                  parameters: [
                      {
                          name: "body",
                          description: \`Created user object\`,
                          type: "Body",
                          schema: variables["createUser_Body"],
                      },
                  ],
                  response: variables["User"],
              },
              {
                  method: "get",
                  path: "/user/:username",
                  requestFormat: "json",
                  response: variables["User"],
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
                            content: { "application/json": { schema: schemas.DeeplyNested2 } },
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
                            content: { "application/json": { schema: schemas.VeryDeeplyNested2 } },
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
                  "alias": "getNested",
                  "description": undefined,
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/nested",
                  "requestFormat": "json",
                  "response": "z.object({ nested_prop: z.boolean().optional(), deeplyNested: variables["getNested"].optional(), circularToRoot: variables["getRoot"].optional(), requiredProp: z.string() })",
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
              "getNested": "vFHcIEhV0A3",
              "getRoot": "vCj2di4DExd",
          },
      }
    `);

    const source = await readFile("./src/template.hbs", "utf-8");
    const template = compile(source);
    const prettierConfig = await resolveConfig("./");

    const output = template(data);
    const prettyOutput = maybePretty(output, prettierConfig);
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { asApi, Zodios } from "@zodios/core";
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
          getNested: vFHcIEhV0A3,
          getRoot: vCj2di4DExd,
      };

      const endpoints = asApi([
          {
              method: "get",
              path: "/nested",
              requestFormat: "json",
              response: z.object({
                  nested_prop: z.boolean().optional(),
                  deeplyNested: variables["getNested"].optional(),
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
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

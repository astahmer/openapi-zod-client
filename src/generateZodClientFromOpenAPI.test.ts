import SwaggerParser from "@apidevtools/swagger-parser";
import { compile } from "handlebars";
import { readFile } from "node:fs/promises";
import { OpenAPIObject } from "openapi3-ts";
import { resolveConfig } from "prettier";
import { describe, expect, test } from "vitest";
import { getZodClientTemplateContext, maybePretty, TemplateContext } from "./generateZodClientFromOpenAPI";

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
                  "path": "/pet/:petId",
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
                  "path": "/pet/:petId/uploadImage",
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
                  "path": "/store/order/:orderId",
                  "requestFormat": "json",
                  "response": "variables["Order"]",
              },
              {
                  "alias": "createUser",
                  "description": "This can only be done by the logged in user.",
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
                  "method": "get",
                  "parameters": [],
                  "path": "/user/:username",
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
              "baseUrl": "__baseurl__",
              "withAlias": false,
          },
          "schemas": {
              "vGKbZVOSWPT": "z.array(vdkmtDx9IhK)",
              "vR4bF4K0wxQ": "z.array(vV4HVBDOhfv)",
              "vV4HVBDOhfv": "z.object({ id: z.bigint().optional(), name: z.string(), category: vhu8VM64CQw, photoUrls: z.array(z.string().optional()), tags: z.array(vhu8VM64CQw).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).optional()",
              "vdkmtDx9IhK": "z.object({ id: z.bigint(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.bigint() }).partial().optional()",
              "vdqJo8eOFaZ": "z.object({ id: z.bigint(), petId: z.bigint(), quantity: z.bigint(), shipDate: z.string(), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial().optional()",
              "vhu8VM64CQw": "z.object({ id: z.bigint(), name: z.string() }).partial().optional()",
              "vlBJyXSdkxV": "z.array(z.string().optional()).optional()",
              "vlh4E1pXYTG": "z.enum(["available", "pending", "sold"]).optional()",
              "voE4gkLXxTn": "z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional()",
          },
          "variables": {
              "ApiResponse": "voE4gkLXxTn",
              "Order": "vdqJo8eOFaZ",
              "Pet": "vV4HVBDOhfv",
              "User": "vdkmtDx9IhK",
              "addPet": "vV4HVBDOhfv",
              "addPet_Body": "vV4HVBDOhfv",
              "createUser": "vdkmtDx9IhK",
              "createUser_Body": "vdkmtDx9IhK",
              "createUsersWithListInput": "vdkmtDx9IhK",
              "createUsersWithListInput_Body": "vGKbZVOSWPT",
              "findPetsByStatus": "vR4bF4K0wxQ",
              "findPetsByTags": "vR4bF4K0wxQ",
              "getOrderById": "vdqJo8eOFaZ",
              "getPetById": "vV4HVBDOhfv",
              "getUserByName": "vdkmtDx9IhK",
              "placeOrder": "vdqJo8eOFaZ",
              "placeOrder_Body": "vdqJo8eOFaZ",
              "status": "vlh4E1pXYTG",
              "tags": "vlBJyXSdkxV",
              "updatePet": "vV4HVBDOhfv",
              "updatePet_Body": "vV4HVBDOhfv",
              "updateUser_Body": "vdkmtDx9IhK",
              "uploadFile": "voE4gkLXxTn",
          },
      }
    `);
});

describe("generateZodClientFromOpenAPI", () => {
    test("without options", async () => {
        const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
        const data = getZodClientTemplateContext(openApiDoc);

        const source = await readFile("./src/template.hbs", "utf-8");
        const template = compile(source);
        const prettierConfig = await resolveConfig("./");

        const output = template(data);
        const prettyOutput = maybePretty(output, prettierConfig);
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { Zodios } from "@zodios/core";
          import { z } from "zod";

          const vhu8VM64CQw = z.object({ id: z.bigint(), name: z.string() }).partial().optional();
          const vV4HVBDOhfv = z
              .object({
                  id: z.bigint().optional(),
                  name: z.string(),
                  category: vhu8VM64CQw,
                  photoUrls: z.array(z.string().optional()),
                  tags: z.array(vhu8VM64CQw).optional(),
                  status: z.enum(["available", "pending", "sold"]).optional(),
              })
              .optional();
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const vR4bF4K0wxQ = z.array(vV4HVBDOhfv);
          const vlBJyXSdkxV = z.array(z.string().optional()).optional();
          const voE4gkLXxTn = z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional();
          const vdqJo8eOFaZ = z
              .object({
                  id: z.bigint(),
                  petId: z.bigint(),
                  quantity: z.bigint(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial()
              .optional();
          const vdkmtDx9IhK = z
              .object({
                  id: z.bigint(),
                  username: z.string(),
                  firstName: z.string(),
                  lastName: z.string(),
                  email: z.string(),
                  password: z.string(),
                  phone: z.string(),
                  userStatus: z.bigint(),
              })
              .partial()
              .optional();
          const vGKbZVOSWPT = z.array(vdkmtDx9IhK);

          const variables = {
              ApiResponse: voE4gkLXxTn,
              Order: vdqJo8eOFaZ,
              Pet: vV4HVBDOhfv,
              User: vdkmtDx9IhK,
              addPet: vV4HVBDOhfv,
              addPet_Body: vV4HVBDOhfv,
              createUser: vdkmtDx9IhK,
              createUser_Body: vdkmtDx9IhK,
              createUsersWithListInput: vdkmtDx9IhK,
              createUsersWithListInput_Body: vGKbZVOSWPT,
              findPetsByStatus: vR4bF4K0wxQ,
              findPetsByTags: vR4bF4K0wxQ,
              getOrderById: vdqJo8eOFaZ,
              getPetById: vV4HVBDOhfv,
              getUserByName: vdkmtDx9IhK,
              placeOrder: vdqJo8eOFaZ,
              placeOrder_Body: vdqJo8eOFaZ,
              status: vlh4E1pXYTG,
              tags: vlBJyXSdkxV,
              updatePet: vV4HVBDOhfv,
              updatePet_Body: vV4HVBDOhfv,
              updateUser_Body: vdkmtDx9IhK,
              uploadFile: voE4gkLXxTn,
          };

          const endpoints = [
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
                  response: z.record(z.bigint().optional()),
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
          ] as const;

          export const api = new Zodios("__baseurl__", endpoints);
          "
        `);
    });

    test("withAlias", async () => {
        const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
        const data = getZodClientTemplateContext(openApiDoc);

        const source = await readFile("./src/template.hbs", "utf-8");
        const template = compile(source);
        const prettierConfig = await resolveConfig("./");

        const output = template({ ...data, options: { withAlias: true } } as TemplateContext);
        const prettyOutput = maybePretty(output, prettierConfig);
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { Zodios } from "@zodios/core";
          import { z } from "zod";

          const vhu8VM64CQw = z.object({ id: z.bigint(), name: z.string() }).partial().optional();
          const vV4HVBDOhfv = z
              .object({
                  id: z.bigint().optional(),
                  name: z.string(),
                  category: vhu8VM64CQw,
                  photoUrls: z.array(z.string().optional()),
                  tags: z.array(vhu8VM64CQw).optional(),
                  status: z.enum(["available", "pending", "sold"]).optional(),
              })
              .optional();
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const vR4bF4K0wxQ = z.array(vV4HVBDOhfv);
          const vlBJyXSdkxV = z.array(z.string().optional()).optional();
          const voE4gkLXxTn = z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional();
          const vdqJo8eOFaZ = z
              .object({
                  id: z.bigint(),
                  petId: z.bigint(),
                  quantity: z.bigint(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial()
              .optional();
          const vdkmtDx9IhK = z
              .object({
                  id: z.bigint(),
                  username: z.string(),
                  firstName: z.string(),
                  lastName: z.string(),
                  email: z.string(),
                  password: z.string(),
                  phone: z.string(),
                  userStatus: z.bigint(),
              })
              .partial()
              .optional();
          const vGKbZVOSWPT = z.array(vdkmtDx9IhK);

          const variables = {
              ApiResponse: voE4gkLXxTn,
              Order: vdqJo8eOFaZ,
              Pet: vV4HVBDOhfv,
              User: vdkmtDx9IhK,
              addPet: vV4HVBDOhfv,
              addPet_Body: vV4HVBDOhfv,
              createUser: vdkmtDx9IhK,
              createUser_Body: vdkmtDx9IhK,
              createUsersWithListInput: vdkmtDx9IhK,
              createUsersWithListInput_Body: vGKbZVOSWPT,
              findPetsByStatus: vR4bF4K0wxQ,
              findPetsByTags: vR4bF4K0wxQ,
              getOrderById: vdqJo8eOFaZ,
              getPetById: vV4HVBDOhfv,
              getUserByName: vdkmtDx9IhK,
              placeOrder: vdqJo8eOFaZ,
              placeOrder_Body: vdqJo8eOFaZ,
              status: vlh4E1pXYTG,
              tags: vlBJyXSdkxV,
              updatePet: vV4HVBDOhfv,
              updatePet_Body: vV4HVBDOhfv,
              updateUser_Body: vdkmtDx9IhK,
              uploadFile: voE4gkLXxTn,
          };

          const endpoints = [
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
                  response: z.record(z.bigint().optional()),
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
          ] as const;

          export const api = new Zodios(endpoints);
          "
        `);
    });

    test("with baseUrl", async () => {
        const openApiDoc = (await SwaggerParser.parse("./example/petstore.yaml")) as OpenAPIObject;
        const data = getZodClientTemplateContext(openApiDoc);

        const source = await readFile("./src/template.hbs", "utf-8");
        const template = compile(source);
        const prettierConfig = await resolveConfig("./");

        const output = template({ ...data, options: { baseUrl: "http://example.com" } } as TemplateContext);
        const prettyOutput = maybePretty(output, prettierConfig);
        expect(prettyOutput).toMatchInlineSnapshot(`
          "import { Zodios } from "@zodios/core";
          import { z } from "zod";

          const vhu8VM64CQw = z.object({ id: z.bigint(), name: z.string() }).partial().optional();
          const vV4HVBDOhfv = z
              .object({
                  id: z.bigint().optional(),
                  name: z.string(),
                  category: vhu8VM64CQw,
                  photoUrls: z.array(z.string().optional()),
                  tags: z.array(vhu8VM64CQw).optional(),
                  status: z.enum(["available", "pending", "sold"]).optional(),
              })
              .optional();
          const vlh4E1pXYTG = z.enum(["available", "pending", "sold"]).optional();
          const vR4bF4K0wxQ = z.array(vV4HVBDOhfv);
          const vlBJyXSdkxV = z.array(z.string().optional()).optional();
          const voE4gkLXxTn = z.object({ code: z.bigint(), type: z.string(), message: z.string() }).partial().optional();
          const vdqJo8eOFaZ = z
              .object({
                  id: z.bigint(),
                  petId: z.bigint(),
                  quantity: z.bigint(),
                  shipDate: z.string(),
                  status: z.enum(["placed", "approved", "delivered"]),
                  complete: z.boolean(),
              })
              .partial()
              .optional();
          const vdkmtDx9IhK = z
              .object({
                  id: z.bigint(),
                  username: z.string(),
                  firstName: z.string(),
                  lastName: z.string(),
                  email: z.string(),
                  password: z.string(),
                  phone: z.string(),
                  userStatus: z.bigint(),
              })
              .partial()
              .optional();
          const vGKbZVOSWPT = z.array(vdkmtDx9IhK);

          const variables = {
              ApiResponse: voE4gkLXxTn,
              Order: vdqJo8eOFaZ,
              Pet: vV4HVBDOhfv,
              User: vdkmtDx9IhK,
              addPet: vV4HVBDOhfv,
              addPet_Body: vV4HVBDOhfv,
              createUser: vdkmtDx9IhK,
              createUser_Body: vdkmtDx9IhK,
              createUsersWithListInput: vdkmtDx9IhK,
              createUsersWithListInput_Body: vGKbZVOSWPT,
              findPetsByStatus: vR4bF4K0wxQ,
              findPetsByTags: vR4bF4K0wxQ,
              getOrderById: vdqJo8eOFaZ,
              getPetById: vV4HVBDOhfv,
              getUserByName: vdkmtDx9IhK,
              placeOrder: vdqJo8eOFaZ,
              placeOrder_Body: vdqJo8eOFaZ,
              status: vlh4E1pXYTG,
              tags: vlBJyXSdkxV,
              updatePet: vV4HVBDOhfv,
              updatePet_Body: vV4HVBDOhfv,
              updateUser_Body: vdkmtDx9IhK,
              uploadFile: voE4gkLXxTn,
          };

          const endpoints = [
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
                  response: z.record(z.bigint().optional()),
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
          ] as const;

          export const api = new Zodios("http://example.com", endpoints);
          "
        `);
    });
});

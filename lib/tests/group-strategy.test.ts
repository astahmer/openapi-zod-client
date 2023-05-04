import { OpenAPIObject, SchemaObject } from "openapi3-ts";
import SwaggerParser from "@apidevtools/swagger-parser";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from "../src";

test("group-strategy", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        paths: {
            "/pet": {
                get: {
                    operationId: "petGet",
                    tags: ["pet"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
                put: {
                    operationId: "petPut",
                    tags: ["pet"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/pet/all": {
                get: {
                    operationId: "petAllGet",
                    tags: ["pet"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
                put: {
                    operationId: "petAllPut",
                    tags: ["pet"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/store": {
                get: {
                    operationId: "storeGet",
                    tags: ["store"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
                put: {
                    operationId: "storePut",
                    tags: ["store"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/user": {
                get: {
                    operationId: "userGet",
                    tags: ["user"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
                put: {
                    operationId: "userPut",
                    tags: ["user"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/user/pets": {
                get: {
                    operationId: "userGet",
                    tags: ["user", "pet"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
                put: {
                    operationId: "userPut",
                    tags: ["user", "pet"],
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
            "/no-tags": {
                get: {
                    operationId: "noTagsGet",
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
                put: {
                    operationId: "noTagsPut",
                    responses: { "200": { content: { "application/json": { schema: { type: "string" } } } } },
                },
            },
        },
    };

    const ctxByTag = getZodClientTemplateContext(openApiDoc, { groupStrategy: "tag" });
    expect(ctxByTag.endpointsGroups).toMatchInlineSnapshot(`
      {
          "Default": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/no-tags",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/no-tags",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
              ],
              "schemas": {},
              "types": {},
          },
          "pet": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
              ],
              "schemas": {},
              "types": {},
          },
          "store": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
              ],
              "schemas": {},
              "types": {},
          },
          "user": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
              ],
              "schemas": {},
              "types": {},
          },
      }
    `);

    const resultGroupedByTag = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
        options: { groupStrategy: "tag" },
    });
    expect(resultGroupedByTag).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const petEndpoints = makeApi([
        {
          method: "get",
          path: "/pet",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/pet/all",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/pet/all",
          requestFormat: "json",
          response: z.string(),
        },
      ]);
      const storeEndpoints = makeApi([
        {
          method: "get",
          path: "/store",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/store",
          requestFormat: "json",
          response: z.string(),
        },
      ]);
      const userEndpoints = makeApi([
        {
          method: "get",
          path: "/user",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/user",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/user/pets",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/user/pets",
          requestFormat: "json",
          response: z.string(),
        },
      ]);
      const defaultEndpoints = makeApi([
        {
          method: "get",
          path: "/no-tags",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/no-tags",
          requestFormat: "json",
          response: z.string(),
        },
      ]);

      const endpoints = {
        pet: petEndpoints,
        store: storeEndpoints,
        user: userEndpoints,
        Default: defaultEndpoints,
      };

      export const petApi = new Zodios(petEndpoints);
      export const storeApi = new Zodios(storeEndpoints);
      export const userApi = new Zodios(userEndpoints);
      export const defaultApi = new Zodios(defaultEndpoints);

      export function createApiClient(
        endpointGroup: keyof typeof endpoints,
        baseUrl: string,
        options?: ZodiosOptions
      ) {
        return new Zodios(baseUrl, endpoints[endpointGroup], options);
      }
      "
    `);

    const ctxByMethod = getZodClientTemplateContext(openApiDoc, { groupStrategy: "method" });
    expect(ctxByMethod.endpointsGroups).toMatchInlineSnapshot(`
      {
          "get": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/no-tags",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
              ],
              "schemas": {},
              "types": {},
          },
          "put": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/no-tags",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
              ],
              "schemas": {},
              "types": {},
          },
      }
    `);

    const resultGroupedByMethod = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
        options: { groupStrategy: "method" },
    });

    expect(resultGroupedByMethod).toMatchInlineSnapshot(`
      "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

      const getEndpoints = makeApi([
        {
          method: "get",
          path: "/pet",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/pet/all",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/store",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/user",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/user/pets",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "get",
          path: "/no-tags",
          requestFormat: "json",
          response: z.string(),
        },
      ]);
      const putEndpoints = makeApi([
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/pet/all",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/store",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/user",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/user/pets",
          requestFormat: "json",
          response: z.string(),
        },
        {
          method: "put",
          path: "/no-tags",
          requestFormat: "json",
          response: z.string(),
        },
      ]);

      const endpoints = {
        get: getEndpoints,
        put: putEndpoints,
      };

      export const getApi = new Zodios(getEndpoints);
      export const putApi = new Zodios(putEndpoints);

      export function createApiClient(
        endpointGroup: keyof typeof endpoints,
        baseUrl: string,
        options?: ZodiosOptions
      ) {
        return new Zodios(baseUrl, endpoints[endpointGroup], options);
      }
      "
    `);
});

test("group-strategy: tag-file with modified petstore schema", async () => {
    const openApiDoc = (await SwaggerParser.parse("./tests/petstore.yaml")) as OpenAPIObject;
    // Add `Pet` object into `Order`.
    const orderObject = openApiDoc.components!.schemas!.Order as SchemaObject;
    orderObject!.properties!.pet = {
        $ref: "#/components/schemas/Pet",
    };

    const result = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
        options: { groupStrategy: "tag-file" },
    });

    expect(result).toMatchInlineSnapshot(`
      {
          "__common": "import { z } from "zod";

      export const Category = z
        .object({ id: z.number().int(), name: z.string() })
        .partial()
        .passthrough();
      export const Tag = z
        .object({ id: z.number().int(), name: z.string() })
        .partial()
        .passthrough();
      export const Pet = z
        .object({
          id: z.number().int().optional(),
          name: z.string(),
          category: Category.optional(),
          photoUrls: z.array(z.string()),
          tags: z.array(Tag).optional(),
          status: z.enum(["available", "pending", "sold"]).optional(),
        })
        .passthrough();
      ",
          "__index": "export { PetApi } from "./pet";
      export { StoreApi } from "./store";
      export { UserApi } from "./user";
      ",
          "pet": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";
      import { Pet } from "./common";
      import { Category } from "./common";
      import { Tag } from "./common";

      const ApiResponse = z
        .object({ code: z.number().int(), type: z.string(), message: z.string() })
        .partial()
        .passthrough();

      export const schemas = {
        ApiResponse,
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
          path: "/pet/:petId",
          requestFormat: "json",
          parameters: [
            {
              name: "petId",
              type: "Path",
              schema: z.number().int(),
            },
            {
              name: "name",
              type: "Query",
              schema: z.string().optional(),
            },
            {
              name: "status",
              type: "Query",
              schema: z.string().optional(),
            },
          ],
          response: z.void(),
          errors: [
            {
              status: 405,
              description: \`Invalid input\`,
              schema: z.void(),
            },
          ],
        },
        {
          method: "delete",
          path: "/pet/:petId",
          description: \`delete a pet\`,
          requestFormat: "json",
          parameters: [
            {
              name: "api_key",
              type: "Header",
              schema: z.string().optional(),
            },
            {
              name: "petId",
              type: "Path",
              schema: z.number().int(),
            },
          ],
          response: z.void(),
          errors: [
            {
              status: 400,
              description: \`Invalid pet value\`,
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
      ]);

      export const PetApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "store": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";
      import { Pet } from "./common";
      import { Category } from "./common";
      import { Tag } from "./common";

      const Order = z
        .object({
          id: z.number().int(),
          petId: z.number().int(),
          quantity: z.number().int(),
          shipDate: z.string().datetime({ offset: true }),
          status: z.enum(["placed", "approved", "delivered"]),
          complete: z.boolean(),
          pet: Pet,
        })
        .partial()
        .passthrough();

      export const schemas = {
        Order,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/store/inventory",
          description: \`Returns a map of status codes to quantities\`,
          requestFormat: "json",
          response: z.record(z.number().int()),
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
          method: "delete",
          path: "/store/order/:orderId",
          description: \`For valid response try integer IDs with value &lt; 1000. Anything above 1000 or nonintegers will generate API errors\`,
          requestFormat: "json",
          parameters: [
            {
              name: "orderId",
              type: "Path",
              schema: z.number().int(),
            },
          ],
          response: z.void(),
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
      ]);

      export const StoreApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "user": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";

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
        .partial()
        .passthrough();

      export const schemas = {
        User,
      };

      const endpoints = makeApi([
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
              schema: User,
            },
          ],
          response: z.void(),
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
        {
          method: "get",
          path: "/user/logout",
          requestFormat: "json",
          response: z.void(),
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
          method: "put",
          path: "/user/:username",
          description: \`This can only be done by the logged in user.\`,
          requestFormat: "json",
          parameters: [
            {
              name: "body",
              description: \`Update an existent user in the store\`,
              type: "Body",
              schema: User,
            },
            {
              name: "username",
              type: "Path",
              schema: z.string(),
            },
          ],
          response: z.void(),
        },
        {
          method: "delete",
          path: "/user/:username",
          description: \`This can only be done by the logged in user.\`,
          requestFormat: "json",
          parameters: [
            {
              name: "username",
              type: "Path",
              schema: z.string(),
            },
          ],
          response: z.void(),
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
      ]);

      export const UserApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
      }
    `);
});

test("group-strategy with complex schemas + split files", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: { version: "1", title: "Example API" },
        components: {
            schemas: {
                Pet: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        nickname: { type: "string" },
                        owner: { $ref: "#/components/schemas/User" },
                    },
                },
                User: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        firstname: { type: "string" },
                        lastname: { type: "string" },
                        email: { type: "string" },
                        friends: { type: "array", items: { $ref: "#/components/schemas/User" } },
                    },
                },
                Store: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        address: { type: "string" },
                        country: { $ref: "#/components/schemas/Country" },
                        owner: { $ref: "#/components/schemas/User" },
                    },
                },
                Country: {
                    type: "object",
                    properties: {
                        id: { type: "integer" },
                        name: { type: "string" },
                        code: { type: "string" },
                        store_list: { type: "array", items: { $ref: "#/components/schemas/Store" } },
                    },
                },
            },
        },
        paths: {
            "/pet": {
                get: {
                    operationId: "petGet",
                    tags: ["pet"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } } },
                    },
                },
                put: {
                    operationId: "petPut",
                    tags: ["pet"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } } },
                    },
                },
            },
            "/pet/all": {
                get: {
                    operationId: "petAllGet",
                    tags: ["pet"],
                    responses: {
                        "200": {
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/Pet" } },
                                },
                            },
                        },
                    },
                },
                post: {
                    operationId: "petAllPost",
                    tags: ["pet"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } } },
                    },
                },
            },
            "/user": {
                get: {
                    operationId: "userGet",
                    tags: ["user"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    },
                },
                put: {
                    operationId: "userPut",
                    tags: ["user"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                    },
                },
            },
            "/store": {
                get: {
                    operationId: "storeGet",
                    tags: ["store"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Store" } } } },
                    },
                },
                put: {
                    operationId: "storePut",
                    tags: ["store"],
                    responses: {
                        "200": { content: { "application/json": { schema: { $ref: "#/components/schemas/Store" } } } },
                    },
                },
            },
            "/countries": {
                get: {
                    operationId: "noTagsGet",
                    responses: {
                        "200": {
                            content: { "application/json": { schema: { $ref: "#/components/schemas/Country" } } },
                        },
                    },
                },
            },
        },
    };

    const ctxByTag = getZodClientTemplateContext(openApiDoc, { groupStrategy: "tag-file" });
    expect(ctxByTag.endpointsGroups).toMatchInlineSnapshot(`
      {
          "Default": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/countries",
                      "requestFormat": "json",
                      "response": "Country",
                  },
              ],
              "imports": {
                  "Country": "common",
                  "Store": "common",
                  "User": "common",
              },
              "schemas": {},
              "types": {},
          },
          "pet": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "Pet",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "Pet",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.array(Pet)",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "post",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "Pet",
                  },
              ],
              "imports": {
                  "User": "common",
              },
              "schemas": {
                  "Pet": "z.object({ id: z.number().int(), nickname: z.string(), owner: User }).partial().passthrough()",
              },
              "types": {},
          },
          "store": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "Store",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "Store",
                  },
              ],
              "imports": {
                  "Country": "common",
                  "Store": "common",
                  "User": "common",
              },
              "schemas": {},
              "types": {},
          },
          "user": {
              "endpoints": [
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "User",
                  },
                  {
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "User",
                  },
              ],
              "imports": {
                  "User": "common",
              },
              "schemas": {},
              "types": {},
          },
      }
    `);

    const resultGroupedByTagSplitByFiles = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
        options: { groupStrategy: "tag-file" },
    });

    expect(resultGroupedByTagSplitByFiles).toMatchInlineSnapshot(`
      {
          "Default": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";
      import { Country } from "./common";
      import { Store } from "./common";
      import { User } from "./common";

      const endpoints = makeApi([
        {
          method: "get",
          path: "/countries",
          requestFormat: "json",
          response: Country,
        },
      ]);

      export const DefaultApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "__common": "import { z } from "zod";

      export type User = Partial<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        friends: Array<User>;
      }>;
      export type Store = Partial<{
        id: number;
        name: string;
        address: string;
        country: Country;
        owner: User;
      }>;
      export type Country = Partial<{
        id: number;
        name: string;
        code: string;
        store_list: Array<Store>;
      }>;

      export const User = z.lazy(() =>
        z
          .object({
            id: z.number().int(),
            firstname: z.string(),
            lastname: z.string(),
            email: z.string(),
            friends: z.array(User),
          })
          .partial()
          .passthrough()
      );
      export const Country = z.lazy(() =>
        z
          .object({
            id: z.number().int(),
            name: z.string(),
            code: z.string(),
            store_list: z.array(Store),
          })
          .partial()
          .passthrough()
      );
      export const Store = z.lazy(() =>
        z
          .object({
            id: z.number().int(),
            name: z.string(),
            address: z.string(),
            country: Country,
            owner: User,
          })
          .partial()
          .passthrough()
      );
      ",
          "__index": "export { PetApi } from "./pet";
      export { UserApi } from "./user";
      export { StoreApi } from "./store";
      export { DefaultApi } from "./Default";
      ",
          "pet": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";
      import { User } from "./common";

      const Pet = z
        .object({ id: z.number().int(), nickname: z.string(), owner: User })
        .partial()
        .passthrough();

      export const schemas = {
        Pet,
      };

      const endpoints = makeApi([
        {
          method: "get",
          path: "/pet",
          requestFormat: "json",
          response: Pet,
        },
        {
          method: "put",
          path: "/pet",
          requestFormat: "json",
          response: Pet,
        },
        {
          method: "get",
          path: "/pet/all",
          requestFormat: "json",
          response: z.array(Pet),
        },
        {
          method: "post",
          path: "/pet/all",
          requestFormat: "json",
          response: Pet,
        },
      ]);

      export const PetApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "store": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";
      import { Store } from "./common";
      import { Country } from "./common";
      import { User } from "./common";

      const endpoints = makeApi([
        {
          method: "get",
          path: "/store",
          requestFormat: "json",
          response: Store,
        },
        {
          method: "put",
          path: "/store",
          requestFormat: "json",
          response: Store,
        },
      ]);

      export const StoreApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
          "user": "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
      import { z } from "zod";
      import { User } from "./common";

      const endpoints = makeApi([
        {
          method: "get",
          path: "/user",
          requestFormat: "json",
          response: User,
        },
        {
          method: "put",
          path: "/user",
          requestFormat: "json",
          response: User,
        },
      ]);

      export const UserApi = new Zodios(endpoints);

      export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
        return new Zodios(baseUrl, endpoints, options);
      }
      ",
      }
    `);
});

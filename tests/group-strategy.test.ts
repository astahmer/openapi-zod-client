import { OpenAPIObject } from "openapi3-ts";
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
          "default": {
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "noTagsGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/no-tags",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "noTagsPut",
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
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "petGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "petPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "petAllGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "petAllPut",
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
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "storeGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "storePut",
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
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "userGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userPut",
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
      "import { makeApi, Zodios } from "@zodios/core";
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

      export const petApi = new Zodios(petEndpoints);

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

      export const storeApi = new Zodios(storeEndpoints);

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

      export const userApi = new Zodios(userEndpoints);

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

      export const defaultApi = new Zodios(defaultEndpoints);
      "
    `);

    const ctxByMethod = getZodClientTemplateContext(openApiDoc, { groupStrategy: "method" });
    expect(ctxByMethod.endpointsGroups).toMatchInlineSnapshot(`
      {
          "get": {
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "petGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "petAllGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "storeGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "noTagsGet",
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
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "petPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "petAllPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "storePut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "userPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user/pets",
                      "requestFormat": "json",
                      "response": "z.string()",
                  },
                  {
                      "alias": "noTagsPut",
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
      "import { makeApi, Zodios } from "@zodios/core";
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

      export const getApi = new Zodios(getEndpoints);

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

      export const putApi = new Zodios(putEndpoints);
      "
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
                    tags: ["noTags"],
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
          "noTags": {
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "noTagsGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/countries",
                      "requestFormat": "json",
                      "response": "Country",
                  },
              ],
              "schemas": {
                  "Country": "z.lazy(() => z.object({ id: z.number().int(), name: z.string(), code: z.string(), store_list: z.array(Store) }).partial())",
              },
              "types": {
                  "Country": "type Country = Partial<{
          id: number;
          name: string;
          code: string;
          store_list: Array<Store>;
      }>;",
              },
          },
          "pet": {
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "petGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "Pet",
                  },
                  {
                      "alias": "petPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/pet",
                      "requestFormat": "json",
                      "response": "Pet",
                  },
                  {
                      "alias": "petAllGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "z.array(Pet)",
                  },
                  {
                      "alias": "petAllPost",
                      "description": undefined,
                      "errors": [],
                      "method": "post",
                      "parameters": [],
                      "path": "/pet/all",
                      "requestFormat": "json",
                      "response": "Pet",
                  },
              ],
              "schemas": {
                  "Pet": "z.object({ id: z.number().int(), nickname: z.string(), owner: User }).partial()",
              },
              "types": {},
          },
          "store": {
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "storeGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "Store",
                  },
                  {
                      "alias": "storePut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/store",
                      "requestFormat": "json",
                      "response": "Store",
                  },
              ],
              "schemas": {
                  "Store": "z.lazy(() => z.object({ id: z.number().int(), name: z.string(), address: z.string(), country: Country, owner: User }).partial())",
              },
              "types": {
                  "Store": "type Store = Partial<{
          id: number;
          name: string;
          address: string;
          country: Country;
          owner: User;
      }>;",
              },
          },
          "user": {
              "circularTypeByName": {},
              "endpoints": [
                  {
                      "alias": "userGet",
                      "description": undefined,
                      "errors": [],
                      "method": "get",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "User",
                  },
                  {
                      "alias": "userPut",
                      "description": undefined,
                      "errors": [],
                      "method": "put",
                      "parameters": [],
                      "path": "/user",
                      "requestFormat": "json",
                      "response": "User",
                  },
              ],
              "schemas": {
                  "User": "z.lazy(() => z.object({ id: z.number().int(), firstname: z.string(), lastname: z.string(), email: z.string(), friends: z.array(User) }).partial())",
              },
              "types": {
                  "User": "type User = Partial<{
          id: number;
          firstname: string;
          lastname: string;
          email: string;
          friends: Array<User>;
      }>;",
              },
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
          "noTags": "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      type Country = Partial<{
        id: number;
        name: string;
        code: string;
        store_list: Array<Store>;
      }>;

      const Country = z.lazy(() =>
        z
          .object({
            id: z.number().int(),
            name: z.string(),
            code: z.string(),
            store_list: z.array(Store),
          })
          .partial()
      );

      const endpoints = makeApi([
        {
          method: "get",
          path: "/countries",
          requestFormat: "json",
          response: Country,
        },
      ]);

      export const api = new Zodios(endpoints);
      ",
          "pet": "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const Pet = z
        .object({ id: z.number().int(), nickname: z.string(), owner: User })
        .partial();

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

      export const api = new Zodios(endpoints);
      ",
          "store": "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      type Store = Partial<{
        id: number;
        name: string;
        address: string;
        country: Country;
        owner: User;
      }>;

      const Store = z.lazy(() =>
        z
          .object({
            id: z.number().int(),
            name: z.string(),
            address: z.string(),
            country: Country,
            owner: User,
          })
          .partial()
      );

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

      export const api = new Zodios(endpoints);
      ",
          "user": "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      type User = Partial<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        friends: Array<User>;
      }>;

      const User = z.lazy(() =>
        z
          .object({
            id: z.number().int(),
            firstname: z.string(),
            lastname: z.string(),
            email: z.string(),
            friends: z.array(User),
          })
          .partial()
      );

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

      export const api = new Zodios(endpoints);
      ",
      }
    `);
});

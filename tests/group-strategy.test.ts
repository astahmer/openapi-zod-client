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
    expect(ctxByTag.endpointsGrouped).toMatchInlineSnapshot(`
      {
          "default": [
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
          "pet": [
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
          "store": [
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
          "user": [
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
      }
    `);

    const resultGroupedByTag = await generateZodClientFromOpenAPI({
        openApiDoc,
        disableWriteToFile: true,
        options: { groupStrategy: "method" },
    });
    expect(resultGroupedByTag).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const variables = {};

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

    const ctxByMethod = getZodClientTemplateContext(openApiDoc, { groupStrategy: "method" });
    expect(ctxByMethod.endpointsGrouped).toMatchInlineSnapshot(`
      {
          "get": [
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
          "put": [
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

      const variables = {};

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

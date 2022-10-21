import { SchemasObject } from "openapi3-ts";
import { expect, it } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

it("includes errors-responses", async () => {
    const schemas = {
        Main: {
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
            },
            required: ["str", "nb"],
        },
        AnotherSuccess: { type: "number" },
        Error400: {
            type: "object",
            properties: {
                is400: { type: "boolean" },
            },
        },
        Error500: { type: "string" },
    } as SchemasObject;

    const openApiDoc = {
        openapi: "3.0.3",
        info: { title: "Swagger Petstore - OpenAPI 3.0", version: "1.0.11" },
        paths: {
            "/example": {
                get: {
                    operationId: "getExample",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas.Main } } },
                        "201": {
                            description: "Created",
                            content: { "application/json": { schema: schemas.AnotherSuccess } },
                        },
                        "400": {
                            description: "Bad request",
                            content: { "application/json": { schema: schemas.Error400 } },
                        },
                        "500": {
                            description: "Internal server error",
                            content: { "application/json": { schema: schemas.Error500 } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };

    const result = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });

    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const getExample = z.object({ str: z.string(), nb: z.number() });

      const endpoints = makeApi([
        {
          method: "get",
          path: "/example",
          requestFormat: "json",
          response: z.object({ str: z.string(), nb: z.number() }),
          errors: [
            {
              status: 400,
              description: \`Bad request\`,
              schema: z.object({ is400: z.boolean() }).partial(),
            },
            {
              status: 500,
              description: \`Internal server error\`,
              schema: z.string(),
            },
          ],
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

it("determines which status are considered errors-responses", async () => {
    const schemas = {
        Main: {
            type: "object",
            properties: {
                str: { type: "string" },
                nb: { type: "number" },
            },
            required: ["str", "nb"],
        },
        AnotherSuccess: { type: "number" },
        Error400: {
            type: "object",
            properties: {
                is400: { type: "boolean" },
                nested: { $ref: "#/components/schemas/Nested" },
            },
        },
        Error404: { type: "null" },
        Error500: { type: "string" },
        Nested: {
            type: "object",
            properties: {
                nested_prop: { type: "boolean" },
                deeplyNested: { $ref: "#/components/schemas/DeeplyNested" },
                circularToMain: { $ref: "#/components/schemas/Main" },
                requiredProp: { type: "string" },
            },
            required: ["requiredProp"],
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
            "/example": {
                get: {
                    operationId: "getExample",
                    responses: {
                        "200": { description: "OK", content: { "application/json": { schema: schemas.Main } } },
                        "201": {
                            description: "Created",
                            content: { "application/json": { schema: schemas.AnotherSuccess } },
                        },
                        "400": {
                            description: "Bad request",
                            content: { "application/json": { schema: schemas.Error400 } },
                        },
                        "404": {
                            description: "Not found",
                            content: { "application/json": { schema: schemas.Error400 } },
                        },
                        "500": {
                            description: "Internal server error",
                            content: { "application/json": { schema: schemas.Error500 } },
                        },
                    },
                },
            },
        },
        components: { schemas },
    };

    const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        options: {
            isErrorStatus: "status === 400 || status === 500",
        },
        openApiDoc,
    });

    expect(result).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
      const DeeplyNested = z.array(VeryDeeplyNested);
      const Main = z.object({ str: z.string(), nb: z.number() });
      const Nested = z.object({
        nested_prop: z.boolean().optional(),
        deeplyNested: DeeplyNested.optional(),
        circularToMain: Main.optional(),
        requiredProp: z.string(),
      });
      const getExample = z.object({ str: z.string(), nb: z.number() });

      const endpoints = makeApi([
        {
          method: "get",
          path: "/example",
          requestFormat: "json",
          response: z.object({ str: z.string(), nb: z.number() }),
          errors: [
            {
              status: 400,
              description: \`Bad request\`,
              schema: z.object({ is400: z.boolean(), nested: Nested }).partial(),
            },
            {
              status: 500,
              description: \`Internal server error\`,
              schema: z.string(),
            },
          ],
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);

    expect(
        await generateZodClientFromOpenAPI({
            disableWriteToFile: true,
            options: {
                isErrorStatus: (status) => status === 400 || status === 500,
            },
            openApiDoc,
        })
    ).toMatchInlineSnapshot(`
      "import { makeApi, Zodios } from "@zodios/core";
      import { z } from "zod";

      const VeryDeeplyNested = z.enum(["aaa", "bbb", "ccc"]);
      const DeeplyNested = z.array(VeryDeeplyNested);
      const Main = z.object({ str: z.string(), nb: z.number() });
      const Nested = z.object({
        nested_prop: z.boolean().optional(),
        deeplyNested: DeeplyNested.optional(),
        circularToMain: Main.optional(),
        requiredProp: z.string(),
      });
      const getExample = z.object({ str: z.string(), nb: z.number() });

      const endpoints = makeApi([
        {
          method: "get",
          path: "/example",
          requestFormat: "json",
          response: z.object({ str: z.string(), nb: z.number() }),
          errors: [
            {
              status: 400,
              description: \`Bad request\`,
              schema: z.object({ is400: z.boolean(), nested: Nested }).partial(),
            },
            {
              status: 500,
              description: \`Internal server error\`,
              schema: z.string(),
            },
          ],
        },
      ]);

      export const api = new Zodios(endpoints);
      "
    `);
});

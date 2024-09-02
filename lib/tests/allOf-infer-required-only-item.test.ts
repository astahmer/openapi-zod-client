import type { OpenAPIObject } from "openapi3-ts";
import { expect, test } from "vitest";
import { generateZodClientFromOpenAPI } from "../src";

// https://github.com/astahmer/openapi-zod-client/issues/49
test("allOf-infer-required-only-item", async () => {
    const openApiDoc: OpenAPIObject = {
        openapi: "3.0.3",
        info: {
            title: "User",
            version: "1.0.0",
        },
        paths: {
            "/user": {
                get: {
                    responses: {
                        "200": {
                            description: "return user",
                            content: {
                                "application/json": {
                                    schema: {
                                        $ref: "#/components/schemas/userResponse",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                user: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                        },
                        email: {
                            type: "string",
                        },
                    },
                },
                userResponse: {
                    type: "object",
                    properties: {
                        user: {
                            allOf: [
                                {
                                    $ref: "#/components/schemas/user",
                                },
                                {
                                    required: ["name"],
                                },
                            ],
                        },
                    },
                },
            },
        },
    };

    const output = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc,
        options: {
            shouldExportAllTypes: true,
            shouldExportAllSchemas: true,
            withImplicitRequiredProps: true,
        },
    });
    expect(output).toMatchInlineSnapshot(`
    "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
    import { z } from "zod";
    
    type user = Partial<{
      name: string;
      email: string;
    }>;
    type userResponse = Partial<{
      user: user & {
        name: string;
      };
    }>;
    
    const user: z.ZodType<user> = z
      .object({ name: z.string(), email: z.string() })
      .passthrough();
    const userResponse: z.ZodType<userResponse> = z
      .object({ user: user.and(z.object({ name: z.string() }).passthrough()) })
      .passthrough();
    
    export const schemas = {
      user,
      userResponse,
    };
    
    const endpoints = makeApi([
      {
        method: "get",
        path: "/user",
        requestFormat: "json",
        response: userResponse,
      },
    ]);
    
    export const api = new Zodios(endpoints);
    
    export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
      return new Zodios(baseUrl, endpoints, options);
    }
    "
    `);
});

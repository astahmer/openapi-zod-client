import { describe, test, expect } from "vitest";
import { z } from "zod";
import { getZodSchema } from "../src/openApiToZod.js";
import { CodeMeta } from "../src/CodeMeta.js";
import { OpenAPIObject } from "openapi3-ts";
import { generateZodClientFromOpenAPI } from "../src/generateZodClientFromOpenAPI.js";

// the schemas and fixtures used in these tests are modified from examples here: https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#anyof

type Validator = <T>(zod: typeof z, input: T) => T;

function createValidator(zodSchema: CodeMeta) {
    return new Function("z", "input", `return ${zodSchema}.parse(input)`) as Validator;
}

const fixtures = {
    petByAge: { age: 4 },
    petByType: { pet_type: "Cat" },
    petByAgeAndType: {
        nickname: "Fido",
        pet_type: "Dog",
        age: 4,
    },
    invalid: {
        nickname: "Mr. Paws",
        hunts: false,
    },
};

describe("anyOf behavior", () => {
    test("adds passthrough() to objects", () => {
        const zodSchema = getZodSchema({
            schema: {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                ],
            },
        });

        expect(zodSchema).toMatchInlineSnapshot(
            '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough()])"'
        );

        const validator = createValidator(zodSchema);
        expect(validator(z, fixtures.petByAge)).toEqual(fixtures.petByAge);
        expect(validator(z, fixtures.petByType)).toEqual(fixtures.petByType);
        expect(validator(z, fixtures.petByAgeAndType)).toEqual(fixtures.petByAgeAndType);
        expect(() => validator(z, fixtures.invalid)).toThrowError();
    });

    test("handles mixes of primitive types and objects", () => {
        const zodSchema = getZodSchema({
            schema: {
                anyOf: [
                    {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                    { type: "number" },
                ],
            },
        });

        expect(zodSchema).toMatchInlineSnapshot(
            '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.number()])"'
        );

        const validator = createValidator(zodSchema);
        expect(validator(z, fixtures.petByAge)).toEqual(fixtures.petByAge);
        expect(validator(z, fixtures.petByType)).toEqual(fixtures.petByType);
        expect(validator(z, fixtures.petByAgeAndType)).toEqual(fixtures.petByAgeAndType);
        expect(() => validator(z, fixtures.invalid)).toThrowError();
        expect(validator(z, 1)).toEqual(1);
    });

    test("handles an array of types", () => {
        const zodSchema = getZodSchema({
            schema: {
                anyOf: [
                    {
                        type: ["number", "boolean"],
                    },
                    {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                    { type: "string" },
                ],
            },
        });

        expect(zodSchema).toMatchInlineSnapshot(
            '"z.union([z.union([z.number(), z.boolean()]), z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.string()])"'
        );

        const validator = createValidator(zodSchema);
        expect(validator(z, fixtures.petByAge)).toEqual(fixtures.petByAge);
        expect(validator(z, fixtures.petByType)).toEqual(fixtures.petByType);
        expect(validator(z, fixtures.petByAgeAndType)).toEqual(fixtures.petByAgeAndType);
        expect(() => validator(z, fixtures.invalid)).toThrowError();
        expect(validator(z, 1)).toEqual(1);
        expect(validator(z, "hello")).toEqual("hello");
        expect(validator(z, true)).toEqual(true);
    });

    test("handles $refs", async () => {
        const openApiDoc: OpenAPIObject = {
            openapi: "3.0.2",
            info: {
                title: "anyOf with refs",
                version: "v1",
            },
            paths: {
                "/test": {
                    get: {
                        parameters: [
                            {
                                name: "anyOfRef",
                                schema: {
                                    anyOf: [
                                        { $ref: "#/components/schemas/PetByAge" },
                                        { $ref: "#/components/schemas/PetByType" },
                                    ],
                                },
                                in: "query",
                            },
                        ],
                    },
                },
            },
            components: {
                schemas: {
                    PetByAge: {
                        type: "object",
                        properties: {
                            age: {
                                type: "integer",
                            },
                            nickname: {
                                type: "string",
                            },
                        },
                        required: ["age"],
                    },
                    PetByType: {
                        type: "object",
                        properties: {
                            pet_type: {
                                type: "string",
                                enum: ["Cat", "Dog"],
                            },
                            hunts: {
                                type: "boolean",
                            },
                        },
                        required: ["pet_type"],
                    },
                },
            },
        };

        const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
        expect(output).toMatchInlineSnapshot(`
          "import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
          import { z } from "zod";

          const PetByAge = z
            .object({ age: z.number().int(), nickname: z.string().optional() })
            .passthrough();
          const PetByType = z
            .object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() })
            .passthrough();
          const anyOfRef = z.union([PetByAge, PetByType]).optional();

          export const schemas = {
            PetByAge,
            PetByType,
            anyOfRef,
          };

          const endpoints = makeApi([
            {
              method: "get",
              path: "/test",
              requestFormat: "json",
              parameters: [
                {
                  name: "anyOfRef",
                  type: "Query",
                  schema: anyOfRef,
                },
              ],
              response: z.void(),
            },
          ]);

          export const api = new Zodios(endpoints);

          export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
            return new Zodios(baseUrl, endpoints, options);
          }
          "
        `);
    });
});

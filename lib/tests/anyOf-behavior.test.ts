import { describe, test, expect } from "vitest";
import { z } from "zod";
import { makeSchemaResolver } from "../src/makeSchemaResolver.js";
import { getZodSchema } from "../src/openApiToZod.js";
import { asComponentSchema } from "../src/utils.js";
import { CodeMeta } from "../src/CodeMeta.js";

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

    test("handles $refs", () => {
        const schemas = {
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
        };

        const ctx = {
            resolver: makeSchemaResolver({ components: { schemas } } as any),
            zodSchemaByName: {},
            schemaByName: {},
        };
        Object.keys(schemas).forEach((key) => ctx.resolver.getSchemaByRef(asComponentSchema(key)));

        const zodSchema = getZodSchema({
            schema: {
                anyOf: [{ $ref: "#/components/schemas/PetByAge" }, { $ref: "#/components/schemas/PetByType" }],
            },
            ctx,
        });

        expect(zodSchema).toMatchInlineSnapshot('"z.union([PetByAge.passthrough(), PetByType.passthrough()])"');
    });
});

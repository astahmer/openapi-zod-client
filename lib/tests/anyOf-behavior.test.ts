import { describe, test, expect } from "vitest";
import { makeSchemaResolver } from "../src/makeSchemaResolver.js";
import { getZodSchema } from "../src/openApiToZod.js";
import { asComponentSchema } from "../src/utils.js";

// these tests use modified examples from: https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#anyof

describe("anyOf behavior", () => {
    test("adds passthrough() to objects", () => {
        expect(
            getZodSchema({
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
            })
        ).toMatchInlineSnapshot(
            '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough()])"'
        );
    });

    test("handles mixes of primitive types and objects", () => {
        expect(
            getZodSchema({
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
            })
        ).toMatchInlineSnapshot(
            '"z.union([z.object({ age: z.number().int(), nickname: z.string().optional() }).passthrough(), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.number()])"'
        );
    });

    test("handles an array of types", () => {
        expect(
            getZodSchema({
                schema: {
                    anyOf: [
                        {
                            type: ["number", "boolean"],
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
            })
        ).toMatchInlineSnapshot(
            '"z.union([z.union([z.number(), z.boolean()]), z.object({ pet_type: z.enum(["Cat", "Dog"]), hunts: z.boolean().optional() }).passthrough(), z.string()])"'
        );
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

        expect(
            getZodSchema({
                schema: {
                    anyOf: [{ $ref: "#/components/schemas/PetByAge" }, { $ref: "#/components/schemas/PetByType" }],
                },
                ctx,
            })
        ).toMatchInlineSnapshot('"z.union([PetByAge.passthrough(), PetByType.passthrough()])"');
    });
});

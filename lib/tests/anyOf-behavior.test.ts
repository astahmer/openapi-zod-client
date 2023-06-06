import { test, expect } from "vitest";
import { getZodSchema } from "../src/openApiToZod";

test("anyOf-matches-json-schema", () => {
    // handle objects
    expect(
        getZodSchema({
            // @see: https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/#anyof
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

    // handle primitives
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

    // handle `type` being an array
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

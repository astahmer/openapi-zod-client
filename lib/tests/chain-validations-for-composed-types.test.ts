import { describe, expect, test } from "vitest";
import type { SchemaObject } from "openapi3-ts";

import { type CodeMetaData, getZodSchema } from "../src";

const makeSchema = (schema: SchemaObject) => schema;
const getSchemaAsZodString = (schema: SchemaObject, meta?: CodeMetaData | undefined) =>
    getZodSchema({ schema: makeSchema(schema), meta }).toString();

describe("chain-validations-for-composed-types", () => {
    // oneOf and anyOf generate identical zod schemas, with the exception
    // of discriminated unions
    describe.each([
        ['oneOf'],
        ['anyOf']
    ])(`%s`, (keyword) => {
        test('string validations', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                {
                                    type: "string",
                                    minLength: 1,
                                    maxLength: 50,
                                    pattern: '[AB]*',
                                },
                                {
                                    type: "string",
                                    format: "email",
                                    default: "test@email.com",
                                },
                            ]
                        },
                    },
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.union([z.string().min(1).max(50).regex(/[AB]*/), z.string().email().default("test@email.com")]) }).partial().passthrough()"');
        });

        test('string enum', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                {
                                    type: "string",
                                    minLength: 1,
                                    maxLength: 50,
                                    pattern: '[AB]*',
                                },
                                {
                                    type: "string",
                                    enum: ["value1", "value2"]
                                },
                            ]
                        },
                    },
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.union([z.string().min(1).max(50).regex(/[AB]*/), z.enum(["value1", "value2"])]) }).partial().passthrough()"');
        });

        test('number validations', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                {
                                    type: "integer",
                                    minimum: 1,
                                    maximum: 5,
                                    exclusiveMinimum: true,
                                    exclusiveMaximum: true,
                                },
                                {
                                    type: "number",
                                    minimum: 10,
                                    maximum: 30,
                                    multipleOf: 10,
                                    default: 10
                                },
                            ]
                        },
                    },
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.union([z.number().int().gt(1).lt(5), z.number().gte(10).lte(30).multipleOf(10).default(10)]) }).partial().passthrough()"');
        });

        test('nullable validation', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                { type: "string", minLength: 1 },
                                { type: "integer", nullable: true }
                            ]
                        },
                    },
                    required: ['union']
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.union([z.string().min(1), z.number().int().nullable()]) }).passthrough()"');
        });

        test('array validation', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        minLength: 1,
                                    },
                                    minItems: 1,
                                    maxItems: 5
                                },
                                { type: "integer" }
                            ]
                        },
                    },
                    required: ['union']
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.union([z.array(z.string().min(1)).min(1).max(5), z.number().int()]) }).passthrough()"');
        });

        test('single union item', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                { type: "string", minLength: 1, nullable: true },
                            ]
                        },
                    },
                    required: ['union']
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.string().min(1).nullable() }).passthrough()"');
        });

        test('object union', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        union: {
                            [keyword]: [
                                {
                                    type: "object",
                                    properties: {
                                        nest1: {
                                            type: "string",
                                            minLength: 1,
                                            nullable: true,
                                        }
                                    }
                                },
                                {
                                    type: "object",
                                    properties: {
                                        nest2: {
                                            type: "integer",
                                            nullable: true,
                                        }
                                    },
                                    required: ["nest2"],
                                }
                            ]
                        },
                    },
                    required: ['union']
                })
            ).toMatchInlineSnapshot('"z.object({ union: z.union([z.object({ nest1: z.string().min(1).nullable() }).partial().passthrough(), z.object({ nest2: z.number().int().nullable() }).passthrough()]) }).passthrough()"');
        });
    });

    test('oneOf: discriminated union', () => {
        console.log(getSchemaAsZodString({
                type: "object",
                properties: {
                    union: {
                        oneOf: [
                            {
                                type: "object",
                                properties: {
                                    prop1: {
                                        type: "string",
                                        minLength: 1,
                                    },
                                    discriminator: {
                                        type: "string",
                                    }
                                },
                                required: ["prop1", "discriminator"],
                            },
                            {
                                type: "object",
                                properties: {
                                    prop2: {
                                        type: "string",
                                        minLength: 5,
                                    },
                                    discriminator: {
                                        type: "string",
                                    }
                                },
                                required: ["prop2", "discriminator"],
                            },
                        ],
                        discriminator: { propertyName: "discriminator" }
                    },
                },
            }));
        console.log(`z.object({ union:  
                z.discriminatedUnion("discriminator", [z.object({ prop1: z.string().min(1), discriminator: z.string() }).passthrough(), z.object({ prop2: z.string().min(5), discriminator: z.string() }).passthrough()]) 
             }).partial().passthrough()`);
        expect(
            getSchemaAsZodString({
                type: "object",
                properties: {
                    union: {
                        oneOf: [
                            {
                                type: "object",
                                properties: {
                                    prop1: {
                                        type: "string",
                                        minLength: 1,
                                    },
                                    discriminator: {
                                        type: "string",
                                        enum: ["prop1-discriminator"],
                                    }
                                },
                                required: ["prop1", "discriminator"],
                            },
                            {
                                type: "object",
                                properties: {
                                    prop2: {
                                        type: "string",
                                        minLength: 5,
                                    },
                                    discriminator: {
                                        type: "string",
                                        enum: ["prop2-discriminator"],
                                    }
                                },
                                required: ["prop2", "discriminator"],
                            },
                        ],
                        discriminator: { propertyName: "discriminator" }
                    },
                },
            })
        ).toMatchInlineSnapshot(`
          "z.object({ union: 
                          z.discriminatedUnion("discriminator", [z.object({ prop1: z.string().min(1), discriminator: z.literal("prop1-discriminator") }).passthrough(), z.object({ prop2: z.string().min(5), discriminator: z.literal("prop2-discriminator") }).passthrough()])
                       }).partial().passthrough()"
        `);
    });

    describe('allOf', () => {
        test('string validations', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        prop: {
                            allOf: [
                                {
                                    type: "string",
                                    minLength: 1,
                                    maxLength: 50,
                                    pattern: '[AB]*',
                                },
                                {
                                    type: "string",
                                    format: "email",
                                    default: "test@email.com",
                                },
                            ]
                        },
                    },
                })
            ).toMatchInlineSnapshot('"z.object({ prop: z.string().min(1).max(50).regex(/[AB]*/).and(z.string().email().default("test@email.com")) }).partial().passthrough()"');
        });

        test('number validations', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        prop: {
                            allOf: [
                                {
                                    type: "integer",
                                    minimum: 1,
                                    maximum: 5,
                                    exclusiveMinimum: true,
                                    exclusiveMaximum: true,
                                },
                                {
                                    type: "number",
                                    minimum: 10,
                                    maximum: 30,
                                    multipleOf: 10,
                                    default: 10
                                },
                            ]
                        },
                    },
                })
            ).toMatchInlineSnapshot('"z.object({ prop: z.number().int().gt(1).lt(5).and(z.number().gte(10).lte(30).multipleOf(10).default(10)) }).partial().passthrough()"');
        });

        test('nullable validation', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        prop: {
                            allOf: [
                                { type: "string", minLength: 1 },
                                { type: "integer", nullable: true }
                            ]
                        },
                    },
                    required: ['prop']
                })
            ).toMatchInlineSnapshot('"z.object({ prop: z.string().min(1).and(z.number().int().nullable()) }).passthrough()"');
        });

        test('array validation', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        prop: {
                            allOf: [
                                {
                                    type: "array",
                                    items: {
                                        type: "string",
                                        minLength: 1,
                                    },
                                    minItems: 1,
                                    maxItems: 5
                                },
                                { type: "integer" }
                            ]
                        },
                    },
                    required: ['prop']
                })
            ).toMatchInlineSnapshot('"z.object({ prop: z.array(z.string().min(1)).min(1).max(5).and(z.number().int()) }).passthrough()"');
        });

        test('single union item', () => {
            expect(
                getSchemaAsZodString({
                    type: "object",
                    properties: {
                        prop: {
                            allOf: [
                                {
                                    type: "string",
                                    minLength: 1,
                                    nullable: true
                                },
                            ]
                        },
                    },
                    required: ['prop']
                })
            ).toMatchInlineSnapshot('"z.object({ prop: z.string().min(1).nullable() }).passthrough()"');
        });
    });
});
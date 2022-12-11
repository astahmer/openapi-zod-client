import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("validations", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    strWithLength: { type: "string", minLength: 3, maxLength: 3 },
                    strWithMin: { type: "string", minLength: 3 },
                    strWithMax: { type: "string", maxLength: 3 },
                    strWithPattern: { type: "string", pattern: "/^[a-z]+$/" },
                    email: { type: "string", format: "email" },
                    hostname: { type: "string", format: "hostname" },
                    url: { type: "string", format: "uri" },
                    uuid: { type: "string", format: "uuid" },
                    //
                    number: { type: "number" },
                    int: { type: "integer" },
                    intWithMin: { type: "integer", minimum: 3 },
                    intWithMax: { type: "integer", maximum: 3 },
                    intWithMinAndMax: { type: "integer", minimum: 3, maximum: 3 },
                    intWithExclusiveMinBool: { type: "integer", minimum: 3, exclusiveMinimum: true },
                    intWithExclusiveMin: { type: "integer", exclusiveMinimum: 3 },
                    intWithExclusiveMaxBool: { type: "integer", maximum: 3, exclusiveMaximum: true },
                    intWithExclusiveMax: { type: "integer", maximum: 3, exclusiveMaximum: 3 },
                    intWithMultipleOf: { type: "integer", multipleOf: 3 },
                    //
                    bool: { type: "boolean" },
                    //
                    array: { type: "array", items: { type: "string" } },
                    arrayWithMin: { type: "array", items: { type: "string" }, minItems: 3 },
                    arrayWithMax: { type: "array", items: { type: "string" }, maxItems: 3 },
                    // TODO ?
                    // arrayWithUnique: { type: "array", items: { type: "string" }, uniqueItems: true },
                    //
                    object: { type: "object", properties: { str: { type: "string" } } },
                    objectWithRequired: { type: "object", properties: { str: { type: "string" } }, required: ["str"] },
                    // TODO ?
                    // objectWithMin: { type: "object", properties: { str: { type: "string" } }, minProperties: 3 },
                    // objectWithMax: { type: "object", properties: { str: { type: "string" } }, maxProperties: 3 },
                    //
                    oneOf: { oneOf: [{ type: "string" }, { type: "number" }] },
                    anyOf: { anyOf: [{ type: "string" }, { type: "number" }] },
                    allOf: { allOf: [{ type: "string" }, { type: "number" }] },
                    nested: {
                        additionalProperties: { type: "number" },
                    },
                },
            },
            options: {
                withImplicitRequiredProps: true,
            },
        })
    ).toMatchInlineSnapshot(
        '"z.object({ str: z.string(), strWithLength: z.string().min(3).max(3), strWithMin: z.string().min(3), strWithMax: z.string().max(3), strWithPattern: z.string().regex(/^[a-z]+$/), email: z.string().email(), hostname: z.string().url(), url: z.string().url(), uuid: z.string().uuid(), number: z.number(), int: z.number().int(), intWithMin: z.number().int().gte(3), intWithMax: z.number().int().lte(3), intWithMinAndMax: z.number().int().gte(3).lte(3), intWithExclusiveMinBool: z.number().int().gt(3), intWithExclusiveMin: z.number().int().gt(3), intWithExclusiveMaxBool: z.number().int().lt(3), intWithExclusiveMax: z.number().int().lt(3), intWithMultipleOf: z.number().int().multipleOf(3), bool: z.boolean(), array: z.array(z.string()), arrayWithMin: z.array(z.string()).min(3), arrayWithMax: z.array(z.string()).max(3), object: z.object({ str: z.string() }), objectWithRequired: z.object({ str: z.string() }), oneOf: z.union([z.string(), z.number()]), anyOf: z.union([z.union([z.string(), z.number()]), z.array(z.union([z.string(), z.number()]))]), allOf: z.string().and(z.number()), nested: z.record(z.number()) })"'
    );
});

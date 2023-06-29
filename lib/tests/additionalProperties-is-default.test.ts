import { describe, expect, test } from "vitest";
import { getZodSchema } from "../src";

// see: https://swagger.io/docs/specification/data-models/data-types/#free-form
describe("additional-properties", () => {
    test("plain free-form object", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
            },
        });

        expect(schema).toMatchInlineSnapshot('"z.object({}).partial().passthrough()"');
    });

    test("additionalProperties is true", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
                additionalProperties: true,
            },
        });

        expect(schema).toMatchInlineSnapshot('"z.object({}).partial().passthrough()"');
    });

    test("additionalProperties is empty object", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
                // empty object is equivalent to true according to swagger docs above
                additionalProperties: {},
            },
        });

        expect(schema).toMatchInlineSnapshot('"z.object({}).partial().passthrough()"');
    });

    test("additional properties opt-out", () => {
        const additionalPropertiesOptOut = getZodSchema({
            schema: {
                type: "object",
                additionalProperties: false,
            },
        });

        expect(additionalPropertiesOptOut).toMatchInlineSnapshot('"z.object({}).partial()"');
    });

    test("object with some properties", () => {
        const schema = getZodSchema({
            schema: {
                type: "object",
                properties: {
                    foo: { type: "string" },
                    bar: { type: "number" },
                },
            },
        });

        expect(schema).toMatchInlineSnapshot(
            '"z.object({ foo: z.string(), bar: z.number() }).partial().passthrough()"'
        );
    });
});

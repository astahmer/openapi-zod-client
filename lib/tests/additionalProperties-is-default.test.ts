import { describe, expect, test } from "vitest";
import { getZodSchema } from "../src";

// see: https://swagger.io/docs/specification/data-models/data-types/#free-form
describe("additional-properties", () => {
    test("plain free-form object", () => {
        const additionalPropertiesByDefault = getZodSchema({
            schema: {
                type: "object",
            },
        });

        expect(additionalPropertiesByDefault).toMatchInlineSnapshot('"z.object({}).partial().passthrough()"');
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
        const additionalPropertiesByDefault = getZodSchema({
            schema: {
                type: "object",
                properties: {
                    foo: { type: "string" },
                    bar: { type: "number" },
                },
            },
        });

        expect(additionalPropertiesByDefault).toMatchInlineSnapshot(
            '"z.object({ foo: z.string(), bar: z.number() }).partial().passthrough()"'
        );
    });
});

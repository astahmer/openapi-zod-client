import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("withImplicitRequired-option", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nested: {
                        additionalProperties: { type: "number" },
                    },
                },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ str: z.string(), nested: z.record(z.number()) }).partial().passthrough()"');
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                    nested: {
                        additionalProperties: { type: "number" },
                    },
                },
            },
            options: {
                withImplicitRequiredProps: true,
            },
        })
    ).toMatchInlineSnapshot('"z.object({ str: z.string(), nested: z.record(z.number()) }).passthrough()"');
});

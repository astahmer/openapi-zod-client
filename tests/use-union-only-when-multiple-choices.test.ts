import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("use-union-only-when-multiple-choices", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    singleOneOf: { oneOf: [{ type: "string" }] },
                    multipleOneOf: { oneOf: [{ type: "string" }, { type: "number" }] },
                    //
                    singleAnyOf: { anyOf: [{ type: "string" }] },
                    multipleAnyOf: { anyOf: [{ type: "string" }, { type: "number" }] },
                    //
                    singleAllOf: { allOf: [{ type: "string" }] },
                    multipleAllOf: { allOf: [{ type: "string" }, { type: "number" }] },
                },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ singleOneOf: z.string().optional(), multipleOneOf: z.union([z.string().optional(), z.number().optional()]), singleAnyOf: z.string().optional(), multipleAnyOf: z.union([z.union([z.string().optional(), z.number().optional()]), z.array(z.union([z.string().optional(), z.number().optional()]))]), singleAllOf: z.string().optional(), multipleAllOf: z.string().optional().and(z.number().optional()) }).partial().optional()"');
});

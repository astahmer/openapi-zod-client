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
    ).toMatchInlineSnapshot('"z.object({ singleOneOf: z.string(), multipleOneOf: z.union([z.string(), z.number()]), singleAnyOf: z.string(), multipleAnyOf: z.union([z.string(), z.number()]), singleAllOf: z.string(), multipleAllOf: z.string().and(z.number()) }).partial()"');
});

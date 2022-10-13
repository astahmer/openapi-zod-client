import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("infer-as-object-when-only-properties-set", () => {
    expect(
        getZodSchema({
            schema: {
                properties: {
                    str: { type: "string" },
                    nested: {
                        additionalProperties: { type: "number" },
                    },
                },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ str: z.string(), nested: z.record(z.number()) }).partial()"');
});

import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("kebab-case-in-props", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    lowercase: { type: "string" },
                    "kebab-case": { type: "number" },
                },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ lowercase: z.string(), kebab_case: z.number() }).partial()"');
});

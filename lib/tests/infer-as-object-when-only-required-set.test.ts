import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("infer-as-object-when-only-required-set", () => {
    expect(
        getZodSchema({
            schema: {
                required: ['name', 'email'],
            },
        })
    ).toMatchInlineSnapshot('"z.object({}).and(z.object({ name: z.unknown(), email: z.unknown() })).passthrough()"');
});

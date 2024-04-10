import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("add-nullish-to-optional", () => {
    expect(
        getZodSchema({
            schema: {
                properties: {
                    name: {
                        type: "string",
                    },
                    email: {
                        type: "string",
                    },
                },
            },
            options: {
                addNullishToPartial: true,
            },
        })
    ).toMatchInlineSnapshot('"z.object({ name: z.string().nullish(), email: z.string().nullish() }).partial().passthrough()"');
});

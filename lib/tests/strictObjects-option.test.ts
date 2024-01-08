import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("strictObjects-option", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
        })
    ).toMatchInlineSnapshot('"z.object({ str: z.string() }).partial().passthrough()"');
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    str: { type: "string" },
                },
            },
            options: {
                strictObjects: true,
            },
        })
    ).toMatchInlineSnapshot('"z.object({ str: z.string() }).partial().strict().passthrough()"');
});

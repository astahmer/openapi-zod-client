import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("required-additional-props-not-in-properties", () => {
    expect(
        getZodSchema({
            schema: {
                properties: {
                    name: {
                        type: "string"
                    },
                    email: {
                        type: "string"
                    },
                },
                required: ['name', 'email', 'phone'],
            },
        })
    ).toMatchInlineSnapshot('"z.object({ name: z.string(), email: z.string() }).passthrough()"');
});

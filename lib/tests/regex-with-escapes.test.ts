import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("regex-with-escapes", () => {
    expect(
        getZodSchema({schema: {
            type: "object",
            properties: {
                str: { 
                    type: "string",
                    pattern: "^\/$"
                },
            }
        }})
    ).toMatchInlineSnapshot(
        '"z.object({ str: z.string().regex(/^\\/$/) }).partial().passthrough()"'
    );
});

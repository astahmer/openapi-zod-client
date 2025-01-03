import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("use-literal-for-single-variant-enum-string", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    status: {
                        default: "error",
                        enum: ["error"],
                        title: "Status",
                        type: "string",
                    }
                }
            },
        })
    ).toMatchInlineSnapshot('"z.object({ status: z.literal(\"error\").default(\"error\") }).partial().passthrough()"');
});

test("use-literal-for-const-string", () => {
    expect(
        getZodSchema({
            schema: {
                type: "object",
                properties: {
                    status: {
                        const: "error",
                        default: "error",
                        title: "Status",
                        type: "string",
                    }
                }
            },
        })
    ).toMatchInlineSnapshot('"z.object({ status: z.literal(\"error\").default(\"error\") }).partial().passthrough()"');
});

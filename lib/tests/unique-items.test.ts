import { getZodSchema } from "../src/openApiToZod";
import { test, expect } from "vitest";

test("uniqueItems validation", () => {
    // Test basic uniqueItems on string array
    expect(
        getZodSchema({
            schema: {
                type: "array",
                items: { type: "string" },
                uniqueItems: true
            }
        }).toString()
    ).toMatchInlineSnapshot(
        '"z.array(z.string()).refine((arr) => { const unique: any[] = []; for (const item of arr) { if (unique.some(u => isEqual(u, item))) { return false; } unique.push(item); } return true; }, { message: "Items must be unique" })"'
    );

    // Test array without uniqueItems (should not have refine)
    expect(
        getZodSchema({
            schema: {
                type: "array",
                items: { type: "string" }
            }
        }).toString()
    ).toMatchInlineSnapshot(
        '"z.array(z.string())"'
    );

    // Test uniqueItems: false (should not have refine)
    expect(
        getZodSchema({
            schema: {
                type: "array",
                items: { type: "string" },
                uniqueItems: false
            }
        }).toString()
    ).toMatchInlineSnapshot(
        '"z.array(z.string())"'
    );

    // Test uniqueItems with minItems and maxItems (proper order)
    expect(
        getZodSchema({
            schema: {
                type: "array",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5,
                uniqueItems: true
            }
        }).toString()
    ).toMatchInlineSnapshot(
        '"z.array(z.string()).min(2).max(5).refine((arr) => { const unique: any[] = []; for (const item of arr) { if (unique.some(u => isEqual(u, item))) { return false; } unique.push(item); } return true; }, { message: "Items must be unique" })"'
    );
});

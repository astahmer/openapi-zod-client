import { getZodSchema } from "../src";
import { expect, test } from "vitest";
import { getZodChain } from "../src/openApiToZod";
import { SchemaObject } from "openapi3-ts";

test("invalid-pattern-regex", () => {
    const invalidSchema: SchemaObject = {
        type: "string",
        pattern: "[0-9]+",
    };
    const schema: SchemaObject = {
        type: "string",
        pattern: "/[0-9]+/",
    };
    expect(getZodSchema({ schema: schema }) + getZodChain(schema)).toMatchInlineSnapshot(
        '"z.string().regex(/[0-9]+/).optional()"'
    );
    expect(getZodSchema({ schema: invalidSchema }) + getZodChain(invalidSchema)).toMatchInlineSnapshot(
        '"z.string().regex(/[0-9]+/).optional()"'
    );
});

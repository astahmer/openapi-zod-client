import { getZodSchema } from "../src";
import { expect, test } from "vitest";
import { getZodChain } from "../src/openApiToZod";
import { SchemaObject } from "openapi3-ts/oas31";

test("invalid-pattern-regex", () => {
    const invalidSchema: SchemaObject = {
        type: "string",
        pattern: "[0-9]+",
    };
    const schema: SchemaObject = {
        type: "string",
        pattern: "/[0-9]+/",
    };
    const controlCharacters: SchemaObject = {
        type: "string",
        pattern:
            "/[\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x7f\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\uFFFE\uFFFF]+/",
    };
    expect(getZodSchema({ schema: schema }) + getZodChain({ schema })).toMatchInlineSnapshot(
        '"z.string().regex(/[0-9]+/).optional()"'
    );
    expect(getZodSchema({ schema: invalidSchema }) + getZodChain({ schema: invalidSchema })).toMatchInlineSnapshot(
        '"z.string().regex(/[0-9]+/).optional()"'
    );
    expect(
        getZodSchema({ schema: controlCharacters }) + getZodChain({ schema: controlCharacters })
    ).toMatchInlineSnapshot(
        '"z.string().regex(/[\\x01\\x02\\x03\\x04\\x05\\x06\\x07\\x08\\t\\n\\x0b\\x0c\\r\\x0e\\x0f\\x10\\x11\\x12\\x13\\x14\\x15\\x16\\x17\\x18\\x19\\x1a\\x1b\\x1c\\x1d\\x1e\\x1f\\x7f\\x80\\x81\\x82\\x83\\x84\\x85\\x86\\x87\\x88\\x89\\x8a\\x8b\\x8c\\x8d\\x8e\\x8f\\x90\\x91\\x92\\x93\\x94\\x95\\x96\\x97\\x98\\x99\\x9a\\x9b\\x9c\\x9d\\x9e\\x9f\\ufffe\\uffff]+/).optional()"'
    );
});

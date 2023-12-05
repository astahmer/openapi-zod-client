import { describe, test, expect } from "vitest";
import { toBoolean } from "../src/utils";

describe("toBoolean", () => {
  test("returns boolean true, when string value 'true'", () => {
    expect(toBoolean("true", false)).toEqual(true);
  });

  test("returns boolean false, when string value 'false'", () => {
    expect(toBoolean("false", true)).toEqual(false);
  });

  test("returns default boolean value, when empty string is present", () => {
    expect(toBoolean("", true)).toEqual(true);
    expect(toBoolean("", false)).toEqual(false);
  });

  test("returns default boolean value, when undefined", () => {
    expect(toBoolean(undefined, true)).toEqual(true);
    expect(toBoolean(undefined, false)).toEqual(false);
  });
});

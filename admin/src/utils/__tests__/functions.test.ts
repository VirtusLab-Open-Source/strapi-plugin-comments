import { assertNonEmpty, assertString } from "../functions";

describe("assertString()", () => {
  it("should allow strings", () => {
    expect(() => assertString("Content")).not.toThrow();
  });

  it("should reject everything that is not a string", () => {
    expect(() => assertString(1)).toThrow();
    expect(() => assertString(null)).toThrow();
    expect(() => assertString(undefined)).toThrow();
    expect(() => assertString({})).toThrow();
    expect(() => assertString(new Error("Error"))).toThrow();
  });
});

describe("assertNonEmpty()", () => {
  it("should allow non-empty values", () => {
    expect(() => assertNonEmpty("Content")).not.toThrow();
  });

  it("should reject empty values", () => {
    expect(() => assertNonEmpty(null)).toThrow();
    expect(() => assertNonEmpty(undefined)).toThrow();
  });
});

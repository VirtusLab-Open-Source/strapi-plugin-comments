import { assertString } from "../functions";

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

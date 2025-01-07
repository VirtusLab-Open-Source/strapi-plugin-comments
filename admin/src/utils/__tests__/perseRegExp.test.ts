import parseRegExp from "../parseRegExp";

describe("parseRegExp()", () => {
  it("should parse regexp", () => {
    expect(parseRegExp("/[a-z]/gi")).toEqual({
      flags: "gi",
      value: "[a-z]",
    });
  });
});

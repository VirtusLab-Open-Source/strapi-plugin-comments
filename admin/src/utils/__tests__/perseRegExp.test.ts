import parseRegExp from "../parseRegExp";

describe("parseRegExp()", () => {
  it("should parse regexp", () => {
    expect(parseRegExp("/[a-z]/gi")).toMatchInlineSnapshot(`
      Object {
        "flags": "gi",
        "value": "[a-z]",
      }
    `);
  });
});

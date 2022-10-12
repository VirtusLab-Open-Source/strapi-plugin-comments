import getUrl from "../getUrl";

describe("getUrl()", () => {
  it("should return valid URL", () => {
    expect(getUrl("comments")).toMatchInlineSnapshot(
      `"/plugins/comments/comments"`
    );
    expect(getUrl(undefined)).toMatchInlineSnapshot(`"/plugins/comments/"`);
  });
});

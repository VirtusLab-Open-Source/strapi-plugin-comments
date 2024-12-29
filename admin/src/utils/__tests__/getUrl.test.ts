import getUrl from "../getUrl";

describe("getUrl()", () => {
  it("should return valid URL", () => {
    expect(getUrl("comments")).toEqual('/plugins/comments/comments');
    expect(getUrl(undefined)).toEqual('/plugins/comments/');
  });
});

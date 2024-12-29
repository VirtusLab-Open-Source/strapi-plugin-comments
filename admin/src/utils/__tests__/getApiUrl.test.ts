import getApiURL from "../getApiUrl";

describe("getApiURL()", () => {
  it("should return valid URL", () => {
    expect(getApiURL("comments")).toEqual('/comments/comments');
  });
});

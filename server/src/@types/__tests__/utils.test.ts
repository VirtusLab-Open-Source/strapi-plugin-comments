import { assertComment } from "../utils";

describe("Types", () => {
  describe("Utils", () => {
    describe("assertComment()", () => {
      it("should validate input", () => {
        expect(() => assertComment(undefined)).toThrow();
        expect(() => assertComment(null)).toThrow();
        expect(() => assertComment({})).toThrow();
        expect(() => assertComment({ id: 1, content: "A comment" })).not.toThrow();
      });
    });
  });
});

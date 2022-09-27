import { COMMENT_STATUS } from "../constants";
import resolveCommentStatus from "../resolveCommentStatus";

describe("resolveCommentStatus()", () => {
  it("should handle removed comments", () => {
    expect(
      resolveCommentStatus({
        removed: true,
      })
    ).toMatchInlineSnapshot(`"REMOVED"`);
  });
  it("should handle blocked comments", () => {
    expect(
      resolveCommentStatus({
        blocked: true,
      })
    ).toMatchInlineSnapshot(`"BLOCKED"`);
    expect(
      resolveCommentStatus({
        blockedThread: true,
      })
    ).toMatchInlineSnapshot(`"BLOCKED"`);
  });
  it.each(Object.values(COMMENT_STATUS))(
    "should handle %s comment's status",
    (approvalStatus) => {
      expect(
        resolveCommentStatus({
          approvalStatus,
        })
      ).toEqual(approvalStatus);
    }
  );
  it("should handle unknown status", () => {
    expect(
      resolveCommentStatus({
        approvalStatus: "FOO",
      })
    ).toMatchInlineSnapshot(`"UNKNOWN"`);
  });
  it("should handle review comment", () => {
    expect(
      resolveCommentStatus({ reviewFlowEnabled: true })
    ).toMatchInlineSnapshot(`"TO_REVIEW"`);
  });
  it("should empty input", () => {
    expect(resolveCommentStatus({})).toMatchInlineSnapshot(`"OPEN"`);
  });
});

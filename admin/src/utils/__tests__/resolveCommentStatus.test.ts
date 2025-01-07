import { COMMENT_STATUS } from '../constants';
import resolveCommentStatus from '../resolveCommentStatus';

describe('resolveCommentStatus()', () => {
  it('should handle removed comments', () => {
    expect(
      resolveCommentStatus({
        removed: true,
        blocked: false,
        blockedThread: false,
        approvalStatus: 'APPROVED',
      }),
    ).toEqual("REMOVED");
  });
  it('should handle blocked comments', () => {
    expect(
      resolveCommentStatus({
        blocked: true,
        removed: false,
        blockedThread: false,
        approvalStatus: 'APPROVED',
      }),
    ).toEqual("BLOCKED");
    expect(
      resolveCommentStatus({
        blockedThread: true,
        removed: false,
        blocked: false,
        approvalStatus: 'APPROVED',
      }),
    ).toEqual("BLOCKED");
  });
  it.each(Object.values(COMMENT_STATUS))(
    'should handle %s comment\'s status',
    (approvalStatus) => {
      expect(
        resolveCommentStatus({
          approvalStatus,
          blocked: false,
          blockedThread: false,
          removed: false,
        }),
      ).toEqual(approvalStatus);
    },
  );
  it('should handle unknown status', () => {
    expect(
      resolveCommentStatus({
        approvalStatus: 'FOO' as any,
        blocked: false,
        blockedThread: false,
        removed: false,
      }),
    ).toEqual("UNKNOWN");
  });
});

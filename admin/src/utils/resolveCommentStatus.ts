import { isNil } from "lodash";
import { Comment } from '../api/schemas';

import { COMMENT_STATUS } from "./constants";

type Config = Pick<Comment, 'removed' | 'blocked' | 'blockedThread' | 'approvalStatus'> & {
  reviewFlowEnabled?: boolean;
};

const resolveCommentStatus = ({
  removed,
  blocked,
  blockedThread,
  approvalStatus,
  reviewFlowEnabled,
}: Config): typeof COMMENT_STATUS[keyof typeof COMMENT_STATUS] => {
  const gotApprovalFlow = !isNil(approvalStatus);

  if (removed) {
    return COMMENT_STATUS.REMOVED;
  }

  if (blocked || blockedThread) {
    return COMMENT_STATUS.BLOCKED;
  }

  if (reviewFlowEnabled) {
    return COMMENT_STATUS.TO_REVIEW;
  }

  if (gotApprovalFlow) {
    const status = approvalStatus.toUpperCase();
    if (Object.keys(COMMENT_STATUS).includes(status)) {
      return status as keyof typeof COMMENT_STATUS;
    }
    return COMMENT_STATUS.UNKNOWN;
  }

  return COMMENT_STATUS.OPEN;
};

export default resolveCommentStatus;

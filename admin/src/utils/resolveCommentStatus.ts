import { isNil } from "lodash";
import { COMMENT_STATUS } from "./constants";

type Config = {
  removed?: boolean;
  blocked?: boolean;
  blockedThread?: boolean;
  approvalStatus?: string;
  reviewFlowEnabled?: boolean;
};

const resolveCommentStatus = ({
  removed,
  blocked,
  blockedThread,
  approvalStatus,
  reviewFlowEnabled,
}: Config) => {
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
      return status;
    }
    return COMMENT_STATUS.UNKNOWN;
  }

  return COMMENT_STATUS.OPEN;
};

export default resolveCommentStatus;

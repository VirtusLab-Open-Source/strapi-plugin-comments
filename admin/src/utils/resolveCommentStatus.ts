import { isNil } from "lodash";
import { ToBeFixed } from "../../../types";
import { COMMENT_STATUS } from "./constants";

const resolveCommentStatus = ({
  removed,
  blocked,
  blockedThread,
  approvalStatus,
  reviewFlowEnabled,
}: ToBeFixed) => {
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

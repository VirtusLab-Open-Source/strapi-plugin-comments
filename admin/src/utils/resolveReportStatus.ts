import {isNil} from 'lodash';
import {ToBeFixed} from '../../../server/src/@types';
import {REPORT_STATUS} from './constants';

const resolveReportStatus = ({
  resolved,
  related: {blocked, blockedThread},
  approvalStatus,
}: ToBeFixed) => {
  const gotApprovalFlow = !isNil(approvalStatus);

  if (blocked || blockedThread) {
    return REPORT_STATUS.BLOCKED;
  }

  if (resolved) {
    return REPORT_STATUS.RESOLVED;
  }

  if (gotApprovalFlow) {
    const status = approvalStatus.toUpperCase();
    if (Object.keys(REPORT_STATUS).includes(status)) {
      return status;
    }
    return REPORT_STATUS.PENDING;
  }

  return REPORT_STATUS.PENDING;
};

export default resolveReportStatus;

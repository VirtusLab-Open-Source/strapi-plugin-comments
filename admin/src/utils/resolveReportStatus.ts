import { isNil } from 'lodash';
import { Report } from '../api/schemas';
import { REPORT_STATUS } from './constants';

const resolveReportStatus = ({
  resolved,
  related: { blocked, blockedThread },
  approvalStatus,
}: Report): typeof REPORT_STATUS[keyof typeof REPORT_STATUS] => {
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
      return status as typeof REPORT_STATUS[keyof typeof REPORT_STATUS];
    }
    return REPORT_STATUS.PENDING;
  }

  return REPORT_STATUS.PENDING;
};

export default resolveReportStatus;

import { FC, useMemo } from 'react';
import { Report } from '../../api/schemas';
import { getMessage } from '../../utils';
import { REPORT_REASON } from '../../utils/constants';
import { StatusBadge } from '../StatusBadge';

const getColor = (reason: Report['reason']) => {
  switch (reason) {
    case REPORT_REASON.DISCRIMINATION:
      return 'danger';
    case REPORT_REASON.BAD_LANGUAGE:
      return 'warning';
    default:
      return 'neutral';
  }
};
export const ReportReasonBadge: FC<Pick<Report, 'reason'>> = ({ reason }) => {
  const color = useMemo(() => getColor(reason), [reason]);

  return (
    <StatusBadge
      backgroundColor={`${color}100`}
      textColor={`${color}600`}
      color={color}
    >
      {getMessage(
        `page.details.panel.discussion.warnings.reports.dialog.reason.${reason}`,
        reason,
      )}
    </StatusBadge>
  );
};
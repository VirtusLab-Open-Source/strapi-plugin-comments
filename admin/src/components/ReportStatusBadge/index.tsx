import { FC, useMemo } from 'react';
import { getMessage } from '../../utils';
import { REPORT_STATUS } from '../../utils/constants';
import { StatusBadge } from '../StatusBadge';

const getColor = (status: typeof REPORT_STATUS[keyof typeof REPORT_STATUS]) => {
  switch (status) {
    case REPORT_STATUS.RESOLVED:
      return 'success';
    case REPORT_STATUS.OPEN:
      return 'danger';
    default:
      return 'alternative';
  }
};

export const ReportStatusBadge: FC<{ resolved: boolean }> = ({ resolved }) => {
  const { color, status } = useMemo(() => {
    const status = resolved ? REPORT_STATUS.RESOLVED : REPORT_STATUS.OPEN;
    return { color: getColor(status), status };
  }, [resolved]);
  console.log('status', status);

  return (
    <StatusBadge
      backgroundColor={`${color}100`}
      textColor={`${color}600`}
      color={color}
    >
      {getMessage(
        `page.details.panel.discussion.warnings.reports.dialog.status.${status}`,
        status,
      )}
    </StatusBadge>
  );
};
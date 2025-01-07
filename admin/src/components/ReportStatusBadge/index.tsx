import { startCase } from 'lodash';
import { FC } from 'react';
import { Report } from '../../api/schemas';
import { resolveReportStatus, resolveReportStatusColor } from '../../utils';
import { StatusBadge } from '../StatusBadge';

export const ReportStatusBadge: FC<{ item: Report }> = ({ item }) => {
  const status = resolveReportStatus(item);
  const color = resolveReportStatusColor(status);

  return (
    <StatusBadge
      backgroundColor={`${color}100`}
      textColor={`${color}700`}
      color={color}
    >
      {startCase(status.toLowerCase())}
    </StatusBadge>
  );
};
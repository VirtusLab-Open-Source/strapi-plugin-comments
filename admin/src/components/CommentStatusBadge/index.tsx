import { FC } from 'react';
import { Comment } from '../../api/schemas';
import { getMessage, resolveCommentStatus, resolveCommentStatusColor } from '../../utils';
import { StatusBadge } from '../StatusBadge';

export const CommentStatusBadge: FC<{ item: Comment, canAccessReports: boolean; hasReports: boolean }> = ({ item, canAccessReports, hasReports }) => {
  const reviewFlowEnabled = canAccessReports && hasReports && !(item.blocked || item.blockedThread);
  const status = resolveCommentStatus({ ...item, reviewFlowEnabled });
  const color = resolveCommentStatusColor(status);
  const openReports = item.reports?.filter((_) => !_.resolved) ?? [];

  return (
    <StatusBadge
      backgroundColor={`${color}100`}
      textColor={`${color}700`}
      color={color}
    >
      {getMessage(
        {
          id: `page.common.item.status.${status}`,
          props: {
            count: openReports.length,
          },
        },
        status,
      )}
    </StatusBadge>
  )
};

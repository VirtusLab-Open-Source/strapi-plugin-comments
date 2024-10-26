import { FC } from 'react';
import { Comment } from '../../api/schemas';
import { resolveCommentStatus, resolveCommentStatusColor } from '../../utils';
import { StatusBadge } from '../StatusBadge';
import { startCase } from 'lodash';

export const CommentStatusBadge: FC<{ item: Comment, canAccessReports: boolean; hasReports: boolean }> = ({ item, canAccessReports, hasReports }) => {
  const reviewFlowEnabled = canAccessReports && hasReports && !(item.blocked || item.blockedThread);
  const status = resolveCommentStatus({ ...item, reviewFlowEnabled });
  const color = resolveCommentStatusColor(status);

  return (
    <StatusBadge
      backgroundColor={`${color}100`}
      textColor={`${color}700`}
      color={color}
    >
      {startCase(status.toLowerCase())}
    </StatusBadge>
  )
};
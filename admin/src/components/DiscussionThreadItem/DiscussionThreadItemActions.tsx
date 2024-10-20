import { useNotification } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { DiscussionThreadItemProps } from './props';

export const DiscussionThreadItemActions: FC<DiscussionThreadItemProps> = ({ item, pinned, preview }) => {
  const {
    id,
    blocked,
    removed,
    content,
    blockedThread,
    gotThread,
    // threadFirstItemId,
    reports = [],
    approvalStatus,
    author,
    isAdminComment,
  } = item;
  const { canModerate, canAccessReports, canReviewReports } = usePermissions();
  const [blockConfirmationVisible, setBlockConfirmationVisible] = useState(false);
  const [blockThreadConfirmationVisible, setBlockThreadConfirmationVisible] = useState(false);
  const [blockButtonsDisabled, setBlockButtonsDisabled] = useState(blockedThread);
  const [startThreadVisible, setStartThreadVisible] = useState(false);
  const [updateCommentVisible, setUpdateCommentVisible] = useState(false);

  const navigate = useNavigate()
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();



  return null;
};
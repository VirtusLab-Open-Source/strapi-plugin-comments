import { IconButton } from '@strapi/design-system';
import { Check, Cross } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useAPI } from '../../hooks/useAPI';
import { AllowedActions } from '../../types';
import { handleAPIError } from '../../utils';
import { pluginId } from '../../pluginId';

export const CustomApproveFlow: FC<{ id: number, canModerate: AllowedActions['canModerate'], canApprove: boolean, canReject: boolean, queryKey?: string[] }> = ({ id, canModerate, canApprove, canReject, queryKey }) => {
  const { toggleNotification } = useNotification();
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const apiClient = useAPI();
  const getScopedMessage = useCallback(
    (id: string, defaultMessage = '') =>
      formatMessage({
        id: `${pluginId}.${id}`,
        defaultMessage,
      }),
    [formatMessage]
  );
  const onSuccess = (messageId: string) => async () => {
    await queryClient.invalidateQueries({
      exact: false,
      queryKey,
    });
    toggleNotification({
      type: 'success',
      message: getScopedMessage(messageId),
    });
  };

  const onError = (err: Error) => {
    handleAPIError(err, toggleNotification);
  };

  const approveItemMutation = useMutation({
    mutationKey: ['approveItem', id],
    mutationFn: apiClient.comments.approve,
    onSuccess: onSuccess('page.details.actions.comment.approve.confirmation.success'),
    onError,
  });

  const handleApproveClick = () => {
    approveItemMutation.mutate(id);
  };

  const rejectItemMutation = useMutation({
    mutationKey: ['rejectItem', id],
    mutationFn: apiClient.comments.reject,
    onSuccess: onSuccess('page.details.actions.comment.reject.confirmation.success'),
    onError,
  });

  const handleRejectClick = () => {
    rejectItemMutation.mutate(id);
  };


  if (canModerate) {
    return (
      <>
        {
          canApprove &&
          <IconButton
            onClick={handleApproveClick}
            label={getScopedMessage('page.details.actions.comment.reports.approve', 'Approve')}
          >
            <Check />
          </IconButton>
        }
        {
          canReject &&
          <IconButton
            label={getScopedMessage('page.details.actions.comment.reports.reject', 'Reject')}
            onClick={handleRejectClick}
          >
            <Cross />
          </IconButton>
        }
      </>
    );
  }
  return null;
};

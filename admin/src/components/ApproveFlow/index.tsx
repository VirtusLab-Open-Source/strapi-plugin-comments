import { IconButton } from '@strapi/design-system';
import { Check, Cross } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { useIntl } from 'react-intl';
import { useAPI } from '../../hooks/useAPI';
import { pluginId } from '../../pluginId';
import { AllowedActions } from '../../types';
import { getMessage, handleAPIError } from '../../utils';

export const ApproveFlow: FC<{ id: number, canModerate: AllowedActions['canModerate'], queryKey?: string[] }> = ({ id, canModerate, queryKey }) => {
  const { toggleNotification } = useNotification();
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const apiClient = useAPI();
  const onSuccess = (message: string) => async () => {
    await queryClient.invalidateQueries({
      exact: false,
      queryKey,
    });
    toggleNotification({
      type: 'success',
      message: formatMessage({
        id: `${pluginId}.${message}`,
        defaultMessage: message,
      }),
    });
  };

  const onError = (err: Error) => {
    handleAPIError(err, toggleNotification);
  };

  const approveItemMutation = useMutation({
    mutationKey: ['approveItem', id],
    mutationFn: apiClient.comments.approve,
    onSuccess: onSuccess('success.approveItem'),
    onError,
  });

  const handleApproveClick = () => {
    approveItemMutation.mutate(id);
  };

  const rejectItemMutation = useMutation({
    mutationKey: ['rejectItem', id],
    mutationFn: apiClient.comments.reject,
    onSuccess: onSuccess('success.rejectItem'),
    onError,
  });

  const handleRejectClick = () => {
    rejectItemMutation.mutate(id);
  };


  if (canModerate) {
    return (
      <>
        <IconButton
          onClick={handleApproveClick}
            label={getMessage("page.details.actions.comment.reports.approve", "Approve")}
        >
          <Check />
        </IconButton>
        <IconButton
          label={getMessage("page.details.actions.comment.reports.reject", "Reject")}
          onClick={handleRejectClick}
        >
          <Cross />
        </IconButton>
      </>
    );
  }
  return null;
};

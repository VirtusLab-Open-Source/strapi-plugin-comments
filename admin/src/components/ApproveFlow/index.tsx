import { IconButton } from '@strapi/design-system';
import { Check, Cross } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { pluginId } from '../../pluginId';
import { AllowedActions } from '../../types';
import { handleAPIError } from '../../utils';

export const ApproveFlow: FC<{ id: number, canModerate: AllowedActions['canModerate'], queryToInvalidate?: string[] }> = ({ id, canModerate, queryToInvalidate }) => {
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const apiClient = useAPI();
  const onSuccess = (message: string) => () => {
    queryToInvalidate && queryClient.invalidateQueries({
      queryKey: queryToInvalidate,
    });
    toggleNotification({
      type: 'success',
      message: `${pluginId}.${message}`,
    });
  };

  const onError = (err: Error) => {
    handleAPIError(err, toggleNotification);
  };

  const approveItemMutation = useMutation({
    mutationKey: ['approveItem', id],
    mutationFn: () => apiClient.approveComment(id),
    onSuccess: onSuccess('success.approveItem'),
    onError,
  });

  const handleApproveClick = () => {
    approveItemMutation.mutate();
  };

  const rejectItemMutation = useMutation({
    mutationKey: ['rejectItem', id],
    mutationFn: () => apiClient.rejectComment(id),
    onSuccess: onSuccess('success.rejectItem'),
    onError,
  });

  const handleRejectClick = () => {
    rejectItemMutation.mutate();
  };


  if (canModerate) {
    return (
      <>
        <IconButton
          withTooltip={false}
          onClick={handleApproveClick}
          label="Approve"
        >
          <Check />
        </IconButton>
        <IconButton
          withTooltip={false}
          label="Reject"
          onClick={handleRejectClick}
        >
          <Cross />
        </IconButton>
      </>
    );
  }
  return null;
};
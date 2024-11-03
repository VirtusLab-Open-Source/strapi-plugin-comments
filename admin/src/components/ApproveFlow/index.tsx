import { IconButton } from '@strapi/design-system';
import { Check, Cross } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { pluginId } from '../../pluginId';
import { AllowedActions } from '../../types';
import { handleAPIError } from '../../utils';

export const ApproveFlow: FC<{ id: number, canModerate: AllowedActions['canModerate'], queryKey?: string[] }> = ({ id, canModerate, queryKey }) => {
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const apiClient = useAPI();
  const onSuccess = (message: string) => async () => {
    await queryClient.invalidateQueries({
      exact: false,
      queryKey,
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
          label="Approve"
        >
          <Check />
        </IconButton>
        <IconButton
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
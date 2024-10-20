import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAPI } from './useAPI';

type Keys = {
  blockItem: boolean;
  unBlockItem: boolean;
  blockThread: boolean;
  unblockItemThread: boolean;
  resolveAllAbuseReportsForComment: boolean;
  resolveAllAbuseReportsForThread: boolean;
  resolveMultipleReports: boolean;
  deleteItem: boolean;
};

type OnSuccessMutations = keyof {
  [K in keyof Keys as `${K}Success`]: Keys[K];
}
type OnErrorMutations = keyof {
  [K in keyof Keys as `${K}Error`]: Keys[K];
}

type CallbacksMutation = Partial<Record<OnSuccessMutations | OnErrorMutations, () => void>>;

export const useCommentMutation = (itemId: number | string, onSuccessMutation: CallbacksMutation = {}) => {
  const api = useAPI();

  const blockItemMutation = useMutation({
    mutationKey: ['blockItem', itemId],
    mutationFn: api.blockComment,
    onSuccess: onSuccessMutation.blockItemSuccess,
    onError: onSuccessMutation.blockItemError,
  });
  const unBlockItemMutation = useMutation({
    mutationKey: ['unBlockItem', itemId],
    mutationFn: api.unblockComment,
    onSuccess: onSuccessMutation.unBlockItemSuccess,
    onError: onSuccessMutation.unBlockItemError,
  });
  const blockThreadMutation = useMutation({
    mutationKey: ['blockThread', itemId],
    mutationFn: api.blockThread,
    onSuccess: onSuccessMutation.blockThreadSuccess,
    onError: onSuccessMutation.blockThreadError,
  });
  const unblockItemThreadMutation = useMutation({
    mutationKey: ['unblockItemThread', itemId],
    mutationFn: api.unBlockThread,
    onSuccess: onSuccessMutation.unblockItemThreadSuccess,
    onError: onSuccessMutation.unblockItemThreadError,
  });

  const resolveAllAbuseReportsForCommentMutation = useMutation({
    mutationKey: ['resolveAllAbuseReportsForComment', itemId],
    mutationFn: api.resolveAllAbuseReportsForComment,
    onSuccess: onSuccessMutation.resolveAllAbuseReportsForCommentSuccess,
    onError: onSuccessMutation.resolveAllAbuseReportsForCommentError,
  });
  const resolveAllAbuseReportsForThreadMutation = useMutation({
    mutationKey: ['resolveAllAbuseReportsForThread', itemId],
    mutationFn: api.resolveAllAbuseReportsForThread,
    onSuccess: onSuccessMutation.resolveAllAbuseReportsForThreadSuccess,
    onError: onSuccessMutation.resolveAllAbuseReportsForThreadError,
  });

  const resolveMultipleReportsMutation = useMutation({
    mutationKey: ['resolveMultipleReports', itemId],
    mutationFn: api.resolveMultipleReports,
    onSuccess: onSuccessMutation.resolveMultipleReportsSuccess,
    onError: onSuccessMutation.resolveMultipleReportsError,
  });

  const deleteItemMutation = useMutation({
    mutationKey: ['deleteItem', itemId],
    mutationFn: api.deleteItem,
    onSuccess: onSuccessMutation.deleteItemSuccess,
    onError: onSuccessMutation.deleteItemError,
  });

  return useMemo(() => ({
    blockItemMutation,
    unBlockItemMutation,
    blockThreadMutation,
    unblockItemThreadMutation,
    resolveMultipleReportsMutation,
    resolveAllAbuseReportsForCommentMutation,
    resolveAllAbuseReportsForThreadMutation,
    deleteItemMutation,
  }), [
    blockItemMutation,
    unBlockItemMutation,
    blockThreadMutation,
    unblockItemThreadMutation,
    resolveMultipleReportsMutation,
    resolveAllAbuseReportsForCommentMutation,
    resolveAllAbuseReportsForThreadMutation,
    deleteItemMutation,
  ]);
};
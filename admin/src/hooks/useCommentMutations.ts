import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAPI } from './useAPI';
import { usePermissions } from './usePermissions';

type MutationKey = {
  comment: {
    block: boolean;
    unBlock: boolean;
    blockThread: boolean;
    unBlockThread: boolean;
    delete: boolean;
    postComment: boolean;
  },
  report: {
    resolve: boolean;
    resolveMultiple: boolean;
    resolveAllAbuse: boolean;
    resolveAllAbuseThread: boolean;
    resolveCommentMultipleReports: boolean;
  }
}
type CallbacksMutation = {
  [K in keyof MutationKey]?: {
    [L in keyof MutationKey[K] as `${L & string}${'Success' | 'Error'}`]?: () => void;
  }
}

export const useCommentMutations = (callbacksMutation: CallbacksMutation = { comment: {}, report: {} }) => {
  const api = useAPI();
  const { canModerate } = usePermissions()
  const canExecuteMutations = <T>(mutation: T)=> canModerate ? mutation : undefined;
  // Comments
  const blockItemMutation = useMutation({
    mutationFn: canExecuteMutations(api.comments.block),
    onSuccess: callbacksMutation.comment?.blockSuccess,
    onError: callbacksMutation.comment?.blockError,
  });

  const unBlockItemMutation = useMutation({
    mutationFn: canExecuteMutations(api.comments.unblock),
    onSuccess: callbacksMutation.comment?.unBlockSuccess,
    onError: callbacksMutation.comment?.unBlockError,
  });

  const blockThreadMutation = useMutation({
    mutationFn: canExecuteMutations(api.comments.blockThread),
    onSuccess: callbacksMutation.comment?.blockThreadSuccess,
    onError: callbacksMutation.comment?.blockThreadError,
  });

  const unblockItemThreadMutation = useMutation({
    mutationFn: canExecuteMutations(api.comments.unBlockThread),
    onSuccess: callbacksMutation.comment?.unBlockThreadSuccess,
    onError: callbacksMutation.comment?.unBlockThreadError,
  });

  const deleteItemMutation = useMutation({
    mutationFn: canExecuteMutations(api.comments.delete),
    onSuccess: callbacksMutation.comment?.deleteSuccess,
    onError: callbacksMutation.comment?.deleteError,
  });

  const postCommentMutation = useMutation({
    mutationFn: canExecuteMutations(api.comments.postComment),
    onSuccess: callbacksMutation.comment?.postCommentSuccess,
    onError: callbacksMutation.comment?.postCommentError,
  });
  // Reports
  const resolveMultipleReportsMutation = useMutation({
    mutationFn: canExecuteMutations(api.reports.resolveMultipleReports),
    onSuccess: callbacksMutation.report?.resolveMultipleSuccess,
    onError: callbacksMutation.report?.resolveMultipleError,
  });


  const resolveCommentMultipleReportsMutation = useMutation({
    mutationFn: canExecuteMutations(api.reports.resolveCommentMultipleReports),
    onSuccess: callbacksMutation.report?.resolveCommentMultipleReportsSuccess,
    onError: callbacksMutation.report?.resolveCommentMultipleReportsError,
  });

  const resolveReportMutation = useMutation({
    mutationFn: canExecuteMutations(api.reports.resolve),
    onSuccess: callbacksMutation.report?.resolveSuccess,
    onError: callbacksMutation.report?.resolveError,
  });

  const resolveAllAbuseReportsForCommentMutation = useMutation({
    mutationFn: canExecuteMutations(api.reports.resolveAllAbuseReportsForComment),
    onSuccess: callbacksMutation.report?.resolveAllAbuseSuccess,
    onError: callbacksMutation.report?.resolveAllAbuseError,
  });
  
  const resolveAllAbuseReportsForThreadMutation = useMutation({
    mutationFn: canExecuteMutations(api.reports.resolveAllAbuseReportsForThread),
    onSuccess: callbacksMutation.report?.resolveAllAbuseThreadSuccess,
    onError: callbacksMutation.report?.resolveAllAbuseThreadError,
  });


  return useMemo(() => ({
    commentMutation: {
      block: blockItemMutation,
      unBlock: unBlockItemMutation,
      blockThread: blockThreadMutation,
      unBlockThread: unblockItemThreadMutation,
      delete: deleteItemMutation,
      postComment: postCommentMutation,
    },
    reportMutation: {
      resolve: resolveReportMutation,
      resolveMultiple: resolveMultipleReportsMutation,
      resolveAllAbuse: resolveAllAbuseReportsForCommentMutation,
      resolveAllAbuseThread: resolveAllAbuseReportsForThreadMutation,
      resolveCommentMultipleReports: resolveCommentMultipleReportsMutation,
    },
  }), [
    blockItemMutation,
    unBlockItemMutation,
    blockThreadMutation,
    unblockItemThreadMutation,
    resolveMultipleReportsMutation,
    resolveAllAbuseReportsForCommentMutation,
    resolveAllAbuseReportsForThreadMutation,
    deleteItemMutation,
    resolveReportMutation,
  ]);
};

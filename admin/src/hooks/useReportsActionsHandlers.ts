// TODO
// @ts-nocheck
import { useCallback } from "react";

import { useMutation, useQueryClient } from "react-query";
import { useOverlayBlocker, useNotification } from "@strapi/helper-plugin";
import { handleAPIError } from "../utils";
import {
  blockItem,
  blockItemThread,
  resolveAllAbuseReportsForComment,
  resolveAllAbuseReportsForThread,
  unblockItem,
  unblockItemThread,
} from "../pages/utils/api";

const useReportsActionsHandlers = ({
  allowedActions,
  commentId,
  mutation,
  onSelectionChange,
  reports,
  selectedReports,
  updateReports,
}) => {
  const { canModerate, canReviewReports } = allowedActions;
    
  const { lockApp, unlockApp } = useOverlayBlocker();

  const queryClient = useQueryClient();
  const toggleNotification = useNotification();

  const onSuccess = async () => {
    await queryClient.invalidateQueries("get-data");
    unlockApp();
  };

  const onError = (err) => {
    handleAPIError(err, toggleNotification);
  };

  const mutationConfig = {
    onSuccess,
    onError,
    refetchActive: false,
  };

  const resolveAllAbuseReportsForCommentMutation = useMutation(
    resolveAllAbuseReportsForComment,
    mutationConfig,
  );

  const resolveAllAbuseReportsForThreadMutation = useMutation(
    resolveAllAbuseReportsForThread,
    mutationConfig,
  );

  const blockItemMutation = useMutation(blockItem, mutationConfig);

  const unblockItemMutation = useMutation(unblockItem, mutationConfig);

  const blockItemThreadMutation = useMutation(blockItemThread, mutationConfig);

  const unblockItemThreadMutation = useMutation(unblockItemThread, mutationConfig);

  const handleClickResolve = async (reportId) => {
    if (canReviewReports) {
      lockApp();
      const item = await mutation.mutateAsync({
        id: commentId,
        reportId,
      });
      if (item) {
        const updatedReports = reports.map((report) => ({
          ...report,
          resolved: reportId === report.id ? true : report.resolved,
        }));
        updateReports(updatedReports);
        onSelectionChange(selectedReports.filter((id) => id !== reportId));
      }
    }
  };

  const perform = (action: (id: number) => void) => (id: number) => {
    if (canModerate) {
      lockApp();
      action(id);
    }
  };

  const handleBlockItemClick = perform(blockItemMutation.mutate);

  const handleUnblockItemClick = perform(unblockItemMutation.mutate);

  const handleBlockItemThreadClick = perform(blockItemThreadMutation.mutate);

  const handleUnblockThreadClick = perform(unblockItemThreadMutation.mutate);

  const handleResolveAllAbuseReportsForComment = perform(
    resolveAllAbuseReportsForCommentMutation.mutate,
  );

  const handleResolveAllAbuseReportsForThread = perform(
    resolveAllAbuseReportsForThreadMutation.mutate,
  );

  return {
    handleBlockItemClick,
    handleBlockItemThreadClick,
    handleClickResolve,
    handleResolveAllAbuseReportsForComment,
    handleResolveAllAbuseReportsForThread,
    handleUnblockItemClick,
    handleUnblockThreadClick,
  };
};

export default useReportsActionsHandlers;

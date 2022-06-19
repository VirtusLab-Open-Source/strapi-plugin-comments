// @ts-nocheck

import React, { useCallback } from "react";

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

const useReportsActionsHandlers = (
  allowedActions,
  commentId,
  mutation,
  onSelectionChange,
  reports,
  selectedReports,
  updateReports,
) => {
  const { canModerate, canReviewReports } = allowedActions;

  const { lockApp, unlockApp } = useOverlayBlocker();

  const queryClient = useQueryClient();
  const toggleNotification = useNotification();

  const onSuccess =
    (stateAction = () => {}, indalidate = true) =>
    async () => {
      if (indalidate) {
        await queryClient.invalidateQueries("get-data");
      }
      stateAction(false);
      unlockApp();
    };

  const onError = useCallback(
    (err) => {
      handleAPIError(err, toggleNotification);
    },
    [toggleNotification],
  );

  const resolveAllAbuseReportsForCommentMutation = useMutation(
    resolveAllAbuseReportsForComment,
    {
      onSuccess: onSuccess(),
      onError,
      refetchActive: false,
    },
  );

  const resolveAllAbuseReportsForThreadMutation = useMutation(
    resolveAllAbuseReportsForThread,
    {
      onSuccess: onSuccess(),
      onError,
      refetchActive: false,
    },
  );

  const blockItemMutation = useMutation(blockItem, {
    onSuccess: onSuccess(),
    onError,
    refetchActive: false,
  });

  const unblockItemMutation = useMutation(unblockItem, {
    onSuccess: onSuccess(),
    onError,
    refetchActive: false,
  });

  const blockItemThreadMutation = useMutation(blockItemThread, {
    onSuccess: onSuccess(),
    onError,
    refetchActive: false,
  });
  const unblockItemThreadMutation = useMutation(unblockItemThread, {
    onSuccess: onSuccess(),
    onError,
    refetchActive: false,
  });

  const handleClickResolve = async (reportId) => {
    if (canReviewReports) {
      lockApp();
      const item = await mutation.mutateAsync({
        id: commentId,
        reportId,
      });
      if (item) {
        const updatedReports = reports.map((_) => ({
          ..._,
          resolved: reportId === _.id ? true : _.resolved,
        }));
        updateReports(updatedReports);
        onSelectionChange(selectedReports.filter((_) => _ !== reportId));
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

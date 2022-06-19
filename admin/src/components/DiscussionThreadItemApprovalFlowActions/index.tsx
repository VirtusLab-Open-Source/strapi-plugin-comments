/**
 *
 * Approval Flow Actions
 *
 */

// @ts-nocheck
import React from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "react-query";
import { IconButton } from "@strapi/design-system/IconButton";
import { check, cross } from "../icons";
import { useNotification, useOverlayBlocker } from "@strapi/helper-plugin";
import { getMessage, handleAPIError } from "../../utils";
import { approveItem, rejectItem } from "../../pages/utils/api";
import { pluginId } from "../../pluginId";

const DiscussionThreadItemApprovalFlowActions = ({
  id,
  allowedActions: { canModerate },
  queryToInvalidate,
}) => {
  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { lockApp, unlockApp } = useOverlayBlocker();

  const onSuccess = (message) => async () => {
    if (queryToInvalidate) {
      await queryClient.invalidateQueries(queryToInvalidate);
    }
    toggleNotification({
      type: "success",
      message: `${pluginId}.${message}`,
    });
    unlockApp();
  };

  const onError = (err) => {
    handleAPIError(err, toggleNotification);
  };

  const approveItemMutation = useMutation(approveItem, {
    onSuccess: onSuccess(
      "page.details.actions.comment.approve.confirmation.success"
    ),
    onError,
    refetchActive: false,
  });
  const rejectItemMutation = useMutation(rejectItem, {
    onSuccess: onSuccess(
      "page.details.actions.comment.reject.confirmation.success"
    ),
    onError,
    refetchActive: false,
  });

  const handleApproveClick = () => {
    if (canModerate) {
      lockApp();
      approveItemMutation.mutate(id);
    }
  };

  const handleRejectClick = () => {
    if (canModerate) {
      lockApp();
      rejectItemMutation.mutate(id);
    }
  };

  if (canModerate) {
    return (
      <>
        <IconButton
          icon={check}
          label={getMessage("page.details.actions.comment.approve", "Approve")}
          onClick={handleApproveClick}
        />
        <IconButton
          icon={cross}
          label={getMessage("page.details.actions.comment.reject", "Reject")}
          onClick={handleRejectClick}
        />
      </>
    );
  }
  return null;
};

DiscussionThreadItemApprovalFlowActions.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  queryToInvalidate: PropTypes.string,
  allowedActions: PropTypes.shape({
    canModerate: PropTypes.bool,
  }),
  wrapped: PropTypes.bool,
};

export default DiscussionThreadItemApprovalFlowActions;

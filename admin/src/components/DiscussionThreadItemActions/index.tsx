/**
 *
 * Entity Details
 *
 */

// @ts-nocheck
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import { isNil, isEmpty } from "lodash";
import { Flex } from "@strapi/design-system/Flex";
import { IconButton } from "@strapi/design-system/IconButton";
import { useNotification, useOverlayBlocker } from "@strapi/helper-plugin";
import { Eye } from "@strapi/icons";
import {
  getMessage,
  getUrl,
  handleAPIError,
  resolveCommentStatus,
  resolveCommentStatusColor,
} from "../../utils";
import { DiscussionThreadItemActionsWrapper } from "./styles";
import ConfirmationDialog from "../ConfirmationDialog";
import {
  blockItem,
  blockItemThread,
  unblockItem,
  unblockItemThread,
} from "../../pages/utils/api";
import { pluginId } from "../../pluginId";
import { LockIcon, UnlockIcon } from "../icons";
import DiscussionThreadItemApprovalFlowActions from "../DiscussionThreadItemApprovalFlowActions";
import StatusBadge from "../StatusBadge";
import { IconButtonGroupStyled } from "../IconButton/styles";
import { ActionButton } from "../ActionButton/styles";
import DiscussionThreadItemReviewAction from "../DiscussionThreadItemReviewAction";

const DiscussionThreadItemActions = ({
  allowedActions: { canModerate, canAccessReports, canReviewReports },
  ...item
}) => {
  const {
    id,
    blocked,
    removed,
    blockedThread,
    gotThread,
    threadItemsCount,
    threadFirstItemId,
    pinned,
    preview,
    reports = [],
    approvalStatus,
  } = item;

  const [blockConfirmationVisible, setBlockConfirmationVisible] =
    useState(false);
  const [blockThreadConfirmationVisible, setBlockThreadConfirmationVisible] =
    useState(false);
  const [blockButtonsDisabled, setBlockButtonsDisabled] =
    useState(blockedThread);

  const { push } = useHistory();
  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { lockApp, unlockApp } = useOverlayBlocker();

  const onSuccess =
    (message, stateAction = () => {}) =>
    async () => {
      await queryClient.invalidateQueries("get-details-data");
      toggleNotification({
        type: "success",
        message: `${pluginId}.${message}`,
      });
      stateAction(false);
      unlockApp();
    };

  const onError = (err) => {
    handleAPIError(err, toggleNotification);
  };

  const blockItemMutation = useMutation(blockItem, {
    onSuccess: onSuccess(
      "page.details.actions.comment.block.confirmation.success",
      setBlockConfirmationVisible
    ),
    onError,
    refetchActive: false,
  });
  const unblockItemMutation = useMutation(unblockItem, {
    onSuccess: onSuccess(
      "page.details.actions.comment.unblock.confirmation.success"
    ),
    onError,
    refetchActive: false,
  });
  const blockItemThreadMutation = useMutation(blockItemThread, {
    onSuccess: onSuccess(
      "page.details.actions.thread.block.confirmation.success",
      setBlockThreadConfirmationVisible
    ),
    onError,
    refetchActive: false,
  });
  const unblockItemThreadMutation = useMutation(unblockItemThread, {
    onSuccess: onSuccess(
      "page.details.actions.thread.unblock.confirmation.success"
    ),
    onError,
    refetchActive: false,
  });

  const gotApprovalFlow = !isNil(approvalStatus);
  const needsApproval = gotApprovalFlow && approvalStatus === "PENDING";
  const isBlocked = blocked || blockedThread;
  const isRejected = gotApprovalFlow && approvalStatus === "REJECTED";
  const openReports = reports?.filter((_) => !_.resolved);
  const hasReports = !isEmpty(openReports);
  const reviewFlowEnabled =
    (canAccessReports || canReviewReports) && hasReports;
  const hasActiveThread =
    gotThread && !(removed || preview || pinned || blockedThread);
  const isStatusBadgeVisible = isBlocked || reviewFlowEnabled;

  const renderStatus = (props) => {
    const status = resolveCommentStatus({ ...props, reviewFlowEnabled });
    const color = resolveCommentStatusColor(status);

    return (
      <StatusBadge
        backgroundColor={`${color}100`}
        textColor={`${color}700`}
        color={color}
      >
        {getMessage(
          {
            id: `page.common.item.status.${status}`,
            props: {
              count: openReports.length,
            },
          },
          status
        )}
      </StatusBadge>
    );
  };

  const handleBlockClick = () => setBlockConfirmationVisible(true);
  const handleBlockConfirm = async () => {
    if (canModerate) {
      lockApp();
      blockItemMutation.mutate(id);
    }
  };
  const handleBlockCancel = () => {
    setBlockConfirmationVisible(false);
  };
  const handleUnblockClick = async () => {
    if (canModerate) {
      lockApp();
      unblockItemMutation.mutate(id);
    }
  };

  const handleBlockThreadClick = () => setBlockThreadConfirmationVisible(true);
  const handleBlockThreadConfirm = async () => {
    if (canModerate) {
      lockApp();
      blockItemThreadMutation.mutate(id);
    }
  };
  const handleBlockThreadCancel = () => {
    setBlockThreadConfirmationVisible(false);
  };
  const handleUnblockThreadClick = async () => {
    if (canModerate) {
      lockApp();
      unblockItemThreadMutation.mutate(id);
    }
  };

  const handleDrilldownClick = () => {
    if (hasActiveThread) {
      push(getUrl(`discover/${threadFirstItemId}`));
    }
  };

  const handleBlockActionClick = async (mutation, onCallback) => {
    lockApp();
    await mutation.mutateAsync(id);
    onCallback();
  };

  const handleBlockButtonsStateChange = (disabled) =>
    setBlockButtonsDisabled(disabled);

  const anyGroupButtonsVisible =
    needsApproval || reviewFlowEnabled || !blockedThread;
  const isLoading =
    unblockItemMutation.isLoading ||
    blockItemMutation.isLoading ||
    blockItemThreadMutation.isLoading ||
    unblockItemThreadMutation.isLoading;

  if (removed || isRejected || !canModerate) {
    return (
      <DiscussionThreadItemActionsWrapper as={Flex} direction="row">
        {renderStatus(item)}
      </DiscussionThreadItemActionsWrapper>
    );
  }

  return (
    <>
      <DiscussionThreadItemActionsWrapper as={Flex} direction="row">
        {isStatusBadgeVisible && renderStatus(item)}
        {!blockedThread && (gotThread || pinned) && (
          <ActionButton
            onClick={handleBlockThreadClick}
            startIcon={<LockIcon />}
            loading={blockItemThreadMutation.isLoading}
            variant="danger"
          >
            {getMessage("page.details.actions.thread.block", "Block thread")}
          </ActionButton>
        )}
        {blockedThread && (gotThread || pinned) && (
          <ActionButton
            onClick={handleUnblockThreadClick}
            startIcon={<UnlockIcon />}
            loading={unblockItemThreadMutation.isLoading}
            variant="success"
          >
            {getMessage(
              "page.details.actions.thread.unblock",
              "Unblock thread"
            )}
          </ActionButton>
        )}
        {anyGroupButtonsVisible && (
          <IconButtonGroupStyled isSingle withMargin>
            {!blockedThread && !(blocked || needsApproval) && (
              <IconButton
                onClick={handleBlockClick}
                loading={blockItemMutation.isLoading}
                icon={<LockIcon />}
                label={getMessage(
                  "page.details.actions.comment.block",
                  "Block"
                )}
              />
            )}
            {!blockedThread && blocked && (
              <IconButton
                onClick={handleUnblockClick}
                loading={unblockItemMutation.isLoading}
                icon={<UnlockIcon />}
                label={getMessage(
                  "page.details.actions.comment.unblock",
                  "Unblock"
                )}
              />
            )}
            {needsApproval && (
              <DiscussionThreadItemApprovalFlowActions
                id={id}
                allowedActions={{ canModerate }}
                queryToInvalidate="get-details-data"
              />
            )}
            <DiscussionThreadItemReviewAction
              item={item}
              queryToInvalidate="get-details-data"
              areBlockButtonsDisabled={blockButtonsDisabled}
              isLoading={isLoading}
              allowedActions={{
                canModerate,
                canAccessReports,
                canReviewReports,
              }}
              blockItemMutation={blockItemMutation}
              blockItemThreadMutation={blockItemThreadMutation}
              onBlockButtonsStateChange={handleBlockButtonsStateChange}
              onBlockActionClick={handleBlockActionClick}
            />
          </IconButtonGroupStyled>
        )}
        {hasActiveThread && (
          <IconButtonGroupStyled isSingle withMargin>
            <IconButton
              onClick={handleDrilldownClick}
              icon={<Eye />}
              label={getMessage(
                "page.details.panel.discussion.nav.drilldown",
                "Drilldown thread"
              )}
              style={
                blocked && !blockedThread
                  ? { marginTop: "1px", marginRight: ".5rem" }
                  : {}
              }
            />
          </IconButtonGroupStyled>
        )}
      </DiscussionThreadItemActionsWrapper>
      {!blocked && (
        <ConfirmationDialog
          isVisible={blockConfirmationVisible}
          isActionAsync={blockItemMutation.isLoading}
          header={getMessage(
            "page.details.actions.comment.block.confirmation.header"
          )}
          labelConfirm={getMessage(
            "page.details.actions.comment.block.confirmation.button.confirm"
          )}
          iconConfirm={<LockIcon />}
          onConfirm={handleBlockConfirm}
          onCancel={handleBlockCancel}
        >
          {getMessage(
            "page.details.actions.comment.block.confirmation.description"
          )}
        </ConfirmationDialog>
      )}
      {!blockedThread && (
        <ConfirmationDialog
          isVisible={blockThreadConfirmationVisible}
          isActionAsync={blockItemThreadMutation.isLoading}
          header={getMessage(
            "page.details.actions.thread.block.confirmation.header"
          )}
          labelConfirm={getMessage(
            "page.details.actions.thread.block.confirmation.button.confirm"
          )}
          iconConfirm={<LockIcon />}
          onConfirm={handleBlockThreadConfirm}
          onCancel={handleBlockThreadCancel}
        >
          {getMessage(
            "page.details.actions.thread.block.confirmation.description"
          )}
        </ConfirmationDialog>
      )}
    </>
  );
};

DiscussionThreadItemActions.propTypes = {
  isRoot: PropTypes.bool,
  blocked: PropTypes.bool.isRequired,
  blockedThread: PropTypes.bool.isRequired,
  approvalStatus: PropTypes.oneOfType([
    PropTypes.nullable,
    PropTypes.oneOf(["PENDING", "APPROVED", "REJECTED"]),
  ]),
  allowedActions: PropTypes.shape({
    canModerate: PropTypes.bool,
  }),
};

export default DiscussionThreadItemActions;

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
import { Eye, Trash, Plus, Pencil } from "@strapi/icons";
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
  deleteItem
} from "../../pages/utils/api";
import { pluginId } from "../../pluginId";
import { LockIcon, UnlockIcon } from "../icons";
import DiscussionThreadItemApprovalFlowActions from "../DiscussionThreadItemApprovalFlowActions";
import StatusBadge from "../StatusBadge";
import { IconButtonGroupStyled } from "../IconButton/styles";
import { ActionButton } from "../ActionButton/styles";
import DiscussionThreadItemReviewAction from "../DiscussionThreadItemReviewAction";
// @ts-ignore
import { auth } from "@strapi/helper-plugin";
import { StrapiAdminUser } from "strapi-typed";
import ModeratorResponseModal from "../ModeratorResponseModal/ModeratorResponseModal";

const DiscussionThreadItemActions = ({
  allowedActions: { canModerate, canAccessReports, canReviewReports },
  ...item
}) => {
  const {
    id,
    blocked,
    removed,
    content,
    blockedThread,
    gotThread,
    threadItemsCount,
    threadFirstItemId,
    pinned,
    preview,
    reports = [],
    approvalStatus,
    author
  } = item;

  const user: StrapiAdminUser = auth.get('userInfo')

  const [blockConfirmationVisible, setBlockConfirmationVisible] =
    useState(false);
  const [blockThreadConfirmationVisible, setBlockThreadConfirmationVisible] =
    useState(false);
  const [blockButtonsDisabled, setBlockButtonsDisabled] =
    useState(blockedThread);
  const [startThreadVisible, setStartThreadVisible] =
    useState(false);
  
  const [updateCommentVisible, setUpdateCommentVisible] = 
    useState(false);

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
    onError
  });
  const unblockItemMutation = useMutation(unblockItem, {
    onSuccess: onSuccess(
      "page.details.actions.comment.unblock.confirmation.success"
    ),
    onError
  });
  const deleteItemMutation = useMutation(deleteItem, {
    onSuccess: onSuccess(
      "page.details.actions.comment.delete.confirmation.success"
    ),
    onError
  });
  const blockItemThreadMutation = useMutation(blockItemThread, {
    onSuccess: onSuccess(
      "page.details.actions.thread.block.confirmation.success",
      setBlockThreadConfirmationVisible
    ),
    onError
  });
  const unblockItemThreadMutation = useMutation(unblockItemThread, {
    onSuccess: onSuccess(
      "page.details.actions.thread.unblock.confirmation.success"
    ),
    onError
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
  const isAdminAuthor = user.id == author.id

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

  const handleDeleteClick = async () => {
    if (canModerate) {
      lockApp();
      deleteItemMutation.mutate(id);
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

  const handleStartThreadVisibility = () => {
    setStartThreadVisible(!startThreadVisible);
  }

  const handleUpdateCommentVisibility = () => {
    setUpdateCommentVisible(!updateCommentVisible);
  }

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
            {!blockedThread && !blocked && isAdminAuthor && (
              <IconButton
                onClick={handleDeleteClick}
                loading={unblockItemMutation.isLoading}
                icon={<Trash/>}
                label={getMessage(
                  "page.details.actions.comment.delete",
                  "Delete comment"
                )}
              />
            )}
            {isAdminAuthor && !isBlocked && <IconButton
                onClick={handleUpdateCommentVisibility}
                icon={<Pencil />}
                label={getMessage(
                  "page.details.actions.thread.modal.update.comment"
                )}
              />
            }
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
        <IconButtonGroupStyled>
           {!hasActiveThread && !pinned && (
            <IconButton
              onClick={handleStartThreadVisibility}
              icon={<Plus />}
              label={getMessage(
                "page.details.actions.thread.modal.start.thread"
              )}
            />
           )}
        </IconButtonGroupStyled>
      </DiscussionThreadItemActionsWrapper>
      {startThreadVisible && 
        <ModeratorResponseModal
          content=""
          id={id}
          title={getMessage(
            "page.details.actions.thread.modal.start.thread"
          )}
          onClose={handleStartThreadVisibility}
          >

        </ModeratorResponseModal>
      }
      {updateCommentVisible && 
        <ModeratorResponseModal
          content={content}
          id={id}
          title={getMessage(
            "page.details.actions.thread.modal.update.comment"
          )}
          onClose={handleUpdateCommentVisibility}
          >

        </ModeratorResponseModal>
      }
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

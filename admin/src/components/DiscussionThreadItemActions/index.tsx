/**
 *
 * Entity Details
 *
 */

// TODO;
// @ts-nocheck

import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "react-query";
import { useHistory } from "react-router-dom";
import { isNil, isEmpty, noop } from "lodash";
import { Flex } from "@strapi/design-system/Flex";
import { IconButton } from "@strapi/design-system/IconButton";
import { trash, pencil, plus } from "../../components/icons";
import { useNotification, useOverlayBlocker, auth } from "@strapi/helper-plugin";
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
  resolveAllAbuseReportsForThread,
  deleteItem
} from "../../pages/utils/api";
import { pluginId } from "../../pluginId";
import { lock, unlock, eye } from "../icons";
import DiscussionThreadItemApprovalFlowActions from "../DiscussionThreadItemApprovalFlowActions";
import StatusBadge from "../StatusBadge";
import { IconButtonGroupStyled } from "../IconButton/styles";
import { ActionButton } from "../ActionButton/styles";
import DiscussionThreadItemReviewAction from "../DiscussionThreadItemReviewAction";
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

  const onSuccess = (message, sideEffectCallback) => () => {
    queryClient.invalidateQueries("get-details-data");
    if (message) {
      toggleNotification({
        type: "success",
        message: `${pluginId}.${message}`,
      });
    }
    sideEffectCallback();
    unlockApp();
  };

  const onError = (err) => {
    handleAPIError(err, toggleNotification);
  };

  const mutationConfig = (message = "", sideEffectCallback = noop) => {
    return {
      onSuccess: onSuccess(message, sideEffectCallback),
      onError
    };
  };

  const resolveAllAbuseReportsForThreadMutation = useMutation(
    resolveAllAbuseReportsForThread, mutationConfig()
  );

  const blockItemMutation = useMutation(blockItem, mutationConfig("page.details.actions.comment.block.confirmation.success", setBlockConfirmationVisible));

  const unblockItemMutation = useMutation(unblockItem, mutationConfig("page.details.actions.comment.unblock.confirmation.success"));

  const blockItemThreadMutation = useMutation(blockItemThread, mutationConfig("page.details.actions.thread.block.confirmation.success", setBlockThreadConfirmationVisible));

  const unblockItemThreadMutation = useMutation(unblockItemThread, mutationConfig("page.details.actions.thread.unblock.confirmation.success"));

  const deleteItemMutation = useMutation(deleteItem, mutationConfig("page.details.actions.comment.delete.confirmation.success"));

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
  const isAdminAuthor = String(user.id) === author.id

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

  const isLoading =
    unblockItemMutation.isLoading ||
    blockItemMutation.isLoading ||
    blockItemThreadMutation.isLoading ||
    unblockItemThreadMutation.isLoading;

  const handleResolveAllAbuseReportsForThread = () => {
    if (canModerate) {
      lockApp();
      resolveAllAbuseReportsForThreadMutation.mutate(id);
    }
  };

  const handleBlockClick = () => setBlockConfirmationVisible(true);

  const handleBlockConfirm = () => {
    if (canModerate) {
      lockApp();
      blockItemMutation.mutate(id);
    }
  };

  const handleBlockCancel = () => {
    setBlockConfirmationVisible(false);
  };

  const handleUnblockClick = () => {
    if (canModerate) {
      lockApp();
      unblockItemMutation.mutate(id);
    }
  };

  const handleDeleteClick = () => {
    if (canModerate) {
      lockApp();
      deleteItemMutation.mutate(id);
    }
  };

  const handleBlockThreadClick = () => setBlockThreadConfirmationVisible(true);

  const handleBlockThreadConfirm = () => {
    if (canModerate) {
      lockApp();
      blockItemThreadMutation.mutate(id);
    }
  };
  const handleBlockThreadCancel = () => {
    setBlockThreadConfirmationVisible(false);
  };

  const toggleStartThreadVisibility = () => {
    setStartThreadVisible(!startThreadVisible);
  }

  const toggleUpdateCommentVisibility = () => {
    setUpdateCommentVisible(!updateCommentVisible);
  }

  const handleUnblockThreadClick = () => {
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

  const handleOnConfirm = useCallback(() => {
    handleBlockThreadConfirm(id);
    handleResolveAllAbuseReportsForThread(id);
  }, [handleBlockThreadConfirm, handleResolveAllAbuseReportsForThread]);

  const anyGroupButtonsVisible =
    needsApproval || reviewFlowEnabled || !blockedThread;


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
            startIcon={lock}
            loading={blockItemThreadMutation.isLoading}
            variant="danger"
          >
            {getMessage(
              "page.details.actions.thread.block", 
              "Block thread"
            )}
          </ActionButton>
        )}
        {blockedThread && (gotThread || pinned) && (
          <ActionButton
            onClick={handleUnblockThreadClick}
            startIcon={unlock}
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
                icon={lock}
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
                icon={unlock}
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
                loading={deleteItemMutation.isLoading}
                icon={trash}
                label={getMessage(
                  "page.details.actions.comment.delete",
                  "Delete comment"
                )}
              />
            )}
            {isAdminAuthor && !isBlocked && ( 
              <IconButton
                onClick={toggleUpdateCommentVisibility}
                icon={pencil}
                label={getMessage(
                  "page.details.actions.thread.modal.update.comment"
                )}
              />
            )}
            <DiscussionThreadItemReviewAction
              item={item}
              queryToInvalidate="get-details-data"
              allowedActions={{
                canModerate,
                canAccessReports,
                canReviewReports,
              }}
              isAnyActionLoading={isLoading}
            />
          </IconButtonGroupStyled>
        )}
        {hasActiveThread && (
          <IconButtonGroupStyled isSingle withMargin>
            <IconButton
              onClick={handleDrilldownClick}
              icon={eye}
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
           {!hasActiveThread && !pinned && (!blockedThread && !blocked) &&  (
            <IconButton
              onClick={toggleStartThreadVisibility}
              icon={plus}
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
          onClose={toggleStartThreadVisibility}
        />
      }
      {updateCommentVisible && 
        <ModeratorResponseModal
          content={content}
          id={id}
          title={getMessage(
            "page.details.actions.thread.modal.update.comment"
          )}
          onClose={toggleUpdateCommentVisibility}
        />
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
          iconConfirm={lock}
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
          iconConfirm={lock}
          onConfirm={handleOnConfirm}
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

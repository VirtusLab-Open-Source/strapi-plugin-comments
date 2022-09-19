// TODO
// @ts-nocheck

import { Button } from "@strapi/design-system/Button";
import { IconButton } from "@strapi/design-system/IconButton";
import { useNotification, useOverlayBlocker } from "@strapi/helper-plugin";
import { isNil, isEmpty, orderBy } from "lodash";
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "react-query";

import {
  blockItem,
  blockItemThread,
  resolveReport,
  resolveCommentMultipleReports,
  resolveAllAbuseReportsForComment,
  resolveAllAbuseReportsForThread,
} from "../../pages/utils/api";
import { pluginId } from "../../pluginId";
import { getMessage, handleAPIError } from "../../utils";
import ReportsReviewModal from "../ReportsReviewModal";
import ReportsReviewTable from "../ReportsReviewTable";
import { review, lock, check } from "../icons";

const DiscussionThreadItemReviewAction = ({
  allowedActions: { canModerate, canAccessReports, canReviewReports },
  isAnyActionLoading,
  item,
  queryToInvalidate
}) => {
  const { blockedThread, reports } = item;

  const [reportsReviewVisible, setReportsReviewVisible] = useState(false);
  const [storedItems, setStoredItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [blockButtonsDisabled, setBlockButtonsDisabled] = useState(blockedThread);

  const handleBlockButtonsStateChange = (disabled) =>
    setBlockButtonsDisabled(disabled);

  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { lockApp, unlockApp } = useOverlayBlocker();

  useEffect(() => {
    setStoredItems(
      orderBy(reports, ["resolved", "createdAt"], ["DESC", "DESC"]),
    );
  }, [reportsReviewVisible, reports]);

  const onSuccess = (message = "") => () => {
    queryClient.invalidateQueries(queryToInvalidate);
    if (message) {
      toggleNotification({
        type: "success",
        message: `${pluginId}.${message}`,
      });
    }
    unlockApp();
  };

  const onError = (err) => () => {
    handleAPIError(err, toggleNotification);
  };

  const mutationConfig = (message) => {
    return {
      onSuccess: onSuccess(message),
      onError
    };
  };

  const onBlockActionClick = async (mutation, onCallback) => {
    lockApp();
    await mutation.mutateAsync(item.id);
    setReportsReviewVisible(false);
  };

  const isNotResolved = (entry) => !entry.resolved;

  const resolveReportMutation = useMutation(resolveReport, mutationConfig("page.details.panel.discussion.warnings.reports.dialog.confirmation.success"));

  const resolveCommentMultipleReportsMutation = useMutation(
    resolveCommentMultipleReports, mutationConfig("page.details.panel.discussion.warnings.reports.selected.dialog.confirmation.success")
  );

  const resolveAllAbuseReportsForCommentMutation = useMutation(
    resolveAllAbuseReportsForComment,
    mutationConfig()
  );

  const resolveAllAbuseReportsForThreadMutation = useMutation(
    resolveAllAbuseReportsForThread,
    mutationConfig()
  );

  const blockItemMutation = useMutation(blockItem, mutationConfig("page.details.actions.comment.block.confirmation.success"));

  const blockItemThreadMutation = useMutation(blockItemThread, mutationConfig("page.details.actions.thread.block.confirmation.success"));

  const handleReportsReviewClick = () => {
    if (canAccessReports) {
      setReportsReviewVisible(true);
    }
  };
  const handleBlockItemClick = () => {
    if (canModerate) {
      onBlockActionClick(blockItemMutation);
    }
  };
  const handleBlockItemThreadClick = () => {
    if (canModerate) {
      onBlockActionClick(blockItemThreadMutation);
    }
  };

  const handleClickResolveSelected = async () => {
    if (canReviewReports) {
      lockApp();
      const items = await resolveCommentMultipleReportsMutation.mutateAsync({
        id: item.id,
        reportIds: selectedItems,
      });
      if (!isEmpty(items)) {
        const updatedItems = storedItems.map((_) => ({
          ..._,
          resolved: selectedItems.includes(_.id) ? true : _.resolved,
        }));
        setStoredItems(updatedItems);
        setSelectedItems([], false);
        handleBlockButtonsStateChange(
          updatedItems.filter(isNotResolved).length === 0,
        );
      }
    }
  };

  const handleResolveAllAbuseReportsForComment = async () => {
    if (canModerate) {
      await onBlockActionClick(resolveAllAbuseReportsForCommentMutation);
    }
  };

  const handleResolveAllAbuseReportsForThread = async () => {
    if (canModerate) {
      await onBlockActionClick(resolveAllAbuseReportsForThreadMutation);
    }
  };

  const handleReportsReviewClose = async () => {
    await queryClient.invalidateQueries(queryToInvalidate);
    setReportsReviewVisible(false);
  };

  const handleOnClikcBlockComment = useCallback(() => {
    handleResolveAllAbuseReportsForComment();
    handleBlockItemClick();
  }, [handleResolveAllAbuseReportsForComment, handleBlockItemClick]);

  const handleOnClikcBlockThread = useCallback(() => {
    handleBlockItemThreadClick();
    handleResolveAllAbuseReportsForThread();
  }, [handleBlockItemThreadClick, handleResolveAllAbuseReportsForThread]);

  const onSelectionChange = (selection) => setSelectedItems(selection);

  const isLoading = isAnyActionLoading && resolveReportMutation.isLoading;
  const openReports = reports?.filter(isNotResolved);
  const hasReports = !isEmpty(openReports);
  const reviewFlowEnabled =
    canAccessReports && hasReports && !(item.blocked || item.blockedThread);

  const hasAnySelectedItems = selectedItems.length > 0;

  if (reviewFlowEnabled) {
    return (
      <>
        <IconButton
          onClick={handleReportsReviewClick}
          label={getMessage("page.discover.table.reports.review")}
          icon={review}
        />
        <ReportsReviewModal
          isVisible={reportsReviewVisible}
          isActionAsync={isLoading}
          allowedActions={{ canModerate, canAccessReports, canReviewReports }}
          onClose={handleReportsReviewClose}
          startActions={
            <Button onClick={handleReportsReviewClose} variant="tertiary">
              {getMessage(
                "compontents.confirmation.dialog.button.cancel",
                "Cancel",
              )}
            </Button>
          }
          endActions={
            canModerate && (
              <>
                <Button
                  onClick={handleOnClikcBlockComment}
                  variant="danger-light"
                  startIcon={lock}
                  disabled={blockButtonsDisabled}>
                  {getMessage(
                    `page.details.actions.comment.block`,
                    "Block comment",
                  )}
                </Button>
                {item.gotThread && (
                  <Button
                    onClick={handleOnClikcBlockThread}
                    variant="danger"
                    startIcon={lock}
                    disabled={blockButtonsDisabled}>
                    {getMessage(
                      `page.details.actions.thread.block`,
                      "Block thread",
                    )}
                  </Button>
                )}
                {hasAnySelectedItems && (
                  <Button
                    onClick={handleClickResolveSelected}
                    variant="success"
                    startIcon={check}>
                    {getMessage(
                      {
                        id: `page.details.panel.discussion.warnings.reports.dialog.actions.resolve.selected`,
                        props: {
                          count: selectedItems.length,
                        },
                      },
                      "Resolve selected",
                    )}
                  </Button>
                )}
              </>
            )
          }
          item={item}>
          <ReportsReviewTable
            commentId={item.id}
            items={storedItems}
            selectedItems={selectedItems}
            mutation={resolveReportMutation}
            updateItems={setStoredItems}
            allowedActions={{ canAccessReports, canReviewReports }}
            onBlockButtonsStateChange={handleBlockButtonsStateChange}
            onSelectionChange={onSelectionChange}
          />
        </ReportsReviewModal>
      </>
    );
  }
  return null;
};

DiscussionThreadItemReviewAction.propTypes = {
  item: PropTypes.object.isRequired,
  isAnyActionLoading: PropTypes.bool,
  allowedActions: PropTypes.shape({
    canModerate: PropTypes.bool,
    canAccessReports: PropTypes.bool,
    canReviewReports: PropTypes.bool,
  }),
  queryToInvalidate: PropTypes.string
};

export default DiscussionThreadItemReviewAction;

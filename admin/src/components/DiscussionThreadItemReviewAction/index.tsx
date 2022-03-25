// @ts-nocheck

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "react-query";
import { isNil, isEmpty, orderBy } from "lodash";
import { Button } from "@strapi/design-system/Button";
import { IconButton } from "@strapi/design-system/IconButton";
import { useNotification, useOverlayBlocker } from "@strapi/helper-plugin";
import { ReviewIcon, LockIcon } from "../icons";
import { resolveReport } from "../../pages/utils/api";
import { getMessage, handleAPIError } from "../../utils";
import ReportsReviewTable from "../ReportsReviewTable";
import ReportsReviewModal from "../ReportsReviewModal";
import pluginId from "../../pluginId";

const DiscussionThreadItemReviewAction = ({
  item,
  isAnyActionLoading: isAnyActionLoading,
  queryToInvalidate,
  areBlockButtonsDisabled,
  allowedActions: { canModerate, canAccessReports, canReviewReports },
  blockItemMutation,
  blockItemThreadMutation,
  onBlockButtonsStateChange,
  onBlockActionClick,
}) => {
  const { reports } = item;

  const [reportsReviewVisible, setReportsReviewVisible] = useState(false);

  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { unlockApp } = useOverlayBlocker();

  const onSuccess =
    (message, stateAction = () => {}, indalidate = true) =>
    async () => {
      if (indalidate) {
        await queryClient.invalidateQueries(queryToInvalidate);
      }
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

  const resolveReportMutation = useMutation(resolveReport, {
    onSuccess: onSuccess(
      "page.details.panel.discussion.warnings.reports.dialog.confirmation.success",
      () => {},
      false
    ),
    onError,
    refetchActive: false,
  });

  const handleBlockActionClick = () => setReportsReviewVisible(false);

  const handleReportsReviewClick = () => {
    if (canAccessReports) {
      setReportsReviewVisible(true);
    }
  };
  const handleBlockItemClick = async () => {
    if (canModerate) {
      await onBlockActionClick(blockItemMutation, handleBlockActionClick);
    }
  };
  const handleBlockItemThreadClick = async () => {
    if (canModerate) {
      await onBlockActionClick(blockItemThreadMutation, handleBlockActionClick);
    }
  };

  const handleReportsReviewClose = async () => {
    await queryClient.invalidateQueries(queryToInvalidate);
    setReportsReviewVisible(false);
  };

  const isLoading = isAnyActionLoading && resolveReportMutation.isLoading;
  const openReports = reports?.filter((_) => !_.resolved);
  const hasReports = !isEmpty(openReports);
  const reviewFlowEnabled =
    canAccessReports && hasReports && !(item.blocked || item.blockedThread);

  if (reviewFlowEnabled) {
    return (
      <>
        <IconButton
          onClick={handleReportsReviewClick}
          label={getMessage("page.discover.table.reports.review")}
          icon={<ReviewIcon />}
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
                "Cancel"
              )}
            </Button>
          }
          endActions={
            canModerate && (
              <>
                <Button
                  onClick={handleBlockItemClick}
                  variant="danger-light"
                  startIcon={<LockIcon />}
                  disabled={areBlockButtonsDisabled}
                >
                  {getMessage(
                    `page.details.actions.comment.block`,
                    "Block comment"
                  )}
                </Button>
                {item.gotThread && (
                  <Button
                    onClick={handleBlockItemThreadClick}
                    variant="danger"
                    startIcon={<LockIcon />}
                    disabled={areBlockButtonsDisabled}
                  >
                    {getMessage(
                      `page.details.actions.thread.block`,
                      "Block thread"
                    )}
                  </Button>
                )}
              </>
            )
          }
          item={item}
        >
          <ReportsReviewTable
            commentId={item.id}
            items={orderBy(
              reports,
              ["resolved", "createdAt"],
              ["DESC", "DESC"]
            )}
            mutation={resolveReportMutation}
            allowedActions={{ canAccessReports, canReviewReports }}
            onBlockButtonsStateChange={onBlockButtonsStateChange}
          />
        </ReportsReviewModal>
      </>
    );
  }
  return null;
};

// DiscussionThreadItemReviewAction.propTypes = {
//     item: PropTypes.object.isRequired,
//     isLoading: PropTypes.bool,
//     queryToInvalidate: PropTypes.string.isRequired,
//     areBlockButtonsDisabled: PropTypes.bool,
//     allowedActions: PropTypes.shape({
//         canModerate: PropTypes.bool,
//         canAccessReports: PropTypes.bool,
//         canReviewReports: PropTypes.bool,
//     }),
//     blockItemMutation: PropTypes.func.isRequired,
//     blockItemThreadMutation: PropTypes.func.isRequired,
//     onBlockButtonsStateChange: PropTypes.func.isRequired,
//     onBlockActionClick: PropTypes.func.isRequired,
// };

export default DiscussionThreadItemReviewAction;

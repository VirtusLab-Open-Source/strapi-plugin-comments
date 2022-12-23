/**
 *
 * Entity Details
 *
 */

// TODO
// @ts-nocheck

import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { isEmpty, isArray } from "lodash";
import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import { Flex } from "@strapi/design-system/Flex";
import {
  Table,
  Thead,
  Tbody,
  TFooter,
  Tr,
  Th,
  Td,
} from "@strapi/design-system/Table";
import { Typography } from "@strapi/design-system/Typography";
import { VisuallyHidden } from "@strapi/design-system/VisuallyHidden";
import { check } from "../icons";
import { useOverlayBlocker } from "@strapi/helper-plugin";
import { getMessage } from "../../utils";
import { REPORT_REASON, REPORT_STATUS } from "../../utils/constants";
import StatusBadge from "../StatusBadge";
import { ActionButton } from "../ActionButton/styles";

const ReportsReviewTable = ({
  commentId,
  items,
  selectedItems = [],
  mutation,
  updateItems,
  allowedActions: {canAccessReports, canReviewReports},
  onBlockButtonsStateChange,
  onSelectionChange,
}) => {
  const {formatDate} = useIntl();

  const {lockApp} = useOverlayBlocker();

  const renderStatus = (resolved) => {
    const status = resolved ? REPORT_STATUS.RESOLVED : REPORT_STATUS.OPEN;
    let color = "alternative";
    switch (status) {
      case REPORT_STATUS.RESOLVED:
        color = "success";
        break;
      case REPORT_STATUS.OPEN:
        color = "danger";
    }
    return (
      <StatusBadge
        backgroundColor={`${color}100`}
        textColor={`${color}600`}
        color={color}>
        {getMessage(
          `page.details.panel.discussion.warnings.reports.dialog.status.${status}`,
          status,
        )}
      </StatusBadge>
    );
  };

  const renderReason = (reason) => {
    let color = "neutral";
    switch (reason) {
      case REPORT_REASON.DISCRIMINATION:
        color = "danger";
        break;
      case REPORT_REASON.BAD_LANGUAGE:
        color = "warning";
    }
    return (
      <StatusBadge
        backgroundColor={`${color}100`}
        textColor={`${color}600`}
        color={color}>
        {getMessage(
          `page.details.panel.discussion.warnings.reports.dialog.reason.${reason}`,
          reason,
        )}
      </StatusBadge>
    );
  };

  const handleItemSelectionChange = (selection, value) => {
    if (isArray(selection)) {
      onSelectionChange(value ? selection : []);
    } else {
      onSelectionChange(
        [...selectedItems, selection].filter(
          (item) => value || selection !== item,
        ),
      );
    }
  };

  const isNotResolved = (entry) => !entry.resolved;
  const unresolvedItems = items.filter(isNotResolved);

  const areAllItemsSelected = () =>
    !isEmpty(selectedItems)
      ? selectedItems.length === unresolvedItems.length
      : false;

  const isItemSelected = (id) => selectedItems.includes(id);

  const handleClickResolve = async (reportId) => {
    if (canReviewReports) {
      lockApp();
      const item = await mutation.mutateAsync({
        id: commentId,
        reportId,
      });
      if (item) {
        const updatedItems = items.map((_) => ({
          ..._,
          resolved: reportId === _.id ? true : _.resolved,
        }));
        updateItems(updatedItems);
        onSelectionChange(selectedItems.filter((_) => _ !== reportId));
        onBlockButtonsStateChange(
          updatedItems.filter(isNotResolved).length === 0,
        );
      }
    }
  };

  const handleValueChange = useCallback(
    (value) =>
      handleItemSelectionChange(
        unresolvedItems.map((_) => _.id),
        value,
      ),
    [unresolvedItems, handleItemSelectionChange],
  );

  if (isEmpty(items)) {
    return null;
  }

  const COL_COUNT = 6;

  if (canAccessReports) {
    return (
      <Table colCount={COL_COUNT} rowCount={items.length}>
        <Thead>
          <Tr>
            <Th>
              <BaseCheckbox
                aria-label={getMessage(
                  "page.details.panel.discussion.warnings.reports.dialog.selectAll",
                )}
                value={areAllItemsSelected()}
                disabled={isEmpty(unresolvedItems)}
                onValueChange={handleValueChange}
              />
            </Th>
            <Th>
              <Typography variant="sigma">
                {getMessage(
                  "page.details.panel.discussion.warnings.reports.dialog.reason",
                )}
              </Typography>
            </Th>
            <Th>
              <Typography variant="sigma">
                {getMessage(
                  "page.details.panel.discussion.warnings.reports.dialog.content",
                )}
              </Typography>
            </Th>
            <Th>
              <Typography variant="sigma">
                {getMessage(
                  "page.details.panel.discussion.warnings.reports.dialog.createdAt",
                )}
              </Typography>
            </Th>
            <Th>
              <Typography variant="sigma">
                {getMessage(
                  "page.details.panel.discussion.warnings.reports.dialog.status",
                )}
              </Typography>
            </Th>
            {canReviewReports && (
              <Th>
                <VisuallyHidden>
                  {getMessage(
                    "page.details.panel.discussion.warnings.reports.dialog.actions",
                  )}
                </VisuallyHidden>
              </Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {items.map((entry) => (
            <Tr key={entry.id}>
              <Td>
                <BaseCheckbox
                  aria-label={getMessage(
                    "page.details.panel.discussion.warnings.reports.dialog.select",
                  )}
                  value={isItemSelected(entry.id)}
                  disabled={entry.resolved}
                  onValueChange={(value) =>
                  handleItemSelectionChange(entry.id, value)
                  }
                />
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {renderReason(entry.reason)}
                </Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{entry.content}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">
                  {formatDate(entry.createdAt, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </Typography>
              </Td>
              <Td>{renderStatus(entry.resolved)}</Td>
              {canReviewReports && (
                <Td>
                  {!entry.resolved && (
                    <Flex direction="column" alignItems="flex-end">
                      <ActionButton
                        isSingle
                        onClick={() => handleClickResolve(entry.id)}
                        startIcon={check}
                        variant="success">
                        {getMessage(
                          "page.details.panel.discussion.warnings.reports.dialog.actions.resolve",
                          "resolve",
                        )}
                      </ActionButton>
                    </Flex>
                  )}
                </Td>
              )}
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  }
  return null;
};



export default ReportsReviewTable;

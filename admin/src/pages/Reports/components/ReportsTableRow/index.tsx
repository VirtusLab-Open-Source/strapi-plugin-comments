// @ts-nocheck


import { BaseCheckbox } from "@strapi/design-system/BaseCheckbox";
import { Button } from "@strapi/design-system/Button";

import { Tr, Td } from "@strapi/design-system/Table";
import { Typography } from "@strapi/design-system/Typography";
;
import { eye } from "../../../../components/icons";

import React, { useState, useCallback } from "react";
import { useIntl } from "react-intl";



import CommentReviewModal from "../../../../components/CommentReviewModal";

import StatusBadge from "../../../../components/StatusBadge";

import {
  getMessage,
  resolveReportStatus,
  resolveReportStatusColor,
} from '../../../../utils';

import ReportsActions from "../../../../components/ReportsActions";

const cellMaxWidth = { maxWidth: "30vw" };

const ReportsTableRow = ({
  allowedActions,
  config,
  handleItemSelectionChange,
  isChecked,
  item,
  mutation,
  onClick,
  onSelectionChange,
  reports,
  selectedReports,
  updateReports,
}) => {
  const {
    reports: reportedReports,
  } = item;

  const [modalVisible, setModalVisible] = useState(false);

  const { formatDate } = useIntl();

  const openReports = reportedReports?.filter((_) => !_.resolved);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);


  const renderStatus = (props) => {
    const status = resolveReportStatus(props);
    const color = resolveReportStatusColor(status);

    return (
      <StatusBadge
        backgroundColor={`${color}100`}
        textColor={`${color}700`}
        color={color}>
        {getMessage(
          {
            id: `page.common.item.status.${status}`,
            props: {
              count: openReports.length,
            },
          },
          status,
        )}
      </StatusBadge>
    );
  };



  return (
    <Tr key={item.id}>
      <Td>
        <BaseCheckbox
          aria-label={getMessage(
            "page.details.panel.discussion.warnings.reports.dialog.select",
          )}
          value={isChecked(item.id)}
          onValueChange={(value) => handleItemSelectionChange(item.id, value)}
        />
      </Td>
      <Td>
        <Typography textColor="neutral800" fontWeight="bold">
          #{item.id}
        </Typography>
      </Td>
      <Td>
        <Typography textColor="neutral800" variant="pi">
          {item.reason || getMessage("compontents.reason.unknown")}
        </Typography>
      </Td>
      <Td style={cellMaxWidth}>
        <Typography textColor="neutral800" ellipsis>
          {item.content || getMessage("compontents.content.unknown")}
        </Typography>
      </Td>
      <Td style={cellMaxWidth}>
        <Typography textColor="neutral800" ellipsis>
          {renderStatus(item)}
        </Typography>
      </Td>
      <Td>
        <Typography textColor="neutral800">
          {formatDate(item.updatedAt || item.createdAt, {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </Typography>
      </Td>
      <Td>
        <Button
          variant="tertiary"
          startIcon={eye}
          onClick={handleOpenModal}>
          {getMessage(
            {
              id: "page.discover.table.cell.thread",
              props: { id: item.related.id },
            },
            `#${item.related.id}`,
          )}
        </Button>
        <CommentReviewModal
          isVisible={modalVisible}
          onClose={handleCloseModal}
          item={item}
        />
      </Td>
      <Td>
        <ReportsActions
          item={item}
          allowedActions={allowedActions}
          mutation={mutation}
          reports={reports}
          updateReports={updateReports}
          onSelectionChange={onSelectionChange}
          selectedReports={selectedReports}
        />
      </Td>
    </Tr>
  );
};

export default ReportsTableRow;

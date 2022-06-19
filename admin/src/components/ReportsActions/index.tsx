// @ts-nocheck

import React from "react";
import { ActionButton } from "../ActionButton/styles";
import { Flex } from "@strapi/design-system/Flex";
import { SimpleMenu, MenuItem } from '@strapi/design-system/SimpleMenu';
import { carretDown, check } from "../icons";


import { getMessage } from '../../utils';
import useReportsActionsHandlers from "../../hooks/useReportsActionsHandlers";
import BlockMenu from "./components/BlockMenu";

const ReportsActions = ({
  allowedActions,
  item,
  mutation,
  onSelectionChange,
  reports,
  selectedReports,
  updateReports,
}) => {
  const {
    id: reportId,
    resolved,
    related: {
      blocked: blockedComment,
      blockedThread,
      gotThread,
      id: commentId
    } } = item;

  const handlers = useReportsActionsHandlers(
    allowedActions,
    commentId,
    mutation,
    onSelectionChange,
    reports,
    selectedReports,
    updateReports
  );

  const { handleClickResolve } = handlers

  return (
    <Flex>
      {!resolved ? (
        <ActionButton
          isSingle
          onClick={() => handleClickResolve(reportId)}
          startIcon={check}
          variant={"success"}>
          {getMessage(
            "page.details.panel.discussion.warnings.reports.dialog.actions.resolve",
            "resolve",
          )}
        </ActionButton>
      ) : (
        <BlockMenu
          handlers={handlers}
          item={item}
        />
      )}
      {!resolved &&
        <BlockMenu
          handlers={handlers}
          item={item}
          type={"icon"}
        />
      }
    </Flex >
  );
};

export default ReportsActions;

// @ts-nocheck

import React from "react";
import { SimpleMenu, MenuItem } from '@strapi/design-system/SimpleMenu';
import { carretDown } from "../../../icons";
import { getMessage } from "../../../../utils";


const BlockMenu = ({
  handlers: {
    handleBlockItemClick,
    handleBlockItemThreadClick,
    handleClickResolve,
    handleResolveAllAbuseReportsForComment,
    handleResolveAllAbuseReportsForThread,
    handleUnblockItemClick,
    handleUnblockThreadClick,
  },
  item,
  type,
}) => {
  const {
    id: reportId,
    related: {
      blocked: blockedComment,
      blockedThread,
      gotThread,
      id: commentId
    } } = item;

  const isIconButton = type === "icon";
  const iconButtonStyle = { minHeight: "2em", paddingLeft: '5px', paddingRight: "12px" };

  return (
    <SimpleMenu
      label={isIconButton ? null : "Block"}
      variant={"danger-light"}
      style={isIconButton ? iconButtonStyle : null}
    >
      {!blockedComment ? (
        <MenuItem
          disabled={blockedThread}
          onClick={() => {
            handleBlockItemClick(commentId);
            handleResolveAllAbuseReportsForComment(commentId);
          }}
        >
          {getMessage(
            "page.details.actions.comment.block",
            "Block comment",
          )}</MenuItem>
      ) : (
        <MenuItem
            disabled={blockedThread}
          onClick={() => {
            handleUnblockItemClick(commentId);
          }}
        >
          {getMessage(
            "page.details.actions.comment.unblock",
            "Unblock comment",
          )}</MenuItem>)
      }
      {gotThread && (!blockedThread ? (
        <MenuItem
          onClick={() => {
            handleBlockItemThreadClick(commentId);
            handleResolveAllAbuseReportsForThread(commentId);
          }}
        >
          {getMessage(
            "page.details.actions.thread.block",
            "Block thread",
          )}
        </MenuItem>
      ) : (
        <MenuItem
          onClick={() => {
            handleUnblockThreadClick(commentId);
          }}
        >
          {getMessage(
            "page.details.actions.thread.unblock",
            "Unblock thread",
          )}
        </MenuItem>))
      }
    </SimpleMenu>
  );
};

export default BlockMenu;

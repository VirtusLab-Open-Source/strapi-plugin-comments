// TODO
// @ts-nocheck

import React, { useCallback } from "react";
import { SimpleMenu, MenuItem } from '@strapi/design-system/SimpleMenu';
import { carretDown } from "../../../icons";
import { getMessage } from "../../../../utils";

const iconButtonStyle = { minHeight: "2em", paddingLeft: '5px', paddingRight: "12px" };

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

  const handleBlockComment = useCallback(() => {
    handleBlockItemClick(commentId);
    handleResolveAllAbuseReportsForComment(commentId);
  }, [handleBlockItemClick, handleResolveAllAbuseReportsForComment]);

  const handleUnblockComment = useCallback(() => handleUnblockItemClick(commentId), [handleUnblockItemClick]);

  const handleBlockThread = useCallback(() => {
    handleBlockItemThreadClick(commentId);
    handleResolveAllAbuseReportsForThread(commentId);
  }, [handleBlockItemThreadClick, handleResolveAllAbuseReportsForThread]);

  const handleUnblockThread = useCallback(() => {
    handleUnblockThreadClick(commentId);
  }, [handleUnblockThreadClick]);

  return (
    <SimpleMenu
      label={isIconButton ? null : "Block"}
      variant={"danger-light"}
      style={isIconButton ? iconButtonStyle : null}>
      {!blockedComment ? (
        <MenuItem
          disabled={blockedThread}
          onClick={handleBlockComment}>
          {getMessage(
            "page.details.actions.comment.block",
            "Block comment",
          )}
        </MenuItem>
      ) : (
        <MenuItem
          disabled={blockedThread}
          onClick={handleUnblockComment}>
          {getMessage(
            "page.details.actions.comment.unblock",
            "Unblock comment",
          )}
        </MenuItem>)
      }
      {gotThread &&
        (!blockedThread ? (
          <MenuItem
            onClick={handleBlockThread}>
            {getMessage(
              "page.details.actions.thread.block",
              "Block thread",
            )}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handleUnblockThread}>
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

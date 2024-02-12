/**
 *
 * Discussion thread - Moderators response modal
 *
 */

// @ts-nocheck

import React, { useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { postComment, updateComment } from "../../pages/utils/api";
//@ts-ignore
import { ModalLayout, ModalBody, ModalHeader, ModalFooter } from "@strapi/design-system/ModalLayout";
//@ts-ignore
import { Box } from "@strapi/design-system/Box";
//@ts-ignore
import { Typography } from "@strapi/design-system/Typography";
//@ts-ignore
import { Flex } from "@strapi/design-system/Flex";
//@ts-ignore
import { Button } from "@strapi/design-system/Button";
//@ts-ignore
import { Divider } from "@strapi/design-system/Divider";
import { handleAPIError, getMessage } from "../../utils";
import { Wysiwyg } from "../Wysiwyg/Field";
// @ts-ignore
import { GenericInput, auth, useNotification, useOverlayBlocker } from "@strapi/helper-plugin";
import { StrapiAdminUser, Id } from "strapi-typed";
import { pluginId } from "../../pluginId";
import { ToBeFixed } from "../../../../types";
import { AxiosResponse } from "axios";

type ModeratorResponseModalProps = {
  content: string;
  id: Id;
  title: string;
  onClose: () => void;
};

type intlLabel = {
  id: string;
  defaultMessage: string;
  values: {};
};

type postCommentRequest = {
  threadId: Id;
  body: string;
  author: StrapiAdminUser;
};

type updateCommentRequest = {
  id: Id;
  body: string;
};

const ModeratorResponseModal: React.FC<ModeratorResponseModalProps> = ({
  content,
  id,
  title,
  onClose,
}) => {
  const [commentField, setCommentField] = useState<string>(content);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentField(e.target.value);
  };

  const user: StrapiAdminUser = auth.get("userInfo");

  const handleClose = onClose;

  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { lockApp, unlockApp } = useOverlayBlocker();

  const onSuccess =
    (message: string, stateAction = (_func: boolean): void => {}) =>
    async (): Promise<void> => {
      await queryClient.invalidateQueries("get-details-data");
      onClose();
      toggleNotification({
        type: "success",
        message: `${pluginId}.${message}`,
      });
      stateAction(false);
      unlockApp && unlockApp();
    };

  const onError = (err: ToBeFixed) => {
    handleAPIError(err, toggleNotification);
  };

  const postCommentMutation = useMutation<
    AxiosResponse<any, any>,
    Error,
    postCommentRequest
  >(postComment, {
    onSuccess: onSuccess("page.details.actions.comment.post.confirmation"),
    onError,
  });

  const updateCommentMutation = useMutation<
    AxiosResponse<any, any>,
    Error,
    updateCommentRequest
  >(updateComment, {
    onSuccess: onSuccess("page.details.actions.comment.update.confirmation"),
    onError,
  });

  const handlePostComment = async (): Promise<void> => {
    lockApp && lockApp();
    await postCommentMutation.mutate({
      threadId: id,
      body: commentField,
      author: user,
    });
  };

  const handleUpdateComment = async (): Promise<void> => {
    lockApp && lockApp();
    await updateCommentMutation.mutate({
      id,
      body: commentField,
    });
  };

  const intlLabel: intlLabel = {
    id: "",
    defaultMessage: "",
    values: {},
  };

  return (
    <ModalLayout onClose={handleClose} labelledBy={title}>
      <ModalHeader>
        <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
          {title}
        </Typography>
      </ModalHeader>
      <ModalBody>
        <GenericInput
          name=""
          value={commentField}
          onChange={handleCommentChange}
          intlLabel={intlLabel}
          customInputs={{
            wysiwyg: Wysiwyg
          } as any}
        />
      </ModalBody>
      <ModalFooter
        startActions={
          <Button onClick={handleClose} variant="tertiary">
            {getMessage("compontents.confirmation.dialog.button.cancel")}
          </Button>
        }
        endActions={
          content.length ? (
            <Button onClick={handleUpdateComment}>
              {getMessage("page.details.actions.thread.modal.update.comment")}
            </Button>
          ) : (
            <Button onClick={handlePostComment}>
              {getMessage("page.details.actions.thread.modal.start.thread")}
            </Button>
          )
        }
      />
    </ModalLayout>
  );
};
export default ModeratorResponseModal;

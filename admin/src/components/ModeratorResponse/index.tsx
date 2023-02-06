/**
 *
 * Discussion thread - Moderators response
 *
 */

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { unblockItemThread } from "../../pages/utils/api";
import { ModeratorResponseStyled } from "./styles";
import { postComment } from "../../pages/utils/api";
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
import { getMessage, handleAPIError } from "../../utils";
import Wysiwyg from "../Wysiwyg";
import { Comment } from "../../../../types/contentTypes";
// @ts-ignore
import { auth, useNotification, useOverlayBlocker } from "@strapi/helper-plugin";
import { StrapiAdminUser, Id } from "strapi-typed";
import { pluginId } from "../../pluginId";
import { ToBeFixed } from "../../../../types";
import { AxiosResponse } from "axios";

type ModeratorResponseProps = {
  rootThread: Comment;
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

const ModeratorResponse: React.FC<ModeratorResponseProps> = ({
  rootThread,
}) => {
  const { id: threadId, blockedThread } = rootThread;

  const [commentField, setCommentField] = useState("");
  const [isFieldEmpty, setIsFieldEmpty] = useState(true);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentField(e.target.value);
  };

  const user: StrapiAdminUser = auth.get("userInfo");

  useEffect(() => {
    setIsFieldEmpty(!commentField);
  }, [commentField]);

  const toggleNotification = useNotification();
  const queryClient = useQueryClient();
  const { lockApp, unlockApp } = useOverlayBlocker();

  const onSuccess =
    (message: string, stateAction = (_func: boolean): void => {}) =>
    async (): Promise<void> => {
      await queryClient.invalidateQueries("get-details-data");
      toggleNotification({
        type: "success",
        message: `${pluginId}.${message}`,
      });
      stateAction(false);
      setCommentField('');
      unlockApp();
    };

  const onError = (err: ToBeFixed) => {
    handleAPIError(err, toggleNotification);
  };

  const unblockItemThreadMutation = useMutation<
    AxiosResponse<any, any>,
    Error,
    Id,
    unknown
  >(unblockItemThread);

  const postCommentMutation = useMutation<
    AxiosResponse<any, any>,
    Error,
    postCommentRequest
  >(postComment, {
    onSuccess: onSuccess("page.details.actions.comment.post.confirmation"),
    onError,
  });

  const handleSave = async (): Promise<void> => {
    lockApp();
    await postCommentMutation.mutate({
      threadId,
      body: commentField,
      author: user,
    });
  };

  const handleReopen = async (): Promise<void> => {
    lockApp();
    await unblockItemThreadMutation.mutate(threadId);
    await postCommentMutation.mutate({
      threadId,
      body: commentField,
      author: user,
    });
  };

  const intlLabel: intlLabel = {
    id: "",
    defaultMessage: "",
    values: {},
  };

  return (
    <ModeratorResponseStyled>
      <Divider />
      <Box hasRadius padding={4}>
        <Box>
          <Typography
            variant="delta"
            textColor="neutral800"
            id="moderator-reply"
          >
            {getMessage("page.details.panel.discussion.reply", "Reply")}
          </Typography>
        </Box>
        <Box paddingTop={2} paddingBottom={4}>
          <Wysiwyg
            name=""
            value={commentField}
            onChange={handleCommentChange}
            intlLabel={intlLabel}
          />
        </Box>
        <Flex direction="row" justifyContent="flex-end" gap={2}>
          {blockedThread && (
            <Button
              variant="secondary"
              onClick={handleReopen}
              disabled={isFieldEmpty}
            >
              {getMessage("page.details.panel.discussion.reopen", "Re-open")}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isFieldEmpty}
          >
            {getMessage("page.details.panel.discussion.send", "Send")}
          </Button>
        </Flex>
      </Box>
    </ModeratorResponseStyled>
  );
};

export default ModeratorResponse;

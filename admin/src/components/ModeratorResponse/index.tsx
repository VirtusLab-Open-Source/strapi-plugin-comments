/**
 *
 * Discussion thread - Moderators response
 *
 */

import React, { useState,useEffect } from "react";
import { useMutation } from "react-query";
import { unblockItemThread } from "../../pages/utils/api";
import { ModeratorResponseStyled } from "./styles";
import { postComment } from "../../pages/utils/api"
//@ts-ignore
import { Box } from "@strapi/design-system/Box";
//@ts-ignore
import { Typography } from "@strapi/design-system/Typography";
//@ts-ignore
import { Flex } from "@strapi/design-system/Flex";
//@ts-ignore
import { Button } from '@strapi/design-system/Button';
//@ts-ignore
import { Divider } from '@strapi/design-system/Divider';
import { getMessage } from "../../utils";
import Wysiwyg from "../Wysiwyg";
import { Comment } from "../../../../types/contentTypes"
// @ts-ignore
import { auth } from "@strapi/helper-plugin";
import { StrapiAdminUser } from "strapi-typed";

type ModeratorResponseProps = {
    rootThread: Comment
    onRefresh: ()=> void;
}

type intlLabel = {
    id:string,
    defaultMessage:string,
    values:{}
}

const ModeratorResponse: React.FC<ModeratorResponseProps> = ({ rootThread,onRefresh }) => {
    const { 
        id:threadID,
        blockedThread 
    } = rootThread;

  const [ commentField, setCommentField ] = useState<string>("");
  const [ isFieldEmpty, setIsFieldEmpty ] = useState<boolean>(true);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentField(e.target.value);
  }

  const user: StrapiAdminUser = auth.get('userInfo')
    
  useEffect(() => {
    commentField.length 
        ? setIsFieldEmpty(false) 
        : setIsFieldEmpty(true)
  }, [commentField])
  
  const unblockItemThreadMutation = useMutation(unblockItemThread);

  const handleSave = async (): Promise<void> => {
    await postComment(threadID,commentField,user);
    onRefresh();
  }

  const handleReopen =  async (): Promise<void> => {
    await unblockItemThreadMutation.mutate(threadID);
    await postComment(threadID,commentField,user);
    onRefresh();
  }
  
  const intlLabel: intlLabel = {
    id:"",
    defaultMessage:"",
    values:{}
  }

 return (
    <ModeratorResponseStyled>
        <Divider/>
        <Box
            hasRadius
            padding={4}
        >
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
                    intlLabel = {intlLabel}
                />
            </Box>
            <Flex
                direction="row"
                justifyContent="flex-end"
                gap={2}
            >
                {blockedThread && <Button
                    variant='secondary'
                    onClick={handleReopen}
                    disabled={isFieldEmpty}
                >
                    Re-open
                </Button>}
                <Button
                    variant='tertiary'
                    onClick={handleSave}
                    disabled={isFieldEmpty}
                >
                    Send
                </Button>
            </Flex> 
        </Box>
    </ModeratorResponseStyled>
  );
};

export default ModeratorResponse;

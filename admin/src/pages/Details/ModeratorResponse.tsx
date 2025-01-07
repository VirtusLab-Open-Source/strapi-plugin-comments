import { Box, Button, Divider, Flex, Typography } from '@strapi/design-system';
import { Form } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';
import { FC, Fragment, useRef } from 'react';
import { Wysiwyg } from '../../components/Wysiwyg';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { useUserContext } from '../../hooks/useUserContext';
import { getMessage } from '../../utils';

type ModeratorResponseProps = {
  readonly id: number;
  readonly blockedThread: boolean | null;
}
export const ModeratorResponse: FC<ModeratorResponseProps> = ({ id, blockedThread }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const api = useAPI();
  const author = useUserContext();

  const {
    commentMutation,
  } = useCommentMutations({
    comment: {
      postCommentSuccess: () => {
        return queryClient.invalidateQueries({
          queryKey: api.comments.findOne.getKey(),
          exact: false,
        });
      },
    },
  });

  const onSubmit = async (values: { content: string }) => {
    await commentMutation.postComment.mutateAsync({ id, ...values, author });
  };

  const onReopen = (content: string) => async () => {
    await commentMutation.unBlockThread.mutateAsync(id);
    await commentMutation.postComment.mutateAsync({ id, content, author });
  };

  return (
    <Box width="100%">
      <Divider />
      <Box hasRadius padding={4}>
        <Form
          ref={formRef}
          onSubmit={onSubmit}
          method="POST"
          initialValues={{
            content: '',
          }}
        >
          {({ values, onChange }) => (
            <Fragment>
              <Box>
                <Typography
                  variant="delta"
                  textColor="neutral800"
                  id="moderator-reply"
                >
                  {getMessage('page.details.panel.discussion.reply', 'Reply')}
                </Typography>
              </Box>
              <Box paddingTop={2} paddingBottom={4}>
                <Wysiwyg
                  name="content"
                  value={values.content}
                  onChange={onChange}
                />
              </Box>
              <Flex direction="row" justifyContent="flex-end" gap={2}>
                {blockedThread && (
                  <Button
                    variant="secondary"
                    onClick={onReopen(values.content)}
                    type="button"
                    disabled={!values.content}
                  >
                    {getMessage('page.details.panel.discussion.reopen', 'Re-open')}
                  </Button>
                )}
                <Button
                  variant="primary"
                  disabled={!values.content}
                >
                  {getMessage('page.details.panel.discussion.send', 'Send')}
                </Button>
              </Flex>
            </Fragment>
          )}
        </Form>
      </Box>
    </Box>
  );
};

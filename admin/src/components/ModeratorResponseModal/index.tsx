import { Button, Flex, IconButton, Modal } from '@strapi/design-system';
import { Form, useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useRef, useState } from 'react';
import { useAPI } from '../../hooks/useAPI';
import { useUserContext } from '../../hooks/useUserContext';
import { getMessage } from '../../utils';
import { Wysiwyg } from '../Wysiwyg';

type ModeratorResponseModalProps = {
  content: string;
  id: string | number;
  title: string;
  Icon: FC;
};

export const ModeratorResponseModal: FC<ModeratorResponseModalProps> = ({ id, content, title, Icon }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const api = useAPI();

  const author = useUserContext();

  const getOnSuccess = (message: string) => async () => {
    await queryClient.invalidateQueries({
      queryKey: api.comments.findOne.getKey(),
      exact: false,
    });
    setIsModalVisible(false);
    toggleNotification({
      message: getMessage(message),
      type: 'success',
    });
  };

  const postCommentMutation = useMutation({
    mutationFn: api.comments.postComment,
    onSuccess: getOnSuccess('page.details.actions.comment.post.confirmation'),
  });

  const updateCommentMutation = useMutation({
    mutationFn: api.comments.updateComment,
    onSuccess: getOnSuccess('page.details.actions.comment.update.confirmation'),
  });

  const onSubmit = async (values: { content: string }) => {
    if (content.length) {
      await updateCommentMutation.mutateAsync({
        id,
        content: values.content,
      });
    } else {
      await postCommentMutation.mutateAsync({
        id,
        author,
        content: values.content,
      });
    }
  };

  const onClickSubmit = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const onToggleModal = useCallback(() => {
    setIsModalVisible((prev) => !prev);
  }, []);

  return (
    <Modal.Root open={isModalVisible} onOpenChange={onToggleModal}>
      <Modal.Trigger>
        <IconButton>
          <Icon />
        </IconButton>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            ref={formRef}
            onSubmit={onSubmit}
            method="POST"
            initialValues={{
              content: content || '',
            }}
          >
            {({ values, onChange }) => (
              <Wysiwyg
                name="content"
                value={values.content}
                onChange={onChange}
              />
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Flex gap={2} justifyContent="space-between" width="100%">
            <Button onClick={onToggleModal} variant="tertiary">
              {getMessage('components.confirmation.dialog.button.cancel')}
            </Button>
            <Button onClick={onClickSubmit}>
              {content.length ? getMessage('page.details.actions.thread.modal.update.comment') : getMessage('page.details.actions.thread.modal.start.thread')}
            </Button>
          </Flex>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>

  );
};

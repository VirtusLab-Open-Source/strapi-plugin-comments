import { Button, Flex, IconButton, Modal } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useState } from 'react';
import { useAPI } from '../../hooks/useAPI';
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

  const [commentField, setCommentField] = useState(content);
  //   TODO: replace with real user
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const api = useAPI();
  const user = { id: 1 };

  const getOnSuccess = (message: string) => async () => {
    await queryClient.invalidateQueries({
      queryKey: api.getDetailsCommentKey(id),
      exact: false,
    });
    toggleNotification({
      message: getMessage(message),
      type: 'success',
    });
  };

  const postCommentMutation = useMutation({
    mutationFn: api.postComment,
    onSuccess: getOnSuccess('page.details.actions.comment.post.confirmation'),
  });

  const updateCommentMutation = useMutation({
    mutationFn: api.updateComment,
    onSuccess: getOnSuccess('page.details.actions.comment.update.confirmation'),
  });

  const onClickPostComment = async () => {
    await postCommentMutation.mutateAsync({
      id,
      content: commentField,
      author: user.id,
    });
  };

  const onClickUpdateComment = async () => {
    await updateCommentMutation.mutateAsync({
      id,
      content: commentField,
    });
  };

  const onToggleModal = useCallback(() => {
    console.log('', 1);
    setIsModalVisible((prev) => !prev);
  }, []);
  const handleCommentChange = () => {};
  const intlLabel = {
    id: '',
    defaultMessage: '',
    values: {},
  };
  console.log('isModalVisible', isModalVisible);
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
          <Wysiwyg
            name=""
            value={commentField}
            onChange={handleCommentChange}
            intlLabel={intlLabel}
          />
        </Modal.Body>
        <Modal.Footer>
          <Flex gap={2} justifyContent="space-between" width="100%">
            <Button onClick={onToggleModal} variant="tertiary">
              {getMessage('components.confirmation.dialog.button.cancel')}
            </Button>
            {content.length ? (
              <Button onClick={onClickUpdateComment}>
                {getMessage('page.details.actions.thread.modal.update.comment')}
              </Button>
            ) : (
              <Button onClick={onClickPostComment}>
                {getMessage('page.details.actions.thread.modal.start.thread')}
              </Button>
            )}
          </Flex>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>

  );
};
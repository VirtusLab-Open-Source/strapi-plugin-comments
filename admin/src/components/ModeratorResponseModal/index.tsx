import { Flex, IconButton, Modal, Button } from '@strapi/design-system';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
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
      exact: false
    })
    toggleNotification({
      message: getMessage(message),
      type: 'success',
    });
  }

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

  const onToggleModal = () => setIsModalVisible((prev) => !prev);
  const handleCommentChange = () => {};
  const intlLabel = {
    id: '',
    defaultMessage: '',
    values: {},
  };

  return (
    <Modal.Root open={isModalVisible} onOpenChange={onToggleModal}>
      <Modal.Trigger>
        <IconButton
          onClick={onToggleModal}
          icon={<Icon />}
        />
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
          <Flex gap={2}>
            <Button onClick={onToggleModal} variant="tertiary">
              {getMessage('compontents.confirmation.dialog.button.cancel')}
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
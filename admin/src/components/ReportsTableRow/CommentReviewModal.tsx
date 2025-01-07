import { Button, Modal, Typography } from '@strapi/design-system';
import { Eye } from '@strapi/icons';

import { FC, useState } from 'react';
import { Comment, Report } from '../../api/schemas';
import { getMessage } from '../../utils';
import { DiscussionThreadItem } from '../DiscussionThreadItem';


type CommentReviewModalProps = {
  item: Report;
}

export const CommentReviewModal: FC<CommentReviewModalProps> = ({ item }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const onToggleModal = () => setIsModalVisible((prev) => !prev);
  return (
    <Modal.Root open={isModalVisible} onOpenChange={onToggleModal}>
      <Modal.Trigger>
        <Button
          variant="tertiary"
          startIcon={<Eye />}
        >
          {getMessage(
            {
              id: 'page.discover.table.cell.thread',
              props: { id: item.related.id },
            },
            `#${item.related.id}`,
          )}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            <Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
              {getMessage(
                'page.details.panel.discussion.warnings.comments.header',
                'Open reports',
              )}
            </Typography>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DiscussionThreadItem
            as="div"
            preview
            item={item.related as unknown as Comment}
            isSelected={true}
          />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
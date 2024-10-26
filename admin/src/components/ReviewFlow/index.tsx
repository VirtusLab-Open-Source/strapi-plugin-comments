import { Button, Flex, IconButton, Modal } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { usePermissions } from '../../hooks/usePermissions';
import { DiscussionThreadItem } from '../DiscussionThreadItem';
import Lock from '../icons/lock';
import ReviewIcon from '../icons/review';
import { ReportReviewTable } from './ReportReviewTable';

type Props = {
  item: Comment;
};
export const ReviewFlow: FC<Props> = ({
  item,
}) => {
  const { canModerate, canAccessReports, canReviewReports } = usePermissions();
  const { blockedThread, reports } = item;
  const api = useAPI();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [blockButtonsDisabled, setBlockButtonsDisabled] = useState(blockedThread);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);


  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const hasAnySelectedItems = selectedItems.length > 0;

  const { reportMutation, commentMutation } = useCommentMutations({
    report: {
      resolveMultipleSuccess: () => {
        return queryClient.invalidateQueries({
          queryKey: api.comments.findAll.getKey(),
        });
      },
    },
  });

  const onBlockButtonsStateChange = (disabled: boolean) => setBlockButtonsDisabled(disabled);

  const onToggleModal = () => setIsModalVisible((prev) => !prev);

  const onOnClickBlockComment = async () => {
    await Promise.all([
      reportMutation.resolveAllAbuse.mutateAsync(item.id),
      commentMutation.block.mutateAsync(item.id),
    ]);
  };

  const onOnClickBlockThread = async () => {
    await Promise.all([
      commentMutation.blockThread.mutateAsync(item.id),
      reportMutation.resolveAllAbuseThread.mutateAsync(item.id),
    ]);
  };


  const onClickResolveSelected = async () => {
    reportMutation.resolveMultiple.mutate({
      id: item.id,
      reportIds: selectedItems,
    });
  };
  console.log('canReviewReports', canReviewReports);

  return (
    <Modal.Root open={isModalVisible} onOpenChange={onToggleModal}>
      <Modal.Trigger>
        {canReviewReports && reports?.length && (
          <IconButton
            label="Review"
          >
            <ReviewIcon />
          </IconButton>
        )}
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            Moderation: Review open reports
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <DiscussionThreadItem
            as="div"
            item={item}
            root
            preview
            isSelected={true}
          />
          <ReportReviewTable
            commentId={item.id}
            reports={reports || []}
            selectedItems={selectedItems}
            allowedActions={{ canAccessReports, canReviewReports, canModerate }}
            onBlockButtonsStateChange={onBlockButtonsStateChange}
            onSelectionChange={setSelectedItems}
          />
        </Modal.Body>
        <Modal.Footer>
          <Flex justifyContent="space-between" width="100%">
            <Button onClick={onToggleModal}>
              Cancel
            </Button>
            <Flex gap={1}>
              <Button
                onClick={canModerate ? onOnClickBlockComment : undefined}
                variant="danger-light"
                startIcon={<Lock />}
                disabled={blockButtonsDisabled}
              >
                Block comment
              </Button>
              {item.gotThread && (
                <Button
                  onClick={canModerate ? onOnClickBlockThread : undefined}
                  variant="danger"
                  startIcon={<Lock />}
                  disabled={blockButtonsDisabled}
                >
                  Block thread
                </Button>
              )}
              {hasAnySelectedItems && (
                <Button
                  onClick={onClickResolveSelected}
                  variant="success"
                  startIcon={<Check />}
                  disabled={blockButtonsDisabled}
                >
                  Resolve selected
                </Button>
              )}
            </Flex>
          </Flex>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>

  );
};
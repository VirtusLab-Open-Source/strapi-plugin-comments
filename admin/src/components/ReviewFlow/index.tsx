import { Button, Flex, IconButton, Modal } from '@strapi/design-system';
import { Check } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { AllowedActions } from '../../types';
import { DiscussionThreadItem } from '../DiscussionThreadItem';
import Lock from '../icons/lock';
import ReviewIcon from '../icons/review';
import { ReportReviewTable } from './ReportReviewTable';

type Props = {
  item: Comment;
  queryKey: string[];
  isAnyActionLoading: boolean;
  allowedActions: AllowedActions;
};
export const ReviewFlow: FC<Props> = ({
  item,
  allowedActions: { canModerate, canAccessReports, canReviewReports },
}) => {
  const { blockedThread, reports } = item;
  const api = useAPI();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [blockButtonsDisabled, setBlockButtonsDisabled] = useState(blockedThread);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);


  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();
  const hasAnySelectedItems = selectedItems.length > 0;

  const blockItemMutation = useMutation({
    mutationKey: ['blockItem', item.id],
    mutationFn: api.blockComment,
  });
  const blockThreadMutation = useMutation({
    mutationKey: ['blockThread', item.id],
    mutationFn: api.blockThread,
  });

  const resolveMultipleReportsMutation = useMutation({
    mutationKey: ['resolveMultipleReports', item.id],
    mutationFn: api.resolveMultipleReports,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: api.getCommentsKey(),
      });
    },
  });
  const resolveAllAbuseReportsForCommentMutation = useMutation({
    mutationKey: ['resolveAllAbuseReportsForComment', item.id],
    mutationFn: api.resolveAllAbuseReportsForComment,
  });
  const resolveAllAbuseReportsForThreadMutation = useMutation({
    mutationKey: ['resolveAllAbuseReportsForThread', item.id],
    mutationFn: api.resolveAllAbuseReportsForThread,
  });

  const onBlockButtonsStateChange = (disabled: boolean) => setBlockButtonsDisabled(disabled);

  const onToggleModal = () => setIsModalVisible((prev) => !prev);

  const onOnClickBlockComment = async () => {
    await Promise.all([
      resolveAllAbuseReportsForCommentMutation.mutateAsync(item.id),
      blockItemMutation.mutateAsync(item.id),
    ]);
  };

  const onOnClickBlockThread = async () => {
    await Promise.all([
      blockThreadMutation.mutateAsync(item.id),
      resolveAllAbuseReportsForThreadMutation.mutateAsync(item.id),
    ]);
  };


  const onClickResolveSelected = async () => {
    resolveMultipleReportsMutation.mutate({
      id: item.id,
      reportIds: selectedItems,
    });
  };

  return (
    <Modal.Root open={isModalVisible} onOpenChange={onToggleModal}>
      <Modal.Trigger>
        {canReviewReports && reports.length && (
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
            reports={reports}
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
import { Button, Flex, IconButton } from '@strapi/design-system';
import { Eye, Pencil, Plus, Trash } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isEmpty, isNil } from 'lodash';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutation } from '../../hooks/useCommentMutation';
import { usePermissions } from '../../hooks/usePermissions';
import { getMessage } from '../../utils';
import { COMMENT_STATUS } from '../../utils/constants';
import { ApproveFlow } from '../ApproveFlow';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { IconButtonGroup } from '../IconButtonGroup';
import Lock from '../icons/lock';
import UnlockIcon from '../icons/unlock';
import { ModeratorResponseModal } from '../ModeratorResponseModal';
import { ReviewFlow } from '../ReviewFlow';
import { DiscussionThreadItemProps } from './props';

export const ActionButton = styled(Button)<{ isSingle?: boolean }>(({ isSingle }) => {
  return {
    padding: '7px 16px',
    marginLeft: isSingle ? '0' : '.5rem',
    whiteSpace: 'nowrap',
  };
});


export const DiscussionThreadItemActions: FC<DiscussionThreadItemProps> = ({ item, pinned, preview }) => {
  const {
    id,
    blocked,
    removed,
    content,
    blockedThread,
    gotThread,
    // threadFirstItemId,
    reports = [],
    approvalStatus,
    author,
    isAdminComment,
  } = item;
  // TODO: replace with real user
  const user = { id: 1 };

  const api = useAPI();
  const { canModerate, canAccessReports, canReviewReports } = usePermissions();

  const navigate = useNavigate();
  const { toggleNotification } = useNotification();
  const queryClient = useQueryClient();

  const resolveAllAbuseReportsForThreadMutation = useMutation({
    mutationKey: ['resolveAllAbuseReportsForThread', id],
    mutationFn: api.resolveAllAbuseReportsForThread,
  });
  const {
    blockItemMutation,
    unBlockItemMutation,
    blockThreadMutation,
    unblockItemThreadMutation,
    deleteItemMutation,
  } = useCommentMutation(id, {});

  const isAdminAuthor = String(user?.id) === author?.id;

  const gotApprovalFlow = !isNil(approvalStatus);
  const needsApproval = !isAdminComment && gotApprovalFlow && approvalStatus === COMMENT_STATUS.PENDING;
  const isBlocked = blocked || blockedThread;
  const isRejected = gotApprovalFlow && approvalStatus === COMMENT_STATUS.REJECTED;
  const openReports = reports?.filter((_) => !_.resolved);
  const hasReports = !isEmpty(openReports);
  const reviewFlowEnabled =
    (canAccessReports || canReviewReports) && hasReports;
  const hasActiveThread =
    gotThread && !(removed || preview || pinned || blockedThread);
  const isStatusBadgeVisible = isBlocked || reviewFlowEnabled;

  const isLoading =
    unBlockItemMutation.isPending ||
    blockItemMutation.isPending ||
    blockThreadMutation.isPending ||
    unblockItemThreadMutation.isPending;

  const handleUnblockThreadClick = () => {
    unblockItemThreadMutation.mutate(id);
  };
  const handleUnblockClick = () => {
    unBlockItemMutation.mutate(id);
  };
  const handleDeleteClick = () => {
    deleteItemMutation.mutate(id);
  };
  const handleBlockConfirm = async () => {
    await blockItemMutation.mutateAsync(id);
  };
  const handleOnConfirm = async () => {
    await Promise.all([
      blockThreadMutation.mutateAsync(id),
      resolveAllAbuseReportsForThreadMutation.mutateAsync(id),
    ]);
  };
  const handleDrillDownClick = async () => {
    // TODO: navigate to thread
    // navigate(`/discussion/${threadFirstItemId}`);
  };

  if (removed || isRejected || !canModerate) {
    return (
      <Flex direction="row" marginLeft={1} alignItems="flex-start">
        <CommentStatusBadge
          item={item}
          canAccessReports={canAccessReports}
          hasReports={hasReports}
        />
      </Flex>
    );
  }

  const anyGroupButtonsVisible = needsApproval || reviewFlowEnabled || !blockedThread;
  const isBlockEnabled = !blockedThread && !(blocked || needsApproval);
  const isUnblockEnabled = !blockedThread && blocked;
  const isRemovable = !blockedThread && !blocked && isAdminAuthor;
  const isThreadStartEnabled = !hasActiveThread && !pinned && (!blockedThread && !blocked);

  return (
    <>
      <Flex direction="row" marginLeft={1} alignItems="flex-start">
        {isStatusBadgeVisible && (
          <CommentStatusBadge
            item={item}
            canAccessReports={canAccessReports}
            hasReports={hasReports}
          />
        )}
        {!blockedThread && (gotThread || pinned) && (
          <ConfirmationDialog
            title={getMessage(
              'page.details.actions.thread.block.confirmation.header',
            )}
            labelConfirm={getMessage(
              'page.details.actions.thread.block.confirmation.button.confirm',
            )}
            iconConfirm={<Lock />}
            onConfirm={handleOnConfirm}
            Trigger={({ onClick }) => (
              <ActionButton
                onClick={onClick}
                startIcon={<Lock />}
                loading={unblockItemThreadMutation.isPending}
                variant="danger"
              >
                {getMessage(
                  'page.details.actions.thread.block',
                  'Block thread',
                )}
              </ActionButton>
            )}>
            {getMessage(
              'page.details.actions.thread.block.confirmation.description',
            )}
          </ConfirmationDialog>
        )}
        {blockedThread && (gotThread || pinned) && (
          <ActionButton
            onClick={handleUnblockThreadClick}
            startIcon={<UnlockIcon />}
            loading={unblockItemThreadMutation.isPending}
            variant="success"
          >
            {getMessage(
              'page.details.actions.thread.unblock',
              'Unblock thread',
            )}
          </ActionButton>
        )}
        {anyGroupButtonsVisible && (
          <IconButtonGroup isSingle withMargin>
            {!isAdminComment && (<>
              {isBlockEnabled && (
                <ConfirmationDialog
                  title={getMessage(
                    'page.details.actions.comment.block.confirmation.header',
                  )}
                  labelConfirm={getMessage(
                    'page.details.actions.comment.block.confirmation.button.confirm',
                  )}
                  onConfirm={handleBlockConfirm}
                  Trigger={({ onClick }) => (
                    <IconButton
                      onClick={onClick}
                      loading={blockItemMutation.isPending}
                      icon={<Lock />}
                      label={getMessage(
                        'page.details.actions.comment.block',
                        'Block',
                      )}
                    />
                  )}>
                  {getMessage(
                    'page.details.actions.comment.block.confirmation.description',
                  )}
                </ConfirmationDialog>
              )}
              {isUnblockEnabled && (
                <IconButton
                  onClick={handleUnblockClick}
                  loading={unBlockItemMutation.isPending}
                  icon={<UnlockIcon />}
                  label={getMessage(
                    'page.details.actions.comment.unblock',
                    'Unblock',
                  )}
                />
              )}
            </>)}
            {needsApproval && (
              <ApproveFlow
                id={id}
                canModerate={canModerate}
                queryKey={api.getDetailsCommentKey(id)}
              />
            )}
            {isAdminAuthor && !isBlocked && (
              <ModeratorResponseModal
                content=""
                id={id}
                Icon={Pencil}
                title={getMessage(
                  'page.details.actions.thread.modal.update.comment',
                )}
              />
            )}
            {isRemovable && (
              <IconButton
                onClick={handleDeleteClick}
                loading={deleteItemMutation.isPending}
                icon={<Trash />}
                label={getMessage(
                  'page.details.actions.comment.delete',
                  'Delete comment',
                )}
              />
            )}
            <ReviewFlow
              item={item}
              queryKey={api.getDetailsCommentKey(id)}
              allowedActions={{
                canModerate,
                canAccessReports,
                canReviewReports,
              }}
              isAnyActionLoading={isLoading}
            />
          </IconButtonGroup>
        )}
        {hasActiveThread && (
          <IconButtonGroup isSingle withMargin>
            <IconButton
              onClick={handleDrillDownClick}
              icon={<Eye />}
              label={getMessage(
                'page.details.panel.discussion.nav.drilldown',
                'Drilldown thread',
              )}
              style={
                blocked && !blockedThread
                  ? { marginTop: '1px', marginRight: '.5rem' }
                  : {}
              }
            />
          </IconButtonGroup>
        )}
        {isThreadStartEnabled && (
          <IconButtonGroup isSingle withMargin>
            <ModeratorResponseModal
              content=""
              id={id}
              Icon={Plus}
              title={getMessage(
                'page.details.actions.thread.modal.start.thread',
              )}
            />
          </IconButtonGroup>
        )}
      </Flex>
    </>
  );
};
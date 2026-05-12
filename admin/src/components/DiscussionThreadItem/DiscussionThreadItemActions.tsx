import { Flex, IconButton } from '@strapi/design-system';
import { Eye, Pencil, Plus, Trash } from '@strapi/icons';
import { useQueryClient } from '@tanstack/react-query';
import { isEmpty, isNil } from 'lodash';
import { FC, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserContext } from '../../hooks/useUserContext';
import { getMessage, getUrl } from '../../utils';
import { COMMENT_STATUS } from '../../utils/constants';
import { ActionButton } from '../ActionButton';
import { ApproveFlow } from '../ApproveFlow';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { IconButtonGroup } from '../IconButtonGroup';
import Lock from '../icons/lock';
import UnlockIcon from '../icons/unlock';
import { ModeratorResponseModal } from '../ModeratorResponseModal';
import { ReviewFlow } from '../ReviewFlow';
import { DiscussionThreadItemProps } from './props';


export const DiscussionThreadItemActions: FC<DiscussionThreadItemProps> = ({ item, pinned, preview }) => {
  const {
    id,
    blocked,
    removed,
    content,
    blockedThread,
    gotThread,
    threadFirstItemId,
    reports = [],
    approvalStatus,
    author,
    isAdminComment,
  } = item;
  const user = useUserContext();
  const { id: selectedEntityId } = useParams<{ id: string }>();

  const api = useAPI();
  const { canModerate, canAccessReports, canReviewReports } = usePermissions();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    const detailsCommentKey = api.comments.findOne.getKey(selectedEntityId);
    console.log(detailsCommentKey)
    return queryClient.invalidateQueries({
      queryKey: detailsCommentKey,
      exact: false,
    });
  }, [queryClient, api.comments.findOne, selectedEntityId]);

  const { commentMutation, reportMutation } = useCommentMutations({
    comment: {
      blockSuccess: onSuccess,
      unBlockSuccess: onSuccess,
      blockThreadSuccess: onSuccess,
      unBlockThreadSuccess: onSuccess,
      deleteSuccess: onSuccess,
    },
  });

  const isAdminAuthor = String(user?.id) === author?.id;

  const gotApprovalFlow = !isNil(approvalStatus);
  const needsApproval = !isAdminComment && gotApprovalFlow && approvalStatus === COMMENT_STATUS.PENDING;
  const isBlocked = blocked || blockedThread;
  const isRejected = gotApprovalFlow && approvalStatus === COMMENT_STATUS.REJECTED;
  const openReports = reports?.filter((_) => !_.resolved);
  const hasReports = !isEmpty(openReports);
  const reviewFlowEnabled = (canAccessReports || canReviewReports) && hasReports;
  const hasActiveThread = gotThread && !(removed || preview || pinned || blockedThread);
  const isStatusBadgeVisible = isBlocked || reviewFlowEnabled;

  const handleUnblockThreadClick = () => {
    commentMutation.unBlockThread.mutate(id);
  };
  const handleUnblockClick = () => {
    commentMutation.unBlock.mutate(id);
  };
  const handleDeleteClick = () => {
    commentMutation.delete.mutate(id);
  };
  const handleBlockConfirm = async () => {
    await commentMutation.block.mutateAsync(id);
  };
  const handleOnConfirm = async () => {
    await Promise.all([
      commentMutation.blockThread.mutateAsync(id),
      reportMutation.resolveAllAbuseThread.mutateAsync(id),
    ]);
  };
  const handleDrillDownClick = async () => {
    if (threadFirstItemId) {
      navigate(getUrl(`discover/${threadFirstItemId}`));
    }
  };

  if (removed || isRejected || !canModerate) {
    return (
      <Flex direction="row" alignItems="flex-start">
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
    <Flex direction="row" alignItems="flex-start" justifyContent="flex-end" width={{ initial: '100%', medium: 'auto' }}>
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
          labelCancel={getMessage(
            'components.confirmation.dialog.button.cancel',
            'Cancel',
          )}
          iconConfirm={<Lock />}
          onConfirm={handleOnConfirm}
          Trigger={({ onClick }) => (
            <ActionButton
              onClick={onClick}
              startIcon={<Lock />}
              loading={commentMutation.unBlockThread.isPending}
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
          loading={commentMutation.unBlockThread.isPending}
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
          {!isAdminComment && (
            <>
              {isBlockEnabled && (
                <ConfirmationDialog
                  title={getMessage(
                    'page.details.actions.comment.block.confirmation.header',
                  )}
                  labelConfirm={getMessage(
                    'page.details.actions.comment.block.confirmation.button.confirm',
                  )}
                  labelCancel={getMessage(
                    'components.confirmation.dialog.button.cancel',
                    'Cancel',
                  )}
                  onConfirm={handleBlockConfirm}
                  Trigger={({ onClick }) => (
                    <IconButton
                      onClick={onClick}
                      loading={commentMutation.block.isPending}
                      label={getMessage('page.details.actions.comment.block')}
                    >
                      <Lock />
                    </IconButton>
                  )}
                >
                  {getMessage(
                    'page.details.actions.comment.block.confirmation.description',
                  )}
                </ConfirmationDialog>
              )}
              {isUnblockEnabled && (
                <IconButton
                  onClick={handleUnblockClick}
                  loading={commentMutation.block.isPending}
                  label={getMessage('page.details.actions.comment.unblock')}
                >
                  <UnlockIcon />
                </IconButton>
              )}
            </>
          )}
          {needsApproval && (
            <ApproveFlow
              id={id}
              canModerate={canModerate}
              queryKey={api.comments.findOne.getKey(id)}
            />
          )}
          {isAdminAuthor && !isBlocked && (
            <ModeratorResponseModal
              content={content}
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
              loading={commentMutation.delete.isPending}
              label={getMessage('page.details.actions.comment.delete')}
            >
              <Trash />
            </IconButton>
          )}
          <ReviewFlow
            item={item}
          />
        </IconButtonGroup>
      )}
      {hasActiveThread && (
        <IconButtonGroup isSingle withMargin>
          <IconButton
            onClick={handleDrillDownClick}
            label={getMessage('page.details.panel.discussion.nav.drilldown')}
            style={
              blocked && !blockedThread
                ? { marginTop: '1px', marginRight: '.5rem' }
                : {}
            }>
            <Eye />
          </IconButton>
        </IconButtonGroup>
      )}
      {isThreadStartEnabled && (
        <IconButtonGroup isSingle withMargin>
          <ModeratorResponseModal
            content=""
            id={id}
            Icon={Plus}
            title={getMessage('page.details.actions.thread.modal.start.thread')}
          />
        </IconButtonGroup>
      )}
    </Flex>
  );
};

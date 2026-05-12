import { Flex, IconButton, Link, Td, Tooltip, Tr, Typography } from '@strapi/design-system';
import { Eye, Trash } from '@strapi/icons';
import { useIsMobile } from '@strapi/strapi/admin';
import { useQueryClient } from '@tanstack/react-query';
import { isEmpty, isNil } from 'lodash';
import { FC, SyntheticEvent, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, useNavigate } from 'react-router-dom';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { useCommentMutations } from '../../hooks/useCommentMutations';
import { usePermissions } from '../../hooks/usePermissions';
import { getMessage } from '../../utils';
import { ApproveFlow } from '../ApproveFlow';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { IconButtonGroup } from '../IconButtonGroup';
import { ReviewFlow } from '../ReviewFlow';
import { UserAvatar } from '../UserAvatar';

type Props = {
  readonly item: Comment;
};
export const CommentRow: FC<Props> = ({ item }) => {
  const { canAccessReports, canModerate, canReviewReports } = usePermissions();
  const api = useAPI();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { formatDate } = useIntl();

  const hasReports = !isEmpty(item.reports?.filter((_) => !_.resolved));

  const reviewFlowEnabled = canAccessReports && hasReports && !(item.blocked || item.blockedThread);
  const gotApprovalFlow = !isNil(item.approvalStatus);

  const needsApproval = gotApprovalFlow && item.approvalStatus === 'PENDING';

  const onClickDetails = (id: number) => (evt: SyntheticEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    navigate(id.toString());
  };

  const contentTypeLink = useMemo(() => {
    const related = item.related;
    if (!related || typeof related === 'string') return null;

    const localeParam = related.locale ? `?plugins[i18n][locale]=${related.locale}` : '';

    return (
      <Tooltip label={related.title}>
        <Link
          width="100%"
          overflow="hidden"
          tag={NavLink}
          to={`/content-manager/collection-types/${related.uid}/${related.documentId}${localeParam}`}
        >
          {related.title}
        </Link>
      </Tooltip>
    );
  }, [item.related]);

  const { name, email, avatar } = item.author || {};

  const isMobile = useIsMobile();

  const onDeleteSuccess = useCallback(() => {
    return queryClient.invalidateQueries({
      queryKey: api.comments.findAll.getKey(),
      exact: false,
    });
  }, [api.comments.findAll, queryClient]);

  const { commentMutation } = useCommentMutations({
    comment: {
      deleteSuccess: onDeleteSuccess,
    },
  });

  const handleDeleteClick = () => {
    commentMutation.delete.mutate(item.id);
  };

  const shouldShowDeleteButton = canModerate && !item.removed;

  return (
    <Tr>
      <Td>
        <Typography>{item.id}</Typography>
      </Td>
      <Td maxWidth="200px">
        <Tooltip
          open={item.isAdminComment ? false : undefined}
          label={
            !item.isAdminComment
              ? email || getMessage('page.discover.table.header.author.email')
              : undefined
          }
          align="start"
          side="left"
        >
          <Flex gap={2} style={{ cursor: item.isAdminComment ? 'default' : 'help' }}>
            {item.author && !isMobile && (
              <UserAvatar name={name || ''} avatar={avatar} isAdminComment={item.isAdminComment} />
            )}
            <Typography ellipsis>{name || getMessage('components.author.unknown')}</Typography>
          </Flex>
        </Tooltip>
      </Td>
      <Td maxWidth="200px">
        <Typography ellipsis>{item.content}</Typography>
      </Td>
      <Td display={{ initial: 'none', large: 'table-cell' }}>
        {item.threadOf ? (
          <Link href={`discover/${item.threadOf.id}`} onClick={onClickDetails(item.threadOf.id)}>
            {getMessage(
              {
                id: 'page.discover.table.cell.thread',
                props: { id: item.threadOf.id },
              },
              '#' + item.threadOf.id
            )}
          </Link>
        ) : (
          '-'
        )}
      </Td>
      <Td maxWidth="200px">{contentTypeLink ?? '-'}</Td>
      <Td display={{ initial: 'none', large: 'table-cell' }}>
        <Typography>
          {formatDate(item.updatedAt || item.createdAt, {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </Typography>
      </Td>
      <Td>
        <CommentStatusBadge
          item={item}
          canAccessReports={canAccessReports}
          hasReports={hasReports}
        />
      </Td>
      <Td>
        <Flex direction="column" alignItems="flex-end">
          <IconButtonGroup isSingle={!(reviewFlowEnabled || (canModerate && needsApproval))}>
            {canModerate && needsApproval && (
              <ApproveFlow
                id={item.id}
                canModerate={canModerate}
                queryKey={api.comments.findAll.getKey()}
              />
            )}
            {canReviewReports && <ReviewFlow item={item} />}
            <IconButton
              onClick={onClickDetails(item.id)}
              label={getMessage('page.details.panel.discussion.nav.drilldown', 'View')}
            >
              <Eye />
            </IconButton>
            {shouldShowDeleteButton ? (
              <ConfirmationDialog
                title={getMessage('page.details.actions.comment.delete.confirmation.header')}
                labelConfirm={getMessage(
                  'page.details.actions.comment.delete.confirmation.button.confirm'
                )}
                labelCancel={getMessage(
                  'page.details.actions.comment.delete.confirmation.button.cancel'
                )}
                onConfirm={handleDeleteClick}
                Trigger={({ onClick }) => (
                  <IconButton
                    onClick={onClick}
                    loading={commentMutation.delete.isPending}
                    label={getMessage('page.details.actions.comment.delete', 'Delete')}
                  >
                    <Trash />
                  </IconButton>
                )}
              >
                {getMessage('page.details.actions.comment.delete.confirmation.description')}
              </ConfirmationDialog>
            ) : null}
          </IconButtonGroup>
        </Flex>
      </Td>
    </Tr>
  );
};

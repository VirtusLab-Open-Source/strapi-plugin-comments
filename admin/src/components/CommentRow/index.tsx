import { Flex, IconButton, Link, Td, Tooltip, Tr, Typography } from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import { isEmpty, isNil } from 'lodash';
import { FC, SyntheticEvent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { usePermissions } from '../../hooks/usePermissions';
import { getMessage } from '../../utils';
import { ApproveFlow } from '../ApproveFlow';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { IconButtonGroup } from '../IconButtonGroup';
import { ReviewFlow } from '../ReviewFlow';
import { UserAvatar } from '../UserAvatar';

type Props = {
  readonly item: Comment;
};
export const CommentRow: FC<Props> = ({ item }) => {
  const {
    canAccessReports,
    canModerate,
    canReviewReports,
  } = usePermissions();
  const api = useAPI();
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
    if (typeof related === 'string') return null;

    const localeParam = related.locale ? `?plugins[i18n][locale]=${related.locale}` : '';

    return (
      <Link href={`/admin/content-manager/collection-types/${related.uid}/${related.documentId}${localeParam}`}>
        {related.title}
      </Link>
    );
  }, [item.related]);

  const { name, email, avatar } = item.author || {};

  return (
    <Tr>
      <Td>
        <Typography>{item.id}</Typography>
      </Td>
      <Td>
        <Tooltip
          open={item.isAdminComment ? false : undefined}
          label={!item.isAdminComment ? email : undefined}
          align="start"
          side="left">
          <Flex gap={2} style={{ cursor: item.isAdminComment ? "default" : "help" }}>
            {item.author && (<UserAvatar
              name={name}
              avatar={avatar}
              isAdminComment={item.isAdminComment} />)}
            <Typography>{name || getMessage('components.author.unknown')}</Typography>
          </Flex>
        </Tooltip>
      </Td>
      <Td>
        <Typography ellipsis>{item.content}</Typography>
      </Td>
      <Td>
        {item.threadOf ? (
          <Link href={`discover/${item.threadOf.id}`} onClick={onClickDetails(item.threadOf.id)}>
            {getMessage(
              {
                id: 'page.discover.table.cell.thread',
                props: { id: item.threadOf.id },
              },
              '#' + item.threadOf.id,
            )}
          </Link>
        ) : '-'}
      </Td>
      <Td>
        {contentTypeLink}
      </Td>
      <Td>
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
              label="View"
            >
              <Eye />
            </IconButton>
          </IconButtonGroup>
        </Flex>
      </Td>
    </Tr>
  );
};

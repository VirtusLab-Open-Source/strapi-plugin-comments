import { Flex, IconButton, Link, Td, Tr } from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import { isEmpty, isNil } from 'lodash';
import { FC, SyntheticEvent } from 'react';
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

type Props = {
  readonly item: Comment;
};
export const CommentRow: FC<Props> = ({ item }) => {
  const {
    canAccessReports,
    canModerate,
    // TODO
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

  return (
    <Tr>
      <Td>{item.id}</Td>
      <Td>{item.author.name}</Td>
      <Td>{item.content}</Td>
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
        {typeof item.related !== 'string' && (
          <Link href={`/admin/content-manager/collection-types/${item.related.uid}/${item.related.documentId}`}>
            {item.related.title}
          </Link>
        )}
      </Td>
      <Td>
        {formatDate(item.updatedAt || item.createdAt, {
          dateStyle: 'long',
          timeStyle: 'short',
        })}
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

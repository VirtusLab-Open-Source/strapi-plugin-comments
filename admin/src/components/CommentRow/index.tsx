import { Flex, IconButton, Link, Td, Tr } from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import { isEmpty, isNil, noop } from 'lodash';
import { FC } from 'react';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { ApproveFlow } from '../ApproveFlow';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { IconButtonGroup } from '../IconButtonGroup';
import { ReviewFlow } from '../ReviewFlow';

type Props = {
  readonly item: Comment;
  readonly canAccessReports: boolean;
  readonly canModerate: boolean;
};
export const CommentRow: FC<Props> = ({ item, canModerate, canAccessReports }) => {
  const api = useAPI();

  const hasReports = !isEmpty(item.reports?.filter((_) => !_.resolved));

  const reviewFlowEnabled = canAccessReports && hasReports && !(item.blocked || item.blockedThread);
  const gotApprovalFlow = !isNil(item.approvalStatus);

  const needsApproval = gotApprovalFlow && item.approvalStatus === 'PENDING';

  return (
    <Tr>
      <Td>{item.id}</Td>
      <Td>{item.author.name}</Td>
      <Td>{item.content}</Td>
      <Td>
        {item.threadOf ? (
          <Link href={`discover/${item.threadOf.id}`}>
            {item.threadOf.content}
          </Link>
        ) : '-'}
      </Td>
      <Td>
        <Link href={`/admin/content-manager/collection-types/${item.related.uid}/${item.related.documentId}`}>
          {item.related.title}
        </Link>
      </Td>
      <Td>{item.updatedAt}</Td>
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
              // TODO: permissions
              <ApproveFlow
                id={item.id}
                canModerate={true}
              />
            )}
            {/* TODO: permissions */}
            <ReviewFlow
              item={item}
              queryKey={api.getCommentsKey()}
              isAnyActionLoading={false}
              allowedActions={{ canModerate: true, canAccessReports: true, canReviewReports: true }}
            />
            <IconButton
              onClick={noop}
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
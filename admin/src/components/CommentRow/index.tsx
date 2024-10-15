import * as designSystem from '@strapi/design-system';
import { Flex, IconButton, Link, Td, Tr } from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import { isEmpty, isNil, noop } from 'lodash';
import { FC } from 'react';
import { Comment } from '../../api/schemas';
import { ApproveFlow } from '../ApproveFlow';
import { IconButtonGroup } from '../IconButtonGroup';
import { ReviewFlow } from '../ReviewFlow';
import { Status } from '../Status';

export const CommentRow: FC<{ item: Comment, canAccessReports: boolean; canModerate: boolean }> = ({ item, canModerate, canAccessReports }) => {
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
        <Status
          item={item}
          canAccessReports={canAccessReports}
          hasReports={hasReports}
        />
      </Td>
      <Td>
        <Flex direction="column" alignItems="flex-end">
          <IconButtonGroup isSingle={!(reviewFlowEnabled || (canModerate && needsApproval))}>
            {(canModerate && needsApproval || true) && (
              <ApproveFlow
                id={item.id}
                canModerate={canModerate}
              />
            )}
            <ReviewFlow
              item={item}
              queryToInvalidate="comments"
              isAnyActionLoading={false}
              allowedActions={{ canModerate, canAccessReports, canReviewReports: false }}
            />
            <IconButton
              withTooltip={false}
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
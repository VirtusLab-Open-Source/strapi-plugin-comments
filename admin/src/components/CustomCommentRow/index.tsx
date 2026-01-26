import {
  Flex,
  IconButton,
  Link,
  Td,
  Tooltip,
  Tr,
  Typography
} from '@strapi/design-system';
import {Eye, Pencil} from '@strapi/icons';
import { isEmpty, isNil } from 'lodash';
import {FC, SyntheticEvent, useMemo} from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { usePermissions } from '../../hooks/usePermissions';
import { getMessage } from '../../utils';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { IconButtonGroup } from '../IconButtonGroup';
import { ReviewFlow } from '../ReviewFlow';
import { UserAvatar } from '../UserAvatar';
import { Rating } from "../Rating";
import {CustomApproveFlow} from '../CustomApproveFlow';
import * as React from 'react';
import {SingleLineContent} from '../SingleLineComponent/SingleLineContent';
import {MultiLineContent} from '../MultiLineContent/MultiLineContent';
import {CustomModeratorResponseModal} from '../CustomModeratorResponseModal';
import { pluginId } from '../../pluginId';

type Props = {
  readonly item: Comment;
};

export const CustomCommentRow: FC<Props> = ({ item }) => {
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
  const canApprove = item.approvalStatus !== 'APPROVED';
  const canReject = item.approvalStatus !== 'REJECTED';

  const onClickDetails = (id: number) => (evt: SyntheticEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    navigate(id.toString(), {
      replace: false,
    });
  };

  const contentTypeLink = useMemo(() => {
    const related = item.related;
    if (!related || typeof related === 'string') return null;

    const localeParam: string = related.locale ? `?plugins[i18n][locale]=${related.locale}` : '';

    const relatedName = () => {
      return related.titre ?? related.nom ?? related.siren ?? 'Voir le contenu';
    }

    return (
      <Tooltip label={relatedName()}>
        <Link
          width="100%"
          overflow="hidden"
          style={{ justifyContent:"end" }}
          target="_blank"
          href={`/admin/content-manager/collection-types/${related.uid}/${related.documentId}${localeParam}`}
        >
          <SingleLineContent>
            { relatedName() }
          </SingleLineContent>
        </Link>
      </Tooltip>
    );
  }, [item.related]);

  const threadLink = useMemo(() => {
    const threadOf = item.threadOf;
    if (!threadOf) return (<Flex width="100%"></Flex>);

    const replyToName = () => {
      return getMessage('page.common.item.status.reply.to') + ' ' + threadOf?.author?.name;
    }

    return (
      <Link
        width="100%"
        overflow="hidden"
        style={{ justifyContent:"start" }}
        target="_blank"
        href={('/admin/plugins/' + pluginId + '/discover/' + threadOf.id)}
      >
        <SingleLineContent>
          { replyToName() }
        </SingleLineContent>
      </Link>
    );
  }, [item.related]);

  const { name, email, avatar } = item.author || {};
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email ?? '');
    } catch (e) {
      console.log(e);
    }
  }
  const copyName = async () => {
    try {
      await navigator.clipboard.writeText(name ?? '');
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <Tr key={item.id} width="100%" height="auto">
      <Td>
        <Typography>{item.id}</Typography>
      </Td>
      <Td maxWidth="30%" minWidth="20%">
        <Flex direction="column" gap={2} alignItems="start">
          <Tooltip
            open={item.isAdminComment ? false : undefined}
            label={!item.isAdminComment ? item.author?.name || getMessage('page.discover.table.header.author.name') : undefined}
            align="start"
            side="left"
          >
            <Flex
              gap={2}
              style={{ cursor: item.isAdminComment ? 'default' : 'help' }}
              onClick={copyEmail}
            >
              {item.author && (
                <UserAvatar
                  name={name || ''}
                  avatar={avatar}
                  isAdminComment={item.isAdminComment}
                />
              )}
            </Flex>
          </Tooltip>
          <Tooltip
            open={item.isAdminComment ? false : undefined}
            label={!item.isAdminComment ? email || getMessage('page.discover.table.header.author.email') : undefined}
            align="start"
            side="left"
          >
            <SingleLineContent
              onClick={copyName}
              style={{ cursor: item.isAdminComment ? 'default' : 'copy' }}
            >
              {name || getMessage('components.author.unknown')}
            </SingleLineContent>
          </Tooltip>
        </Flex>
      </Td>
      <Td maxWidth="65%">
        <Flex
          direction="column"
          gap={2}
          justifyContent="flex-start"
          alignItems="end"
        >
          <Flex
            gap={2}
            justifyContent="space-beetween"
            width="100%"
          >
            {threadLink ?? ''}
            <Typography>
              <Rating item={item}></Rating>
            </Typography>
          </Flex>
          <MultiLineContent>{item.content}</MultiLineContent>
        </Flex>
      </Td>
      <Td>
        <Typography>
          {formatDate(item.updatedAt || item.createdAt, {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
        </Typography>
      </Td>
      <Td maxWidth="20%">
        <Flex
          direction="column"
          alignItems="end"
          gap={2}
        >
          <CommentStatusBadge
            item={item}
            canAccessReports={canAccessReports}
            hasReports={hasReports}
          />
          {contentTypeLink ?? '-'}
        </Flex>
      </Td>
      <Td>
        <Flex
          direction="column"
          alignItems="flex-end"
          gap={2}
        >
          <IconButtonGroup isSingle={!(reviewFlowEnabled || (canModerate && needsApproval))}>
            {canModerate && (
              <CustomApproveFlow
                id={item.id}
                canModerate={canModerate}
                queryKey={api.comments.findAll.getKey()}
                canApprove={needsApproval || canApprove}
                canReject={needsApproval || canReject}
              />
            )}
            <CustomModeratorResponseModal
              content={item.content}
              id={item.id}
              title={getMessage('page.details.actions.thread.modal.update.comment', 'Edit comment')}
              Icon={Pencil}/>
            {canReviewReports && (<ReviewFlow item={item} />)}
            <IconButton
              onClick={onClickDetails(item.id)}
              label={getMessage("page.details.filters.label", "View")}
            >
              <Eye />
            </IconButton>
          </IconButtonGroup>
        </Flex>
      </Td>
    </Tr>
  );
};

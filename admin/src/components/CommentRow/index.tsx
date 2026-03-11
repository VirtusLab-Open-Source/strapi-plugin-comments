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
import { NavLink, useNavigate } from 'react-router-dom';
import { Comment } from '../../api/schemas';
import { useAPI } from '../../hooks/useAPI';
import { usePermissions } from '../../hooks/usePermissions';
import { getMessage } from '../../utils';
import { CommentStatusBadge } from '../CommentStatusBadge';
import { IconButtonGroup } from '../IconButtonGroup';
import { ReviewFlow } from '../ReviewFlow';
import { UserAvatar } from '../UserAvatar';
import { useIsMobile } from '@strapi/strapi/admin';
import { Rating } from "../Rating";
import {ApproveFlow} from '../ApproveFlow';
import * as React from 'react';
import {SingleLineContent} from '../SingleLineComponent/SingleLineContent';
import {MultiLineContent} from '../MultiLineContent/MultiLineContent';
import {ModeratorResponseModal} from '../ModeratorResponseModal';
import { pluginId } from '../../pluginId';

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
          tag={NavLink}
          to={`/content-manager/collection-types/${related.uid}/${related.documentId}${localeParam}`}
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

  const isMobile = useIsMobile()

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
            side="left">
            <Flex gap={2} style={{ cursor: item.isAdminComment ? 'default' : 'help' }} onClick={copyName}>
              {item.author && !isMobile && (
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
              onClick={copyEmail}
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
      <Td  display={{ initial: 'none', large: 'table-cell' }}>
        <Flex
          direction="column"
          alignItems="flex-end"
          gap={2}
        >
          <Typography variant="pi">
            {formatDate(item.createdAt, {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </Typography>
          { item.lastExperience &&
              <Flex
                  direction="column"
                  alignItems="flex-end"
                  gap={2}
              >
                <Typography variant="pi" textColor="neutral600">
                  {getMessage(
                    'page.discover.table.header.lastExperience',
                    'Last experience'
                  )}
                </Typography>
                <Typography variant="pi" textColor="neutral600">
                  {formatDate(item.lastExperience, {
                    dateStyle: 'long',
                  })}
                </Typography>
              </Flex>
          }
        </Flex>
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
              <ApproveFlow
                id={item.id}
                canModerate={canModerate}
                canApprove={needsApproval || canApprove}
                canReject={needsApproval || canReject}
                queryKey={api.comments.findAll.getKey()}
              />
            )}
            <ModeratorResponseModal
              content={item.content}
              id={item.id}
              title={getMessage('page.details.actions.thread.modal.update.comment', 'Edit comment')}
              Icon={Pencil}/>
            {canReviewReports && (<ReviewFlow item={item} />)}
            <IconButton
              onClick={onClickDetails(item.id)}
              label={getMessage("page.details.panel.discussion.nav.drilldown", "View")}
            >
              <Eye />
            </IconButton>
          </IconButtonGroup>
        </Flex>
      </Td>
    </Tr>
  );
};

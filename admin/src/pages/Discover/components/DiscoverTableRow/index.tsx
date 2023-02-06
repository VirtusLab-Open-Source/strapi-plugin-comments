// TODO;
// @ts-nocheck

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";
import { isNil, isEmpty } from "lodash";
import { Flex } from "@strapi/design-system/Flex";
import { IconButton } from "@strapi/design-system/IconButton";
import { Link } from "@strapi/design-system/Link";
import { Stack } from "@strapi/design-system/Stack";
import { Tr, Td } from "@strapi/design-system/Table";
import { Typography } from "@strapi/design-system/Typography";
import {
  getMessage,
  getUrl,
  resolveCommentStatus,
  resolveCommentStatusColor,
} from "../../../../utils";
import { eye } from "../../../../components/icons";
import { TableLink } from "./styles";
import renderEntryTitle from "../../../../utils/renderEntryTitle";
import DiscussionThreadItemApprovalFlowActions from "../../../../components/DiscussionThreadItemApprovalFlowActions";
import StatusBadge from "../../../../components/StatusBadge";
import { IconButtonGroupStyled } from "../../../../components/IconButton/styles";
import DiscussionThreadItemReviewAction from "../../../../components/DiscussionThreadItemReviewAction";
import UserAvatar from "../../../../components/Avatar";

import sanitizeHtml from '../../../../components/PreviewWysiwyg/utils/satinizeHtml';
import md from "../../../../components/PreviewWysiwyg/utils/mdRenderer";

const DiscoverTableRow = ({
  config,
  item,
  allowedActions: { canModerate, canAccessReports, canReviewReports },
  onClick,
}) => {
  const { reports } = item;

  const { formatDate } = useIntl();

  const openReports = reports?.filter((_) => !_.resolved);
  const hasReports = !isEmpty(openReports);
  const reviewFlowEnabled =
    canAccessReports && hasReports && !(item.blocked || item.blockedThread);

  const handleClick = () => onClick();

  const renderStatus = (props) => {
    const status = resolveCommentStatus({ ...props, reviewFlowEnabled });
    const color = resolveCommentStatusColor(status);

    return (
      <StatusBadge
        backgroundColor={`${color}100`}
        textColor={`${color}700`}
        color={color}
      >
        {getMessage(
          {
            id: `page.common.item.status.${status}`,
            props: {
              count: openReports.length,
            },
          },
          status
        )}
      </StatusBadge>
    );
  };

  const renderEntryUrl = (entry) =>
    entry ? `/content-manager/collectionType/${entry.uid}/${entry.id}` : null;

  const renderDetailsUrl = (entry) => getUrl(`discover/${entry.id}`);

  const gotApprovalFlow = !isNil(item.approvalStatus);
  const needsApproval = gotApprovalFlow && item.approvalStatus === "PENDING";

  let actionItemsCount = 1;
  if (reviewFlowEnabled || needsApproval) {
    actionItemsCount = 2;
  }

  const {
    author,
    isAdminComment,
    id,
    content,
    threadOf,
    related,
    createdAt,
    updatedAt } = item;


  const sanitizedContent = useMemo(() => sanitizeHtml(md.render(content || ''), {
    allowedTags: [],
    allowedAttributes: {}
  }), [content]);

  return (
    <Tr key={id}>
      <Td>
        <Typography textColor="neutral800" fontWeight="bold">
          #{id}
        </Typography>
      </Td>
      <Td>
        <Stack size={2} horizontal>
          {author && (<UserAvatar avatar={author.avatar} name={author.name} isAdminComment={isAdminComment}/>)}
          <Typography textColor="neutral800" variant="pi">
            {author?.name || getMessage('compontents.author.unknown')}
          </Typography>
        </Stack>
      </Td>
      <Td style={{ maxWidth: "30vw" }}>
        <Typography textColor="neutral800" ellipsis>
          {sanitizedContent}
        </Typography>
      </Td>
      <Td>
        {threadOf?.id ? (
          <Link to={renderDetailsUrl(threadOf)}>
            {getMessage(
              {
                id: "page.discover.table.cell.thread",
                props: { id: threadOf.id },
              },
              "#" + threadOf.id
            )}
          </Link>
        ) : (
          "-"
        )}
      </Td>
      <Td style={{ maxWidth: "15vw" }}>
        {related ? (
          <TableLink to={renderEntryUrl(related)}>
            {renderEntryTitle(related, config)}
          </TableLink>
        ) : (
          "-"
        )}
      </Td>
      <Td>
        <Typography textColor="neutral800">
          {formatDate(updatedAt || createdAt, {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </Typography>
      </Td>
      <Td>
        <Typography textColor="neutral800">{renderStatus(item)}</Typography>
      </Td>
      <Td>
        <Flex direction="column" alignItems="flex-end">
          <IconButtonGroupStyled
            isSingle={!(reviewFlowEnabled || (canModerate && needsApproval))}
          >
            {canModerate && needsApproval && (
              <DiscussionThreadItemApprovalFlowActions
                id={id}
                allowedActions={{ canModerate }}
              />
            )}
            <DiscussionThreadItemReviewAction
              item={item}
              queryToInvalidate="get-data"
              allowedActions={{
                canModerate,
                canAccessReports,
                canReviewReports,
              }}
            />
            <IconButton
              onClick={handleClick}
              label={getMessage("page.discover.table.action.display")}
              icon={eye}
            />
          </IconButtonGroupStyled>
        </Flex>
      </Td>
    </Tr>
  );
};

DiscoverTableRow.propTypes = {
  config: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  allowedActions: PropTypes.shape({
    canModerate: PropTypes.bool,
    canAccessReports: PropTypes.bool,
    canReviewReports: PropTypes.bool,
  }),
  onClick: PropTypes.func.isRequired,
};

export default DiscoverTableRow;

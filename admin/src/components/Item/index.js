import React from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { isEmpty, isArray, first } from 'lodash';
import { generateSearchFromFilters } from 'strapi-helper-plugin';
import pluginId from '../../pluginId';
import CardWrapper from './CardWrapper';
import CardItem from './CardItem';
import ItemFooter from '../ItemFooter';
import ItemHeader from '../ItemHeader';
import useDataManager from '../../hooks/useDataManager';
import { APPROVAL_STATUS } from '../../utils/constants';

const Item = ({
  id,
  content,
  authorName,
  authorUser,
  created_at,
  updated_at,
  related,
  reports,
  blocked,
  blockedThread,
  isNew,
  removed,
  createdAt,
  updatedAt,
  relatedContentTypes,
  onApproveCommentClick,
  onRejectCommentClick,
  approvalStatus,
}) => {
  const { push } = useHistory();
  const { getSearchParams } = useDataManager();
  const { id: activeId } = useParams();
  const parsedId = typeof activeId === 'number' ? Number(activeId) : activeId;

  const onClick = e => {
    if (!e.target.href) {
      e.preventDefault();
      push({
        pathname: `/plugins/${pluginId}/display/${id}`,
        search: generateSearchFromFilters(getSearchParams()),
      });
    }
  };

  const isAbuseReported = !isEmpty(reports);
  const isPending =  approvalStatus === APPROVAL_STATUS.PENDING;
  const isItemHeaderDisplayed = blocked || blockedThread || isNew || removed || isAbuseReported || isPending;
  const headerProps = {
    blocked,
    blockedThread,
    isNew,
    isAbuseReported,
    isRemoved: removed,
    onApproveCommentClick,
    onRejectCommentClick,
    approvalStatus,
  };

  const footerProps = {
    authorName,
    authorUser,
    related: isArray(related) ? first(related) : related,
    created_at: created_at || createdAt,
    updated_at: updated_at || updatedAt,
    relatedContentTypes
  };

  return (
    <CardWrapper>
      <CardItem
        onClick={onClick}
        active={id === parsedId}
      >
        {isItemHeaderDisplayed && (<ItemHeader { ...headerProps } />) }
        <p>{content}</p>
        <ItemFooter {...footerProps} />
      </CardItem>
    </CardWrapper>
  );
};

Item.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  content: PropTypes.string.isRequired,
  authorName: PropTypes.string,
  authorUser: PropTypes.object,
  created_at: PropTypes.string.isRequired,
  updated_at: PropTypes.string,
  related: PropTypes.array,
  reports: PropTypes.array,
  blocked: PropTypes.bool,
  blockedThread: PropTypes.bool,
  isNew: PropTypes.bool,
  approvalStatus: PropTypes.oneOf([
    APPROVAL_STATUS.APPROVED,
    APPROVAL_STATUS.PENDING,
    APPROVAL_STATUS
  ]),
  onApproveCommentClick: PropTypes.func,
  onRejectCommentClick: PropTypes.func,
};

export default Item;

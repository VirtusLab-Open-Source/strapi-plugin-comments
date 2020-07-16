import React from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import { isEmpty, isArray, first } from 'lodash';
import pluginId from '../../pluginId';
import CardWrapper from './CardWrapper';
import CardItem from './CardItem';
import ItemFooter from '../ItemFooter';
import ItemHeader from '../ItemHeader';

const Item = ({ id, content, authorName, authorUser, created_at, updated_at, related, reports, blocked, blockedThread, isNew }) => {
  const { push } = useHistory();
  const { id: activeId } = useParams();
  const parsedId = activeId && parseInt(activeId, 10);

  const onClick = e => {
    e.preventDefault();
    push(`/plugins/${pluginId}/display/${id}`);
  };

  const isAbuseReported = !isEmpty(reports);
  const isItemHeaderDisplayed = blocked || blockedThread || isNew || isAbuseReported;
  const headerProps = {
    blocked,
    blockedThread,
    isNew,
    isAbuseReported,
  };

  const footerProps = {
    authorName,
    authorUser,
    related: isArray(related) ? first(related) : related,
    created_at,
    updated_at
  };

  return (
    <CardWrapper>
      <CardItem 
        onClick={onClick}
        active={id === parsedId}
      >
        { isItemHeaderDisplayed && (<ItemHeader { ...headerProps } />) }
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
};

export default Item;
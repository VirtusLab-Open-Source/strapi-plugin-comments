import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import CardItemRelation from './CardItemRelation';
import CardItemAuthor from './CardItemAuthor';
import Wrapper from './Wrapper';
import { isNil } from 'lodash';

const ENTITY_NAME_PARAMS = ['title', 'Title', 'subject', 'Subject', 'name', 'Name'];
const resolveEntityName = entity => ENTITY_NAME_PARAMS.map(_ => entity[_]).filter(_ => _)[0] || '';

const ItemFooter = ({ authorName, authorUser, related, created_at, isDetailedView }) => {
  const formatAuthor = () => {
    if (authorUser) {
      return authorUser.username;
    }
    return authorName;
  }
  
  const formatDateTime = () => {
    return moment(created_at).format("DD/MM/YYYY, HH:mm:ss");
  }

  const formatRelationType = () => !isNil(related) ? related.__contentType : '';

  const formatRelationName = () => !isNil(related) ? resolveEntityName(related) : '';

  return (
    <Wrapper>
      <CardItemAuthor>{ formatAuthor() } @ { formatDateTime() }</CardItemAuthor>
      { !isNil(related) && (<CardItemRelation title={!isDetailedView && formatRelationName()}>
          <FontAwesomeIcon icon={faLink} /> {isDetailedView ? `(${formatRelationType()}) ${formatRelationName()}` : formatRelationType()}
        </CardItemRelation>)}
    </Wrapper>
  );
};

ItemFooter.propTypes = {
  authorName: PropTypes.string, 
  authorUser: PropTypes.object,  
  related: PropTypes.object, 
  created_at: PropTypes.string.isRequired, 
  isDetailedView: PropTypes.bool,
};

export default ItemFooter;
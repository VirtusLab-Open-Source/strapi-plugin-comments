import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import CardItemRelation from './CardItemRelation';
import CardItemAuthor from './CardItemAuthor';
import Wrapper from './Wrapper';
import { get, isNil, isObject, kebabCase, startCase } from 'lodash';
import { Link } from 'react-router-dom';

const ENTITY_NAME_PARAMS = ['title', 'Title', 'subject', 'Subject', 'name', 'Name'];

const getLink = (to, contentType) => (
  <Link to={`${to}`}>
    {startCase(contentType)}
  </Link>
);

const getContentTypeLink = (name) => `application::${name}.${name}`;

const resolveEntityName = entity => ENTITY_NAME_PARAMS.map(_ => entity[_]).filter(_ => _)[0] || '';

const ItemFooter = ({ authorName, authorUser, related, created_at, isDetailedView, relations }) => {
  const formatAuthor = () => {
    if (authorUser) {
      return authorUser.username;
    }
    return authorName;
  };

  const formatDateTime = () => {
    return moment(created_at).format('DD/MM/YYYY, HH:mm:ss');
  };

  const relatedExist = useMemo(() => !isNil(related) && isObject(related), [related]);

  const formatRelationType = () => {
    if (relatedExist) {
      const { id, __contentType: contentType } = related;
      const name = kebabCase(contentType);
      const relation = get(relations, name);
      if (relation && relation.contentManager) {
        const contentManagerRoot = `/plugins/content-manager`;
        if (relation.isSingle) {
          return getLink(
            relation.url || `${contentManagerRoot}/singleType/${getContentTypeLink(name)}`,
            related.__contentType,
          );
        } else if (relation.url) {
          const url = `${relation.url.replace(':id', id)}'?_sort=id:ASC&_where[0][id]=${id}`;
          return getLink(url, related.__contentType);
        } else {
          const url = `${contentManagerRoot}/collectionType/${getContentTypeLink(name)}?_sort=id:ASC&_where[0][id]=${id}`;
          return getLink(url, related.__contentType);
        }
      }
      return startCase(related.__contentType);
    }
    return '';
  };

  const formatRelationName = () => relatedExist ? resolveEntityName(related) : '';

  return (
    <Wrapper>
      <CardItemAuthor>{formatAuthor()} @ {formatDateTime()}</CardItemAuthor>
      {!isNil(related) && (
        <CardItemRelation title={!isDetailedView && formatRelationName()}>
          <FontAwesomeIcon icon={faLink} />
          {isDetailedView ? `(${formatRelationType()}) ${formatRelationName()}` : formatRelationType()}
        </CardItemRelation>
      )}
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

import React from 'react';
import PropTypes from 'prop-types';
import { useGlobalContext, CheckPermissions } from 'strapi-helper-plugin';
import { Button } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCommentSlash, faComments } from '@fortawesome/free-solid-svg-icons';
import Wrapper from './Wrapper';
import pluginId from '../../pluginId';
import pluginPermissions from '../../permissions';

const ItemModeration = ({ id, blocked, blockedThread, onBlockClick, onBlockThreadClick }) => {

  const { formatMessage } = useGlobalContext();

  return (
    <CheckPermissions permissions={pluginPermissions.moderate}>
      <Wrapper>
        { !blockedThread && (
          <CheckPermissions permissions={pluginPermissions.moderateComments}>
            <Button
              onClick={e => onBlockClick(id)}
              color={blocked ? 'primary' : 'delete'} 
              icon={<FontAwesomeIcon icon={blocked ? faComment : faCommentSlash} />} 
              label={formatMessage({ id: `${pluginId}.list.item.moderation.button.comment.${blocked ? 'restore' : 'hide'}` })} />
          </CheckPermissions>
        )}
        <CheckPermissions permissions={pluginPermissions.moderateThreads}>
          <Button 
            onClick={e => onBlockThreadClick(id)}
            color={blockedThread ? 'primary' : 'delete'} 
            icon={<FontAwesomeIcon icon={faComments} />} 
            label={formatMessage({ id: `${pluginId}.list.item.moderation.button.thread.${blockedThread ? 'restore' : 'hide'}` })} />
        </CheckPermissions>
      </Wrapper>
    </CheckPermissions>
  );
};

ItemModeration.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), 
  blocked: PropTypes.bool, 
  blockedThread: PropTypes.bool, 
  onBlockClick: PropTypes.func.isRequired, 
  onBlockThreadClick: PropTypes.func.isRequired,
};

export default ItemModeration;
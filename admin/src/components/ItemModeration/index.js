import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useGlobalContext, CheckPermissions } from 'strapi-helper-plugin';
import { Button } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCommentSlash, faComments, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Wrapper from './Wrapper';
import pluginId from '../../pluginId';
import pluginPermissions from '../../permissions';
import { APPROVAL_STATUS } from '../../utils/constants';

const ItemModeration = ({ id, blocked, blockedThread, onBlockClick, onBlockThreadClick, onApproveCommentClick, onRejectCommentClick, approvalStatus }) => {
  const { formatMessage } = useGlobalContext();
  const canBeApproved =
    approvalStatus === APPROVAL_STATUS.PENDING ||
    approvalStatus === APPROVAL_STATUS.REJECTED;
  const approvalButtonProps = useMemo(
    () =>
      canBeApproved
        ? {
            onClick: onApproveCommentClick.bind(null, id),
            color: 'primary',
            label: formatMessage({
              id: `${pluginId}.list.item.moderation.button.comment.approval.approve`,
            }),
          }
        : {
            onClick: onRejectCommentClick.bind(null, id),
            color: 'delete',
            label: formatMessage({
              id: `${pluginId}.list.item.moderation.button.comment.approval.reject`,
            }),
          },
    [canBeApproved, id],
  );

  return (
    <CheckPermissions permissions={pluginPermissions.moderate}>
      <Wrapper>
        {approvalStatus ? (
          <CheckPermissions permissions={pluginPermissions.moderateComments}>
            <Button
              {...approvalButtonProps}
              icon={<FontAwesomeIcon icon={faExclamationCircle} />}
            />
          </CheckPermissions>
        ) : null}
        {!blockedThread && (
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
  approvalStatus: PropTypes.oneOf([
    APPROVAL_STATUS.APPROVED,
    APPROVAL_STATUS.PENDING,
    APPROVAL_STATUS
  ]),
  onApproveCommentClick: PropTypes.func,
  onRejectCommentClick: PropTypes.func,
};

export default ItemModeration;
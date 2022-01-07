/**
 *
 * Entity Details
 *
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { isNil } from 'lodash';
import { Button } from '@strapi/design-system/Button';
import { Flex } from '@strapi/design-system/Flex';
import { IconButton } from '@strapi/design-system/IconButton';
import { Check, Cross } from '@strapi/icons';
import { useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { getMessage, handleAPIError } from '../../utils';
import { DiscussionThreadItemActionsBadge, DiscussionThreadItemActionsGroupWrapper, DiscussionThreadItemActionsWrapper } from './styles';
import ConfirmationDialog from '../ConfirmationDialog';
import { blockItem, blockItemThread, unblockItem, unblockItemThread } from '../../pages/Details/utils/api';
import pluginId from '../../pluginId';
import { LockIcon, UnlockIcon } from '../icons';

const DiscussionThreadItemActions = ({ id, blocked, blockedThread, gotThread, pinned, approvalStatus, root }) => {

    const [blockConfirmationVisible, setBlockConfirmationVisible] = useState(false);
    const [blockThreadConfirmationVisible, setBlockThreadConfirmationVisible] = useState(false);

    const toggleNotification = useNotification();
    const queryClient = useQueryClient();
    const { lockApp, unlockApp } = useOverlayBlocker();

    const onSuccess = (message, stateAction = () => {}) => async () => {
        await queryClient.invalidateQueries('get-details-data');
        toggleNotification({
            type: 'success',
            message: `${pluginId}.${message}`,
        });
        stateAction(false);
        unlockApp();
    };

    const onError = err => { handleAPIError(err, toggleNotification); };

    const blockItemMutation = useMutation(blockItem, {
        onSuccess: onSuccess(
            'page.details.actions.comment.block.confirmation.success', 
            setBlockConfirmationVisible
        ),
        onError,
        refetchActive: false,
    });
    const unblockItemMutation = useMutation(unblockItem, {
        onSuccess: onSuccess('page.details.actions.comment.unblock.confirmation.success'),
        onError,
        refetchActive: false,
    });
    const blockItemThreadMutation = useMutation(blockItemThread, {
        onSuccess: onSuccess(
            'page.details.actions.thread.block.confirmation.success', 
            setBlockThreadConfirmationVisible
        ),
        onError,
        refetchActive: false,
    });
    const unblockItemThreadMutation = useMutation(unblockItemThread, {
        onSuccess: onSuccess('page.details.actions.thread.unblock.confirmation.success'),
        onError,
        refetchActive: false,
    });

    const gotApprovalFlow = !isNil(approvalStatus);
    const needsApproval = gotApprovalFlow && (approvalStatus === 'PENDING');
    const isBlocked = blocked || blockedThread;

    const resolveStatusBadge = () => {
        let color = 'primary';
        let label = '';

        if (isBlocked) {
            color = 'danger';
            label = 'blocked';
        } else if (gotApprovalFlow) {
            label = approvalStatus.toLowerCase();
            switch (approvalStatus) {
                case 'APPROVED': 
                    color = 'success';
                    break;
                case 'REJECTED': 
                    color = 'danger';
                    break;
                default: 
                    color = 'alternative';
                    break;
            };
        }

        return {
            badgeVisible: isBlocked || gotApprovalFlow,
            badgeColor: color,
            badgeLabel: label,
        }
    }

    const {badgeVisible, badgeColor, badgeLabel } = resolveStatusBadge();

    const handleBlockClick = () => setBlockConfirmationVisible(true);
    const handleBlockConfirm = async () => {
        lockApp();
        blockItemMutation.mutate(id);
    };
    const handleBlockCancel = () => {
        setBlockConfirmationVisible(false);
    };
    const handleUnblockClick = async () => {
        lockApp();
        unblockItemMutation.mutate(id);
    };

    const handleBlockThreadClick = () => setBlockThreadConfirmationVisible(true);
    const handleBlockThreadConfirm = async () => {
        lockApp();
        blockItemThreadMutation.mutate(id);
    };
    const handleBlockThreadCancel = () => {
        setBlockThreadConfirmationVisible(false);
    };
    const handleUnblockThreadClick = async () => {
        lockApp();
        unblockItemThreadMutation.mutate(id);
    };

    return (<>
        <DiscussionThreadItemActionsWrapper as={Flex} direction="row">
            { badgeVisible && (<DiscussionThreadItemActionsBadge color={badgeColor} backgroundColor={`${badgeColor}100`} textColor={`${badgeColor}600`}>{getMessage(`page.details.panel.discussion.status.${badgeLabel}`, badgeLabel)}</DiscussionThreadItemActionsBadge>)}
            { !blockedThread && !(blocked || needsApproval) && (<IconButton onClick={handleBlockClick} loading={blockItemMutation.isLoading} icon={<LockIcon />} label={getMessage('page.details.actions.comment.block', 'Block')} style={(!blockedThread && root) ? { marginTop: '1px', marginRight: '.5rem' } : {}} />)}
            { !blockedThread && blocked && (<IconButton onClick={handleUnblockClick} loading={unblockItemMutation.isLoading} icon={<UnlockIcon />} label={getMessage('page.details.actions.comment.unblock', 'Unblock')} />)}
            { (!blockedThread && (gotThread || pinned)) && (<Button onClick={handleBlockThreadClick} startIcon={<LockIcon />} loading={blockItemThreadMutation.isLoading} variant="danger">{ getMessage('page.details.actions.thread.block', 'Block thread') }</Button>) }
            { (blockedThread && (gotThread || pinned)) && (<Button onClick={handleUnblockThreadClick} startIcon={<UnlockIcon />} loading={unblockItemThreadMutation.isLoading} variant="success">{ getMessage('page.details.actions.thread.unblock', 'Unblock thread') }</Button>) }
            { needsApproval && (<DiscussionThreadItemActionsGroupWrapper>
                <IconButton icon={<Check />} label={getMessage('page.details.actions.comment.approve', 'Approve')} />
                <IconButton icon={<Cross />} label={getMessage('page.details.actions.comment.reject', 'Reject')} />
            </DiscussionThreadItemActionsGroupWrapper>) }
        </DiscussionThreadItemActionsWrapper>
        { !blocked && (<ConfirmationDialog 
            isVisible={blockConfirmationVisible}
            isActionAsync={blockItemMutation.isLoading}
            header={getMessage('page.details.actions.comment.block.confirmation.header')}
            labelConfirm={getMessage('page.details.actions.comment.block.confirmation.button.confirm')}
            iconConfirm={<LockIcon />}
            onConfirm={handleBlockConfirm} 
            onCancel={handleBlockCancel}>
                { getMessage('page.details.actions.comment.block.confirmation.description') }
        </ConfirmationDialog>) }
        { (!blockedThread && root) && (<ConfirmationDialog 
            isVisible={blockThreadConfirmationVisible}
            isActionAsync={blockItemThreadMutation.isLoading}
            header={getMessage('page.details.actions.thread.block.confirmation.header')}
            labelConfirm={getMessage('page.details.actions.thread.block.confirmation.button.confirm')}
            iconConfirm={<LockIcon />}
            onConfirm={handleBlockThreadConfirm} 
            onCancel={handleBlockThreadCancel}>
                { getMessage('page.details.actions.thread.block.confirmation.description') }
        </ConfirmationDialog>) }
    </>);
};

DiscussionThreadItemActions.propTypes = {
    isRoot: PropTypes.bool,
    blocked: PropTypes.bool.isRequired,
    blockedThread: PropTypes.bool.isRequired,
    approvalStatus: PropTypes.oneOfType([PropTypes.nullable, PropTypes.oneOf(['PENDING', 'APPROVED', 'REJECTED'])]),
    onBlockClick: PropTypes.func.isRequired,
    onUnBlockClick: PropTypes.func.isRequired,
    onApprovalGroupClick: PropTypes.func.isRequired,
};

export default DiscussionThreadItemActions;
 
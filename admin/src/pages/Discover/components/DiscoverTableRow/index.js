import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { isNil, isEmpty } from 'lodash';
import { Avatar, Initials } from '@strapi/design-system/Avatar';
import { Flex } from '@strapi/design-system/Flex'; 
import { IconButton } from '@strapi/design-system/IconButton';
import { Link } from '@strapi/design-system/Link';
import { Stack } from '@strapi/design-system/Stack';
import { Tr, Td } from '@strapi/design-system/Table'; 
import { Typography } from '@strapi/design-system/Typography'; 
import { Eye } from '@strapi/icons';
import { useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { getMessage, getUrl, handleAPIError, renderInitials, resolveCommentStatus, resolveCommentStatusColor } from '../../../../utils';
import { blockItem, blockItemThread } from '../../../utils/api';
import pluginId from '../../../../pluginId';
import { ReviewIcon, LockIcon } from '../../../../components/icons';
import { TableLink } from './styles';
import renderEntryTitle from '../../../../utils/renderEntryTitle';
import DiscussionThreadItemApprovalFlowActions from '../../../../components/DiscussionThreadItemApprovalFlowActions';
import StatusBadge from '../../../../components/StatusBadge';
import { IconButtonGroupStyled } from '../../../../components/IconButton/styles';
import DiscussionThreadItemReviewAction from '../../../../components/DiscussionThreadItemReviewAction';

const DiscoverTableRow = ({ config, item, allowedActions: { canModerate, canAccessReports, canReviewReports }, onClick }) => {

    const { id, reports } = item;

    const [blockButtonsDisabled, setBlockButtonsDisabled] = useState(false);

    const { formatDate } = useIntl();
    const toggleNotification = useNotification();
    const queryClient = useQueryClient();
    const { lockApp, unlockApp } = useOverlayBlocker();

    const onSuccess = (message, stateAction = () => {}, indalidate = true) => async () => {
        if (indalidate) {
            await queryClient.invalidateQueries('get-data');
        }
        toggleNotification({
            type: 'success',
            message: `${pluginId}.${message}`,
        });
        stateAction(false);
        unlockApp();
    };

    const onError = err => { handleAPIError(err, toggleNotification); };

    const blockItemMutation = useMutation(blockItem, {
        onSuccess: onSuccess('page.details.actions.comment.block.confirmation.success'),
        onError,
        refetchActive: false,
    });
    const blockItemThreadMutation = useMutation(blockItemThread, {
        onSuccess: onSuccess('page.details.actions.thread.block.confirmation.success'),
        onError,
        refetchActive: false,
    });

    const handleBlockItemClick = async () => {
        if (canModerate) {
            lockApp();
            blockItemMutation.mutate(id);
        }
    };
    const handleBlockItemThreadClick = async () => {
        if (canModerate) {
            lockApp();
            blockItemThreadMutation.mutate(id);
        }
    };

    const handleBlockActionClick = async (mutation, onCallback) => {
        lockApp();
        await mutation.mutateAsync(id);
        onCallback();
    };

    const isLoading = blockItemMutation.isLoading || blockItemThreadMutation.isLoading;
    const openReports = reports?.filter(_ => !_.resolved);
    const hasReports = !isEmpty(openReports);
    const reviewFlowEnabled = (canAccessReports && hasReports) && !(item.blocked || item.blockedThread);

    const handleClick = () => onClick();
    const handleBlockButtonsStateChange = disabled => setBlockButtonsDisabled(disabled);

    const renderStatus = (props) => {
        const status = resolveCommentStatus({ ...props, reviewFlowEnabled });
        const color = resolveCommentStatusColor(status);
   
        return (<StatusBadge backgroundColor={`${color}100`} textColor={`${color}700`} color={color}>{ getMessage({
            id: `page.common.item.status.${status}`,
            props: {
                count: openReports.length
            }
        }, status) }</StatusBadge>);
      };
    
      const renderEntryUrl = entry => `/content-manager/collectionType/${entry.uid}/${entry.id}`;
      const renderDetailsUrl = entry => getUrl(`discover/${entry.id}`);

      const gotApprovalFlow = !isNil(item.approvalStatus);
      const needsApproval = gotApprovalFlow && (item.approvalStatus === 'PENDING');

      let actionItemsCount = 1;
      if(reviewFlowEnabled || needsApproval) {
        actionItemsCount = 2;
      }

    return (
        <Tr key={item.id}>
            <Td>
                <Typography textColor="neutral800" fontWeight="bold">#{ item.id }</Typography>
            </Td>
            <Td>
                <Stack size={2} horizontal>
                    { item.author?.avatar ? <Avatar src={item.author?.avatar} alt={item.author.name} /> : <Initials>{ renderInitials(item.author.name) }</Initials> }
                    <Typography textColor="neutral800" variant="pi">{ item.author.name }</Typography>
                </Stack>
            </Td>
            <Td style={{ maxWidth: '30vw' }}>
                <Typography textColor="neutral800" ellipsis>{item.content}</Typography>
            </Td>
            <Td>
                { item.threadOf?.id ? (<Link to={ renderDetailsUrl(item.threadOf) }>{ getMessage({
                    id: 'page.discover.table.cell.thread',
                    props: { id: item.threadOf.id },
                }, '#' + item.threadOf.id) }</Link>) : '-' }
            </Td>
            <Td style={{ maxWidth: '15vw' }}>
                <TableLink to={ renderEntryUrl(item.related) }>{ renderEntryTitle(item.related, config) }</TableLink>
            </Td>
            <Td>
                <Typography textColor="neutral800">{ formatDate(item.updatedAt || item.createdAt, { dateStyle: 'long', timeStyle: 'short' }) }</Typography>
            </Td>
            <Td>
                <Typography textColor="neutral800">{ renderStatus(item) }</Typography>
            </Td>
            <Td>
                <Flex direction="column" alignItems="flex-end">
                    <IconButtonGroupStyled isSingle={!(reviewFlowEnabled || (canModerate && needsApproval))}>
                        { (canModerate && needsApproval) &&  (
                        <DiscussionThreadItemApprovalFlowActions 
                            id={item.id} 
                            allowedActions={{ canModerate }}
                            queryToInvalidate="get-data" />
                        )}
                        <DiscussionThreadItemReviewAction
                            item={item}
                            queryToInvalidate="get-data"
                            areBlockButtonsDisabled={blockButtonsDisabled}
                            isLoading={isLoading}
                            allowedActions={{ canModerate, canAccessReports, canReviewReports }}
                            blockItemMutation={blockItemMutation}
                            blockItemThreadMutation={blockItemThreadMutation}
                            onBlockButtonsStateChange={handleBlockButtonsStateChange}
                            onBlockActionClick={handleBlockActionClick}
                        />
                        <IconButton onClick={handleClick} label={ getMessage('page.discover.table.action.display') } icon={<Eye />} />
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
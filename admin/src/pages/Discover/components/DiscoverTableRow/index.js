import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { isNil, isEmpty, orderBy } from 'lodash';
import { Badge } from '@strapi/design-system/Badge';
import { Box } from '@strapi/design-system/Box'; 
import { Button } from '@strapi/design-system/Button'; 
import { Divider } from '@strapi/design-system/Divider'; 
import { Flex } from '@strapi/design-system/Flex'; 
import { IconButton } from '@strapi/design-system/IconButton';
import { Link } from '@strapi/design-system/Link';
import { Stack } from '@strapi/design-system/Stack';
import { Tr, Td } from '@strapi/design-system/Table'; 
import { Typography } from '@strapi/design-system/Typography'; 
import { Eye } from '@strapi/icons';
import { useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { getMessage, getUrl, handleAPIError, resolveCommentStatus, resolveCommentStatusColor } from '../../../../utils';
import ReportsReviewModal from '../../../../components/ReportsReviewModal';
import ReportsReviewTable from '../../../../components/ReportsReviewTable';
import { blockItem, blockItemThread, resolveReport } from '../../../utils/api';
import pluginId from '../../../../pluginId';
import { ReviewIcon, LockIcon } from '../../../../components/icons';
import { TableLink } from './styles';
import renderEntryTitle from '../../../../utils/renderEntryTitle';
import DiscussionThreadItemApprovalFlowActions from '../../../../components/DiscussionThreadItemApprovalFlowActions';

const DiscoverTableRow = ({ config, item, allowedActions: { canModerate, canAccessReports, canReviewReports }, onClick }) => {

    const { id, reports } = item;

    const [reportsReviewVisible, setReportsReviewVisible] = useState(false);
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

    const resolveReportMutation = useMutation(resolveReport, {
        onSuccess: onSuccess('page.details.panel.discussion.warnings.reports.dialog.confirmation.success', () => {}, false),
        onError,
        refetchActive: false,
    });

    const blockItemMutation = useMutation(blockItem, {
        onSuccess: onSuccess(
            'page.details.actions.comment.block.confirmation.success', 
            setReportsReviewVisible
        ),
        onError,
        refetchActive: false,
    });
    const blockItemThreadMutation = useMutation(blockItemThread, {
        onSuccess: onSuccess(
            'page.details.actions.thread.block.confirmation.success', 
            setReportsReviewVisible
        ),
        onError,
        refetchActive: false,
    });

    const handleReportsReviewClick = () => {
        if (canAccessReports) {
            setReportsReviewVisible(true);
        }
    };
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
    const handleReportsReviewClose = async () => {
        await queryClient.invalidateQueries('get-data');
        setReportsReviewVisible(false);
    };

    const isLoading = blockItemMutation.isLoading || blockItemThreadMutation.isLoading || resolveReportMutation.isLoading;
    const openReports = reports?.filter(_ => !_.resolved);
    const hasReports = !isEmpty(openReports);
    const reviewFlowEnabled = (canAccessReports && hasReports) && !(item.blocked || item.blockedThread);

    const handleClick = () => onClick();
    const handleBlockButtonsStateChange = disabled => setBlockButtonsDisabled(disabled);

    const renderStatus = (props) => {
        const status = resolveCommentStatus({ ...props, reviewFlowEnabled });
        const color = resolveCommentStatusColor(status);
   
        return (<Badge backgroundColor={`${color}100`} textColor={`${color}600`}>{ getMessage({
            id: `page.common.item.status.${status}`,
            props: {
                count: openReports.length
            }
        }, status) }</Badge>);
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
                    <Stack size={actionItemsCount} horizontal>
                        { reviewFlowEnabled && (<IconButton onClick={handleReportsReviewClick} label={ getMessage('page.discover.table.reports.review') } icon={<ReviewIcon />} />)}
                        { (canModerate && needsApproval) &&  (
                        <DiscussionThreadItemApprovalFlowActions 
                            id={item.id} 
                            allowedActions={{ canModerate }}
                            queryToInvalidate="get-data" />
                        )}
                        <IconButton onClick={handleClick} label={ getMessage('page.discover.table.action.display') } icon={<Eye />} />
                    </Stack>
                </Flex>
                { reviewFlowEnabled && (<ReportsReviewModal 
                    isVisible={reportsReviewVisible}
                    isActionAsync={isLoading}
                    allowedActions={{ canModerate, canAccessReports, canReviewReports }}
                    onClose={handleReportsReviewClose}
                    startActions={canModerate && (<>
                        <Button onClick={handleBlockItemClick} variant="danger-light" startIcon={<LockIcon />} disabled={blockButtonsDisabled}>
                            { getMessage(`page.details.actions.comment.block`, 'Block comment') }
                        </Button>
                        { item.gotThread && (<Button onClick={handleBlockItemThreadClick} variant="danger" startIcon={<LockIcon />} disabled={blockButtonsDisabled}>
                            { getMessage(`page.details.actions.thread.block`, 'Block thread') }
                        </Button>) }
                    </>)}
                    item={item}>
                        <Typography variant="sigma" textColor="neutral600" id="reports-list">
                            { getMessage('page.details.panel.discussion.warnings.reports.list', 'List') }
                        </Typography>
                        <Box paddingTop={2} paddingBottom={6}>
                            <Divider />
                        </Box>
                        <ReportsReviewTable
                                commentId={item.id} 
                                items={orderBy(reports, ['resolved', 'createdAt'], ['DESC', 'DESC'])} 
                                mutation={resolveReportMutation}
                                allowedActions={{ canAccessReports, canReviewReports }}
                                onBlockButtonsStateChange={handleBlockButtonsStateChange}
                            />
                </ReportsReviewModal>) }
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
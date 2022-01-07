import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useMutation, useQueryClient } from 'react-query';
import { first, isEmpty, orderBy } from 'lodash';
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
import { Eye, Lock } from '@strapi/icons';
import { useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { getMessage, handleAPIError } from '../../../../utils';
import { COMMENT_STATUS } from '../../../../utils/constants';
import ReportsReviewModal from '../../../../components/ReportsReviewModal';
import ReportsReviewTable from '../../../../components/ReportsReviewTable';
import { blockItem, blockItemThread, resolveReport } from '../../../Details/utils/api';
import pluginId from '../../../../pluginId';
import { ReviewIcon, LockIcon } from '../../../../components/icons';

const DiscoverTableRow = ({ config, item, onClick }) => {

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

    const handleReportsReviewClick = () => setReportsReviewVisible(true);
    const handleBlockItemClick = async () => {
        lockApp();
        blockItemMutation.mutate(id);
    };
    const handleBlockItemThreadClick = async () => {
        lockApp();
        blockItemThreadMutation.mutate(id);
    };
    const handleReportsReviewClose = async () => {
        await queryClient.invalidateQueries('get-data');
        setReportsReviewVisible(false);
    };

    const isLoading = blockItemMutation.isLoading || blockItemThreadMutation.isLoading || resolveReportMutation.isLoading;
    const openReports = reports?.filter(_ => !_.resolved);
    const hasReports = !isEmpty(openReports);
    const reviewFlowEnabled = hasReports && !(item.blocked || item.blockedThread);

    const handleClick = () => onClick();
    const handleBlockButtonsStateChange = disabled => setBlockButtonsDisabled(disabled);

    const renderStatus = ({ blocked, blockedThread }) => {
        let status = blocked || blockedThread ? COMMENT_STATUS.BLOCKED : COMMENT_STATUS.OPEN;
        if (reviewFlowEnabled) {
            status = COMMENT_STATUS.TO_REVIEW;
        }
        let color = 'secondary';
        switch (status) {
            case COMMENT_STATUS.OPEN:
                color = 'success';
                break;
            case COMMENT_STATUS.TO_REVIEW:
                color = 'warning';
                break;
            case COMMENT_STATUS.BLOCKED:
                color = 'danger';
                break;
        };
        return (<Badge backgroundColor={`${color}100`} textColor={`${color}600`}>{ getMessage({
            id: `page.discover.table.header.status.${status}`,
            props: {
                count: openReports.length
            }
        }, status) }</Badge>);
      };
    
      const renderEntryTitle = entry => {
        const { entryLabel } = config;
        const rule = entry.uid in entryLabel ? entryLabel[entry.uid] : entryLabel['*'];
        return first(
          Object.keys(entry)
            .filter(_ => (rule === _) || rule.includes(_))
            .map(_ => entry[_])
            .filter(_ => _)
        );
      };
    
      const renderEntryUrl = entry => `/content-manager/collectionType/${entry.uid}/${entry.id}`;

    return (
        <Tr key={item.id}>
            <Td style={{ maxWidth: '40vw' }}>
                <Typography textColor="neutral800" ellipsis>{item.content}</Typography>
            </Td>
            <Td>
                <Typography textColor="neutral800">{item.threadOf?.id || '-'}</Typography>
            </Td>
            <Td>
                <Link to={ renderEntryUrl(item.related) }>{ renderEntryTitle(item.related) }</Link>
            </Td>
            <Td>
                <Typography textColor="neutral800">{ formatDate(item.updatedAt || item.createdAt, { dateStyle: 'long', timeStyle: 'short' }) }</Typography>
            </Td>
            <Td>
                <Typography textColor="neutral800">{ renderStatus(item) }</Typography>
            </Td>
            <Td>
                <Flex direction="column" alignItems="flex-end">
                    <Stack size={reviewFlowEnabled ? 2 : 1} horizontal>
                        { reviewFlowEnabled && (<IconButton onClick={handleReportsReviewClick} label={ getMessage('page.discover.table.reports.review') } icon={<ReviewIcon />} />)}
                        <IconButton onClick={handleClick} label={ getMessage('page.discover.table.action.display') } icon={<Eye />} />
                    </Stack>
                </Flex>
                { reviewFlowEnabled && (<ReportsReviewModal 
                    isVisible={reportsReviewVisible}
                    isActionAsync={isLoading}
                    onClose={handleReportsReviewClose}
                    startActions={<>
                        <Button onClick={handleBlockItemClick} variant="danger-light" startIcon={<LockIcon />} disabled={blockButtonsDisabled}>
                            { getMessage(`page.details.actions.comment.block`, 'Block comment') }
                        </Button>
                        { item.gotThread && (<Button onClick={handleBlockItemThreadClick} variant="danger" startIcon={<LockIcon />} disabled={blockButtonsDisabled}>
                            { getMessage(`page.details.actions.thread.block`, 'Block thread') }
                        </Button>) }
                    </>}
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
    onClick: PropTypes.func.isRequired,
};

export default DiscoverTableRow;
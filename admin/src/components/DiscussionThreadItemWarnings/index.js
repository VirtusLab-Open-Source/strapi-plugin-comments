/**
 *
 * Entity Details
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from 'react-query';
import { isEmpty, orderBy } from 'lodash';
import { Badge } from '@strapi/design-system/Badge';
import { Box } from '@strapi/design-system/Box';
import { Button } from '@strapi/design-system/Button';
import { Divider } from '@strapi/design-system/Divider';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import { ArrowRight, Lock } from '@strapi/icons';
import { useNotification, useOverlayBlocker } from '@strapi/helper-plugin';
import { getMessage, handleAPIError } from '../../utils';
import { blockItem, blockItemThread, resolveReport } from '../../pages/Details/utils/api';
import { DiscussionThreadItemWarningsWrapper } from './styles';
import ReportsReviewModal from '../ReportsReviewModal';
import ReportsReviewTable from '../ReportsReviewTable';

const DiscussionThreadItemWarnings = (item) => {
    const { id, reports } = item;

    const [reportsReviewVisible, setReportsReviewVisible] = useState(false);

    const toggleNotification = useNotification();
    const queryClient = useQueryClient();
    const { lockApp, unlockApp } = useOverlayBlocker();

    const onSuccess = (message, stateAction = () => {}, indalidate = true) => async () => {
        if (indalidate) {
            await queryClient.invalidateQueries('get-details-data');
        }
        toggleNotification({
            type: 'success',
            message,
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
        await queryClient.invalidateQueries('get-details-data')
        setReportsReviewVisible(false);
    };

    const isLoading = blockItemMutation.isLoading || blockItemThreadMutation.isLoading || resolveReportMutation.isLoading;
    const openReports = reports?.filter(_ => !_.resolved);

    if (isEmpty(reports) || isEmpty(openReports)) {
        return null;
    }

    return (<>
        <DiscussionThreadItemWarningsWrapper as={Flex} direction="row" padding={2} background="danger100" borderColor="danger200" border={1} hasRadius>
            <Box as={Flex} paddingRight={2} direction="row" grow={1}>
                <Badge textColor="neutral0" backgroundColor="warning600">{ openReports.length }</Badge>
                <Box paddingLeft={2}>
                    <Typography textColor="warning600" fontWeight="bold">{getMessage(`page.details.panel.discussion.warnings.reports.description`, 'abuse reports')}</Typography>
                </Box>
            </Box>
            <Button onClick={handleReportsReviewClick} variant="ghost" endIcon={<ArrowRight />}>
                { getMessage(`page.details.actions.comment.report.review`, 'review') }
            </Button>
        </DiscussionThreadItemWarningsWrapper>
        <ReportsReviewModal 
            isVisible={reportsReviewVisible}
            isActionAsync={isLoading}
            onClose={handleReportsReviewClose}
            startActions={<>
                <Button onClick={handleBlockItemClick} variant="danger-light" startIcon={<Lock />}>
                    { getMessage(`page.details.actions.comment.block`, 'Block comment') }
                </Button>
                <Button onClick={handleBlockItemThreadClick} variant="danger" startIcon={<Lock />}>
                    { getMessage(`page.details.actions.thread.block`, 'Block thread') }
                </Button>
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
                />
        </ReportsReviewModal>
    </>);
};

DiscussionThreadItemWarnings.propTypes = {

};

export default DiscussionThreadItemWarnings;
 
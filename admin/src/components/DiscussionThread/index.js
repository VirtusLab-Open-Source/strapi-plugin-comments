/**
 *
 * Entity Details
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';
import { Box } from '@strapi/design-system/Box';
import { Divider } from '@strapi/design-system/Divider';
import { Flex } from '@strapi/design-system/Flex';
import { Link } from '@strapi/design-system/Link';
import { Typography } from '@strapi/design-system/Typography';
import { ArrowUp } from '@strapi/icons';
import DiscussionThreadItem from '../DiscussionThreadItem';
import { getMessage, getUrl } from '../../utils';
import LoadingIndicatorOverlay from '../LoadingIndicatorOverlay';
import { LoadingIndicatorContainer } from '../LoadingIndicatorOverlay/styles';

const DiscussionThread = ({ level = [], selected = {}, isReloading }) => {
    const rootThread = selected?.threadOf;
    return (<LoadingIndicatorContainer as={Box} padding={4}>
        { isReloading && <LoadingIndicatorOverlay />}
        <Flex as={Box} direction="row" justifyContent="space-between">
            <Typography variant="sigma" textColor="neutral600" id="entity-details">
                { getMessage('page.details.panel.discussion', 'Discussion') }
            </Typography>
            { rootThread && (<Link to={getUrl(`discover/${rootThread.id}`)} startIcon={<ArrowUp />}>
                        { getMessage('page.details.panel.discussion.nav.back') }
                    </Link>) }
        </Flex>
        <Box paddingTop={2} paddingBottom={6}>
            <Divider />
        </Box>
        <Flex as="ul" direction="column" alignItems="flex-start">
            { rootThread && (<DiscussionThreadItem {...rootThread} isThreadAuthor root pinned />) }
            { level.map(item => {
                const isSelected = selected.id === item.id;
                const isThreadAuthor = !isNil(selected?.threadOf?.authorId) && (selected?.threadOf?.authorId === item.authorId);
                return (<DiscussionThreadItem 
                    key={`comment-${item.id}`}
                    {...item} 
                    root={isNil(rootThread)}
                    blockedThread={rootThread?.blockedThread || item.blockedThread}
                    isSelected={isSelected} 
                    isThreadAuthor={isThreadAuthor} 
                />);
            })}
        </Flex>
    </LoadingIndicatorContainer>);
};

DiscussionThread.propTypes = {
    level: PropTypes.array.isRequired,
    selected: PropTypes.object.isRequired,
    isReloading: PropTypes.bool,
};

export default DiscussionThread;
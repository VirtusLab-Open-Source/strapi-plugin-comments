/**
 *
 * Entity Details
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';

const DiscussionThreadItemMeta = ({ authorName, authorEmail, createdAt, updatedAt }) => {

    const { formatDate } = useIntl();

    const dateTime = formatDate(updatedAt || createdAt, { dateStyle: 'short', timeStyle: 'short' });

    return (<Flex as={Box} paddingTop={2} direction="row" justifyContent="space-between">
        <Typography variant="pi" fontWeight="bold">{ authorName }</Typography>
        <Typography variant="pi">{ dateTime }</Typography>
    </Flex>);
};

DiscussionThreadItemMeta.propTypes = {

};

export default DiscussionThreadItemMeta;
 
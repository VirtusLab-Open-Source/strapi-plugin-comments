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
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';

const DiscussionThreadItemMeta = ({ author, createdAt, updatedAt }) => {

    const { formatDate } = useIntl();

    const dateTime = formatDate(updatedAt || createdAt, { dateStyle: 'short', timeStyle: 'short' });
    const { name } = author;

    return (<Flex as={Box} paddingTop={2} direction="row">
        <Stack size={2} horizontal style={{ flexGrow: 1, justifyContent: 'space-between'}}>
            <Typography variant="pi" fontWeight="bold">{ name }</Typography>
            <Typography variant="pi">{ dateTime }</Typography>
        </Stack>
    </Flex>);
};

DiscussionThreadItemMeta.propTypes = {
    author: PropTypes.shape({
        id: PropTypes.oneOfType(PropTypes.string, PropTypes.number).isRequired,
        name: PropTypes.string.isRequired,
        email: PropTypes.string,
        avatar: PropTypes.string,
    }).isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
};

export default DiscussionThreadItemMeta;
 
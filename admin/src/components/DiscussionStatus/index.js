/**
 *
 * Entity Details
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { isNil } from 'lodash';
import { Box } from '@strapi/design-system/Box';
import { Status } from '@strapi/design-system/Status';
import { Typography } from '@strapi/design-system/Typography';
import { getMessage } from '../../utils';

const DiscussionStatus = ({ blocked, blockedThread }) => {
    let variant = 'success';

    return (
        <Box styles={{ marginBottom: 10 }}>
            <Status variant={variant}>
                <Typography>
                    { getMessage('page.details.panel.status', 'Discussion is') } <Typography fontWeight="bold">{ getMessage('page.details.panel.open', 'OPEN') } </Typography>
                </Typography>
            </Status>
        </Box>);
};

DiscussionStatus.propTypes = {

};

export default DiscussionStatus;
 
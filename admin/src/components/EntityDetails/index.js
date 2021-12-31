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
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { getMessage } from '../../utils';

const EntityDetails = ({ data = {}, schema = {} }) => {
    const { attributes = {} } = schema;
    const keys = Object.keys(attributes);
    
    if (keys.length === 0) {
        return null;
    }

    const itemKeys = keys.filter(_ => (attributes[_].type === 'string') && !isNil(data[_]));

    return (<Box padding={4}>
        <Typography variant="sigma" textColor="neutral600" id="entity-details">
            { getMessage('page.details.panel.entity', 'Details') }
        </Typography>
        <Box paddingTop={2} paddingBottom={6}>
            <Divider />
        </Box>
        <Stack size={itemKeys.length}>
            {  itemKeys.map(_ => 
            (<Flex justifyContent="space-between">
                <Typography fontWeight="bold">
                    { _ }
                </Typography>
                <Typography>{ data[_] }</Typography>
            </Flex>))
            }
        </Stack>
    </Box>);
};

EntityDetails.propTypes = {
    data: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
};

export default EntityDetails;
 
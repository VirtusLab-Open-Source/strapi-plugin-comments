/**
 *
 * Entity Details
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { capitalize, isNil, first, take } from 'lodash';
import { Box } from '@strapi/design-system/Box';
import { Divider } from '@strapi/design-system/Divider';
import { Flex } from '@strapi/design-system/Flex';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';
import { getMessage } from '../../../../utils';

const DetailsEntity = ({ data = {}, schema = {}, config = {} }) => {
    const { entryLabel = {} } = config;
    const { attributes = {} } = schema;
    const keys = Object.keys(attributes);
    const entityLabelKey = first(entryLabel[data?.uid]);
    
    if (keys.length === 0) {
        return null;
    }

    const FIELDS_LIMIT = 5;
    const itemKeys = take(
        keys.filter(_ => (attributes[_].type === 'string') && !isNil(data[_]) && (_ !== entityLabelKey)),
        FIELDS_LIMIT
    );

    const formatLabel = label => label.split('_')
        .map(_ => capitalize(_))
        .join(' ');

    return (<Box padding={4}>
        <Typography variant="sigma" textColor="neutral600" id="entity-details">
            { getMessage('page.details.panel.entity', 'Details') }
        </Typography>
        <Box paddingTop={2} paddingBottom={6}>
            <Divider />
        </Box>
        <Stack size={itemKeys.length}>
            <Flex direction="column" alignItems="flex-start">
                <Typography fontWeight="bold">{ formatLabel(entityLabelKey) }</Typography>
                <Typography>{ data[entityLabelKey] }</Typography>
            </Flex>
            {  itemKeys.map(_ => 
                (<Flex direction="column" alignItems="flex-start">
                    <Typography fontWeight="bold">{ formatLabel(_) }</Typography>
                    <Typography>{ data[_] }</Typography>
                </Flex>))
            }
        </Stack>
    </Box>);
};

DetailsEntity.propTypes = {
    data: PropTypes.object.isRequired,
    schema: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
};

export default DetailsEntity;
 
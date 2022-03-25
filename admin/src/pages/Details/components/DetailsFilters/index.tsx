// @ts-nocheck

import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@strapi/design-system/Box'; 
import { Flex } from '@strapi/design-system/Flex'; 
import { Stack } from '@strapi/design-system/Stack';
import { Checkbox } from '@strapi/design-system/Checkbox';
import { getMessage } from '../../../../utils';

const DetailsFilters = ({ data, onChange }) => {

    const { removed = false } = data;

    const handleOnChange = (prop, value) => onChange({
        ...data,
        [prop]: !value ? undefined : value,
    });

    return (<Box as={Flex}>
        <Stack size={2} vertical>
            <Checkbox 
                checked={removed} 
                onChange={() => handleOnChange('removed', !removed)} 
                visibleLabels>
                    { getMessage('page.details.filters.removed.label', 'Show removed comments') }
                </Checkbox>
        </Stack>
    </Box>);
};

DetailsFilters.propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default DetailsFilters;
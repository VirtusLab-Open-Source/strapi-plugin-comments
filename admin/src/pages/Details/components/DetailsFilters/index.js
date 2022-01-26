import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@strapi/design-system/Box'; 
import { Flex } from '@strapi/design-system/Flex'; 
import { Stack } from '@strapi/design-system/Stack';
import { Switch } from '@strapi/design-system/Switch';
import { Typography } from '@strapi/design-system/Typography'; 
import { getMessage } from '../../../../utils';

const DetailsFilters = ({ data, onChange }) => {

    const { removed = false } = data;

    const handleOnChange = (prop, value) => onChange({
        ...data,
        [prop]: !value ? undefined : value,
    });

    return (<Box as={Flex}>
        <Stack size={2} horizontal>
            <Typography variant="epsilon">{getMessage('page.details.filters.label', '')}</Typography>
            <Switch 
                label={getMessage('page.details.filters.removed.label', 'Comments visibility')} 
                onLabel={getMessage('page.details.filters.removed.show', 'Show')} 
                offLabel={getMessage('page.details.filters.removed.hide', 'Hide')}
                selected={removed} onChange={() => handleOnChange('removed', !removed)} 
                visibleLabels />
        </Stack>
    </Box>);
};

DetailsFilters.propTypes = {
    data: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default DetailsFilters;
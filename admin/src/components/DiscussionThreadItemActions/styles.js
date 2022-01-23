import styled from 'styled-components';
import { Box } from '@strapi/design-system/Box';
import { Badge } from '@strapi/design-system/Badge';
import { IconButtonGroup } from '@strapi/design-system/IconButton';

export const DiscussionThreadItemActionsBadge = styled(Badge)`
    border: 1px ${ ({ theme, color }) => theme.colors[`${color}200`] } solid;
`;

export const DiscussionThreadItemActionsWrapper = styled(Box)`
    margin-left: 1rem;
    align-items: start;

    ${DiscussionThreadItemActionsBadge} {
        margin-top: .175rem;
        margin-right: .5rem;
    }
`;
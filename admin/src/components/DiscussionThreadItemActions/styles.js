import styled from 'styled-components';
import { Box } from '@strapi/design-system/Box';
import { StatusBadge } from '../StatusBadge/styles';

export const DiscussionThreadItemActionsWrapper = styled(Box)`
    margin-left: 1rem;
    align-items: start;

    ${StatusBadge} {
        margin-top: .05rem;
    }
`;
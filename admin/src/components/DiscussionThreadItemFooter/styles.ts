// @ts-nocheck

import styled from 'styled-components';
import { Flex } from '@strapi/design-system/Flex';
import { Stack } from '@strapi/design-system/Stack';

export const DiscussionThreadItemFooterStyled = styled(Flex)`
    width: 100%;
`;

export const DiscussionThreadItemFooterMeta = styled(Stack)`
    * + * {
        margin-left: 8px;
    }
`;
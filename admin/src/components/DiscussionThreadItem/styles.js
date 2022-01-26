import styled from 'styled-components';
import { Box } from '@strapi/design-system/Box';
import { Flex } from '@strapi/design-system/Flex';

export const AvatarWrapper = styled(Box)``;
export const InitialsWrapper = styled(Box)``;

export const DiscussionThreadItemLinkBox = styled(Flex)`
    width: 100%;
    margin-top: .5rem;
    margin-bottom: .5rem;
`

const DiscussionThreadItemStyled = styled(Box)`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 1rem;

    ${AvatarWrapper},
    ${InitialsWrapper} {
        align-self: flex-start;
        margin-top: .4rem;
    }
`;

export const DiscussionThreadItemContent = styled(Box)`
    max-width: 45%;
`;

export const DiscussionThreadItemLeft = styled(DiscussionThreadItemStyled)`
    align-items: flex-start;
    padding-left: 4rem;
    text-align: left;

    ${DiscussionThreadItemContent} {
        align-self: flex-start;
    }

    ${AvatarWrapper},
    ${InitialsWrapper} {
        margin-right: 1rem;
    }
`;

export const DiscussionThreadItemRight = styled(DiscussionThreadItemStyled)`
    align-items: flex-end;
    padding-right: 4rem;
    text-align: left;

    ${DiscussionThreadItemContent} {
        align-self: flex-end;
        flex-direction: row-reverse;
    }

    ${AvatarWrapper},
    ${InitialsWrapper} {
        margin-left: 1rem;
    }

    ${DiscussionThreadItemLinkBox} {
        margin-right: 3rem;
    }
`;

export const DiscussionThreadItemBox = styled(Box)`
    
`;

export const DiscussionThreadItemBoxContent = styled(Box)`
    width: 100%;
    align-items: stretch;
`

export const DiscussionThreadItemRoot = styled(DiscussionThreadItemLeft)`
    padding-left: 0;
    padding-right: 0;


    ${DiscussionThreadItemContent} {
        width: 100%;
        max-width: 100%;
    }

    ${DiscussionThreadItemBox} {
        flex-grow: 1;
    }
`;
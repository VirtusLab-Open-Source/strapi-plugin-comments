import {styled} from 'styled-components';
import {Typography} from '@strapi/design-system';

export const SingleLineContent = styled(Typography)`
    text-wrap: wrap;
    word-break: break-all;
    overflow-wrap: break-word;
    hyphens: manual;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
`;
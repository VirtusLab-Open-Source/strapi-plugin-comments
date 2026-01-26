import {styled} from 'styled-components';
import {Typography} from '@strapi/design-system';

export const MultiLineContent = styled(Typography)`
    text-wrap: wrap;
    word-break: break-all;
    overflow-wrap: break-word;
    hyphens: manual;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
`;
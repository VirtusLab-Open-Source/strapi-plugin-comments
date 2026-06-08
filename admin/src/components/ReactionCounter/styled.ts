import styled from 'styled-components';

import { Badge } from '@strapi/design-system';

export const ReactionCounterContainer = styled(Badge)`
  width: 100%;
  cursor: default;

  & > span {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    width: 100%;
  }
`;

export const ReactionImage = styled.img`
  display: inline-block;
  max-width: 16px;
  max-height: 16px;
`;

export const ReactionEmoji = styled.span`
  display: inline-block;
`;

export const ReactionName = styled.span`
  display: inline-flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: flex-start;
  max-height: 16px;
  padding-left: 8px;
  overflow: hidden;

  span {
    display: inline-block;
    width: 100%;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const ReactionCounterDot = styled.span<{ theme: string }>`
  display: inline-flex;
  margin-left: 8px;
  align-content: center;
  justify-content: center;
  flex-wrap: wrap;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #ffffff;
`;

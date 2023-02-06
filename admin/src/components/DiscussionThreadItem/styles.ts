// TODO
// @ts-nocheck

import styled from "styled-components";
import { Box } from "@strapi/design-system/Box";

export const DiscussionThreadFullsize = styled(Box)`
  width: 100%;
`;
export const DiscussionThreadItemContent = styled(DiscussionThreadFullsize)`
  align-items: flex-start;
`;

export const DiscussionThreadItemContainer = styled(DiscussionThreadFullsize)`
  align-items: flex-start;
`;

export const DiscussionThreadItemContentTypographyRenderer = styled.div`
  strong {
    font-weight: bold;
  }

  i, em {
    font-style: italic;
  }

  u {
    font-style: underline;
  }
`

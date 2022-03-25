// @ts-nocheck

import styled from "styled-components";
import { Badge } from "@strapi/design-system/Badge";

export const StatusBadge = styled(Badge)`
  padding: 5px 8px;
  border: 1px ${({ theme, color }) => theme.colors[`${color}200`]} solid;

  overflow: hidden;

  text-overflow: ellipsis;

  cursor: default;

  span {
    text-transform: none;
  }
`;

// @ts-nocheck

import styled from "styled-components";
import { Button } from "@strapi/design-system/Button";

export const ActionButton = styled(Button)`
  padding: 7px 16px;
  margin-left: ${({ isSingle }) => (isSingle ? "0" : ".5rem")};

  white-space: nowrap;
`;

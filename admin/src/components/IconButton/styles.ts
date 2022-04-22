// @ts-nocheck

import styled from "styled-components";
import { IconButtonGroup } from "@strapi/design-system/IconButton";

export const IconButtonGroupStyled = styled(IconButtonGroup)`
  ${({ isSingle }) =>
    isSingle &&
    `
        span:first-child button {
            border-radius: 4px;
        }
    `}
  ${({ withMargin }) =>
    withMargin &&
    `
        margin-left: .5rem;
    `}
`;

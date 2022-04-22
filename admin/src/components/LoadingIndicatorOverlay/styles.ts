// @ts-nocheck
import styled from "styled-components";
import { Box } from "@strapi/design-system/Box";

export const LoadingIndicatorOverlayWrapper = styled(Box)`
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  z-index: 1;

  & > div {
    height: 100% !important;
  }
`;

export const LoadingIndicatorContainer = styled((props) => props.as)`
  position: relative;
`;

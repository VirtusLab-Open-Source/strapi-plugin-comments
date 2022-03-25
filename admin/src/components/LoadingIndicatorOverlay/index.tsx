/**
 *
 * Entity Details
 *
 */

// @ts-nocheck

import React from "react";
import { LoadingIndicatorPage } from "@strapi/helper-plugin";
import { LoadingIndicatorOverlayWrapper } from "./styles";

const LoadingIndicatorOverlay = () => (
  <LoadingIndicatorOverlayWrapper>
    <LoadingIndicatorPage />
  </LoadingIndicatorOverlayWrapper>
);

export default LoadingIndicatorOverlay;

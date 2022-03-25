/**
 *
 * Status badge
 *
 */

// @ts-nocheck

import React from "react";
import { Typography } from "@strapi/design-system/Typography";
import { StatusBadge as StatusBadgeStyled } from "./styles";

const StatusBadge = ({ children, textColor, ...rest }) => (
  <StatusBadgeStyled {...rest}>
    <Typography variant="omega" fontWeight="semibold" textColor={textColor}>
      {children}
    </Typography>
  </StatusBadgeStyled>
);

export default StatusBadge;

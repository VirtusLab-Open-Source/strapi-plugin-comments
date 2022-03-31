/**
 *
 * Form Switch
 *
 */

// @ts-nocheck

import React from "react";
import { Stack } from "@strapi/design-system/Stack";
import { Typography } from "@strapi/design-system/Typography";
import { StyledSwitch } from "./styles";

const FormSwitch = ({ label, hint, ...props }) => (
  <Stack size={1}>
    {label && (
      <Typography
        variant="pi"
        as="label"
        fontWeight="bold"
        textColor="neutral800"
      >
        {label}
      </Typography>
    )}
    <StyledSwitch label={label} {...props} />
    {hint && (
      <Typography variant="pi" as="label" textColor="neutral600">
        {hint}
      </Typography>
    )}
  </Stack>
);

export default FormSwitch;

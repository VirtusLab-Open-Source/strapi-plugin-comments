/*
 *
 * Hint
 *
 */

import React from 'react';
import { IntlShape, useIntl } from 'react-intl';
//@ts-ignore
import { Typography } from '@strapi/design-system/Typography';

type HintProps = 
  {description: {
    id: string,
    defaultMessage:string,
    values: {},
  } | undefined,
  error: string | undefined,
  id: string,
  name: string,
}

export const Hint: React.FC<HintProps> = ({ id, error, name, description }) => {
  const { formatMessage }: IntlShape = useIntl();
  const hint = description
    ? formatMessage(
        { id: description.id, defaultMessage: description.defaultMessage },
        { ...description.values }
      )
    : '';

  if (!hint || error) {
    return null;
  }

  return (
    <Typography
      as="p"
      variant="pi" 
      id={`${id || name}-hint`} 
      textColor="neutral600"
    >
      {hint}
    </Typography>
  );
};

export default Hint;

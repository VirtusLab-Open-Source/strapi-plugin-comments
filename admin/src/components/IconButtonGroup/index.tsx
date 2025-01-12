import { IconButtonGroup as IconButtonGroupBase } from '@strapi/design-system';
import styled from 'styled-components';

export const IconButtonGroup = styled(IconButtonGroupBase)<{ isSingle?: boolean; withMargin?: boolean }>(({ isSingle, withMargin }) => {
  const isSingleStyle = {
    button: {
      '&:first-child': {
        borderRadius: '4px !important',
      },
      '&:last-child': {
        borderRadius: '4px !important',
      },
    },
  };
  const withMarginStyle = {
    marginLeft: '.5rem',
  };
  return {
    ...(isSingle ? isSingleStyle : {}),
    ...(withMargin ? withMarginStyle : {}),
  };
});

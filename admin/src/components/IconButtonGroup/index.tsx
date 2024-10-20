import { IconButtonGroup as IconButtonGroupBase } from '@strapi/design-system';
import styled from 'styled-components';

export const IconButtonGroup = styled(IconButtonGroupBase)<{ isSingle?: boolean; withMargin?: boolean }>(({ isSingle, withMargin }) => {
  const isSingleStyle = {
    span: {
      '&:first-child button': {
        borderRadius: '4px',
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

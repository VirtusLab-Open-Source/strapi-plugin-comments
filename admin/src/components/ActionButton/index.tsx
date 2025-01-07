import { Button } from '@strapi/design-system';
import styled from 'styled-components';

export const ActionButton = styled(Button)<{ isSingle?: boolean }>(({ isSingle }) => {
  return {
    padding: '7px 16px',
    marginLeft: isSingle ? '0' : '.5rem',
    whiteSpace: 'nowrap',
  };
});
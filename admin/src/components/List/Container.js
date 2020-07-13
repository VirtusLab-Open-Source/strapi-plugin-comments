import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';

const Container = styled.ul`
  display: flex;
  padding: ${2*sizes.margin}px;
  flex-direction: column;
  flex-grow: 1;
  margin: 0;

  z-index: 0;

  overflow-x: hidden;
  overflow-y: auto;

  list-style: none;
`;

export default Container;

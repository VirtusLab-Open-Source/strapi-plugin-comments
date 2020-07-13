import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';

const CardLevelWrapper = styled.ul`
  padding: 0;
  margin: 0;

  list-style: none;

  position: relative;
  z-index: 1;

  ul {
    padding-left: 4rem;

    position: relative;
    z-index: 0;
  }
`;

export default CardLevelWrapper;

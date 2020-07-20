import styled from 'styled-components';

import { colors, sizes, darken } from 'strapi-helper-plugin';

const CardLevelCounterLink = styled.span`
  display: inline-block;
  margin-left: 1rem;

  color: ${colors.blue};

  transition: all .15s ease-in-out;

  &:hover {
    color: ${darken(colors.blue, 10)};

    cursor: pointer;
  }

  svg {
    margin-left: .5rem;
  }
`;

export default CardLevelCounterLink;

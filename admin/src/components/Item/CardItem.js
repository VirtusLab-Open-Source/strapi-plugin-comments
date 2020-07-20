import styled from 'styled-components';

import { Card } from '@buffetjs/styles';

import { colors, sizes } from 'strapi-helper-plugin';

const CardItem = styled(Card)`
  padding: 1rem;

  border-bottom: 2px ${props =>
    props.active ? colors.blue : 'tranparent'} solid;

  transition: all .15s ease-in-out;

  ${ props => !props.active && `
    &:hover {
      background-color: ${colors.lightGrey};

      transform: translateY(-.5rem);

      cursor: pointer;
    }
  `}

  p {
    margin-bottom: 0;
  }
`;

export default CardItem;

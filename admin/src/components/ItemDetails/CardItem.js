import styled from 'styled-components';

import { Card } from '@buffetjs/styles';

import { colors, sizes } from 'strapi-helper-plugin';

const CardItem = styled(Card)`
  padding: 1rem;

  color: ${props => props.active ? 'inherit' : colors.leftMenu.darkGrey};
  background: ${props => props.active ? '#ffffff' : colors.grey};

  transition: all .15s ease-in-out;

  ${props => props.root && props.clickable && `
    &:hover {
      color: ${colors.leftMenu.black};
      background: #ffffff;

      transform: translateY(-.5rem);

      cursor: pointer;
    }
  ` }

  p {
    margin-bottom: 0;
  }


`;

export default CardItem;
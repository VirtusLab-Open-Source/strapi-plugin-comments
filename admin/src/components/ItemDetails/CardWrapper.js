import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';
import CardItem from './CardItem';

const CardWrapper = styled.li`
  padding: 0;
  margin: 0 0 2rem 0;

  position: relative;
  z-index: 1;

  ${CardItem}:before {
    display: ${ props => props.root ? 'none' : 'block' };
    content: '';
    margin-top: -1px;

    height: 2px;
    width: 2rem;

    position: absolute;
    top: 50%;
    left: -2rem;
    z-index: -1;

    background-color: ${colors.relations.boxShadow};
  }

  &:after {
      display: ${ props => props.root ? 'none' : 'block' };
      content: '';
      margin-left: -1px;

      width: 2px;

      position: absolute;
      top: -2rem;
      bottom: 0;
      left: -2rem;
      z-index: -1;

      background-color: ${colors.relations.boxShadow};
    }

    &:last-child {
      &:after {
        bottom: ${props => props.active ? `calc(50% - 1px + 2rem)` : `calc(50% - 1px)`};
      }
    }
`;

export default CardWrapper;

import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';

const CardLevelCounter = styled.div`
  padding: 0 0 0 4rem;
  margin: 1rem;

  position: relative;

  font-weight: 500;
  font-size: 1.25rem;

  &:before {
    display: ${ props => props.root ? 'none' : 'block' };
    content: '';
    margin-top: -1px;

    height: 0;
    width: 2rem;

    position: absolute;
    top: 50%;
    left: 1rem;

    border-top: 2px ${colors.relations.boxShadow} dotted;
  }

  &:after {
      display: ${ props => props.root ? 'none' : 'block' };
      content: '';
      margin-left: -1px;

      width: 0;

      position: absolute;
      top: -1rem;
      bottom: calc(50% - 1px);
      left: 1rem;

      border-left: 2px ${colors.relations.boxShadow} dotted;
    }

`;

export default CardLevelCounter;

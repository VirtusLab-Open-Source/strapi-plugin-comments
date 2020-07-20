import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';

const FadedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0;
  margin: ${-2*sizes.margin}px;

  position: relative;
  z-index: 0;

  overflow: hidden;

  &:before,
  &:after {
    display: block;
    content: '';
    height: ${4*sizes.margin}px;

    position: absolute;
    left: 0;
    right: 0;
    z-index: 1;

    background: #ffffff;
  }

  &:before {
    top: 0;
    background: linear-gradient(180deg, rgba(250,250,251,1) 0%, rgba(250,250,251,0) 100%);
  }

  &:after {
    bottom: 0;
    background: linear-gradient(0deg, rgba(250,250,251,1) 0%, rgba(250,250,251,0) 100%);
  }
`;

export default FadedWrapper;

import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';

const CardHeaderIndicatorsContainer = styled.span`
  display: flex;
  height: 1.8rem;

  position: absolute;
  top: -.9rem;
  right: -.9rem;

  font-size: 1rem;
  color: ${colors.beige};
  line-height: 1.8rem;
`;

export default CardHeaderIndicatorsContainer;

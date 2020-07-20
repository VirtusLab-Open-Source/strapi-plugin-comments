import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';
import CardHeaderIndicator from './CardHeaderIndicator';

const CardHeaderIndicatorRed = styled(CardHeaderIndicator)`
  color: ${colors.beige};
  background: red;
`;

export default CardHeaderIndicatorRed;

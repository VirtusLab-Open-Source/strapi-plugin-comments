import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';
import CardHeaderIndicator from './CardHeaderIndicator';

const CardHeaderIndicatorBlue = styled(CardHeaderIndicator)`
  color: ${colors.beige};
  background: ${colors.blue};
`;

export default CardHeaderIndicatorBlue;

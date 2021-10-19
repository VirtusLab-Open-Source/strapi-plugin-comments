import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';

import CardHeaderBlocked from './CardHeaderBlocked';

const CardHeaderPending = styled(CardHeaderBlocked)`
  color: ${colors.blue};
`;

export default CardHeaderPending;

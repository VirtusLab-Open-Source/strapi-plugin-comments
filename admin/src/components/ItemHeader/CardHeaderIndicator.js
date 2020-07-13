import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';

const CardHeaderIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.8rem;
  height: 1.8rem;

  font-size: 1rem;
  color: ${colors.beige};
  vertical-align: middle;
  line-height: 1.8rem;
  text-align: center;

  border-radius: .9rem;
  background: ${colors.grey};

  &:first-child {
    margin-right: .5rem;
  }

  &:last-child {
    margin-right: 0;
  }
`;

export default CardHeaderIndicator;

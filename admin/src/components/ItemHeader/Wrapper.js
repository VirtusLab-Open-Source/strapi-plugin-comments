import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${props => props.hasMargin ? '1rem' : 0};

  color: ${colors.leftMenu.grey};
  font-size: 1.25rem;
  font-weight: 500;
`;

export default Wrapper;

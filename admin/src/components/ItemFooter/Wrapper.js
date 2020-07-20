import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  display: flex;
  padding-top: 1rem;
  margin-top: 1rem;

  flex-wrap: wrap;
  justify-items: center;
  align-items: stretch;

  color: ${colors.leftMenu.grey};
  font-size: 1.25rem;

  border-top: 1px ${colors.leftMenu.lightGrey} solid;
`;

export default Wrapper;

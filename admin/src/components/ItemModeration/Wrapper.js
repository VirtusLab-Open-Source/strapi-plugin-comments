import styled from 'styled-components';

import { Button } from '@buffetjs/styles';
import { colors } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  display: flex;
  margin-top: 1rem;

  flex-wrap: wrap;
  justify-items: center;
  align-items: stretch;

  ${Button} {
    margin-right: 1rem;
  }
`;

export default Wrapper;

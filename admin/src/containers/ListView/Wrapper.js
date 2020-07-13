import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - ${sizes.header.height});
  min-height: calc(100vh - ${sizes.header.height});
  max-height: calc(100vh - ${sizes.header.height});
  padding-top: 1.8rem;
  padding-left: 2rem;
  padding-right: 2rem;
`;

export default Wrapper;

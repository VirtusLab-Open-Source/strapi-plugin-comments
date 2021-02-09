import styled from 'styled-components';

import { sizes } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - ${sizes.header.height} - 15rem);
  min-height: calc(100vh - ${sizes.header.height} - 15rem);
  max-height: calc(100vh - ${sizes.header.height});
  padding-top: 1.8rem;
  padding-left: 2rem;
  padding-right: 2rem;
`;

export default Wrapper;

import styled from 'styled-components';

import { colors } from 'strapi-helper-plugin';

const EmptyView = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: ${props => props.fixPosition ? '8rem' : 0};

  font-size: 2rem;
  font-weight: 600;
  color: ${colors.leftMenu.grey};

  svg {
    margin-bottom: 1rem;
  }
`;

export default EmptyView;

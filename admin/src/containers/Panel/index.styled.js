import styled from 'styled-components';

export const Container = styled.div`
  padding: 2.5rem 30px 2.5rem 15px;
  background-color: ${({ isOpenFilter }) => isOpenFilter ? 'white' : ''}
`;

import styled from 'styled-components';
import { Button, FilterIcon as Filter } from 'strapi-helper-plugin';

export const FilterIcon = styled(Filter)`
  padding: 0 !important;
  margin: auto !important;
  > g {
    stroke: #282b2c;
  }
`;

export const AddFilterCta = styled(Button)`
  display: flex;
  height: 30px;
  margin-right: 10px;
  padding: 0 10px;
  text-align: center;
  background-color: #ffffff;
  border: 1px solid #e3e9f3;
  border-radius: 2px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 500;
  font-family: Lato;
  -webkit-font-smoothing: antialiased;
  cursor: pointer;
  &:hover {
    background: #f7f8f8;
  }
  &:focus,
  &:active {
    outline: 0;
  }
  > span {
    margin-left: 10px;
  }
`;

export const Container = styled.div`
  padding: 18px 30px 18px 0;
`;

export const Wrapper = styled.div`
  margin-top: -6px;
  > div {
    padding-top: 2px;
    &:not(:first-of-type) {
      padding-top: 9px;
      padding-bottom: 2px;
      &:last-of-type:nth-of-type(even) {
        padding-bottom: 11px;
      }
    }
  }
`;

export const FiltersWrapper = styled.div`
  min-height: 38px;
  border-left: ${props => props.borderLeft && '3px solid #007EFF'};
  padding-left: ${props => (props.borderLeft ? '10px' : '13px')};
  margin-bottom: 0 !important;
`;

export const InputWrapper = styled.div`
  display: flex;
  input,
  select {
    margin: 0px 5px !important;
  }
`;
export const styles = {
  select: {
    minWidth: '170px',
    maxWidth: '200px',
  },
  selectMiddle: {
    minWidth: '130px',
    maxWidth: '200px',
    marginLeft: '10px',
    marginRight: '10px',
  },
};

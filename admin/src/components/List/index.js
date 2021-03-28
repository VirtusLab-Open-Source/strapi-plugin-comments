import React from 'react';
import PropTypes from 'prop-types';
import Item from '../Item';
import Container from './Container';

const List = ({ items, relations }) => (
  <Container>
    {items.map((item, n) => (
      <Item
        key={`list-item-${item.id || n}`}
        relations={relations}
        {...item}
      />))}
  </Container>
);

List.propTypes = {
  items: PropTypes.array,
};

export default List;

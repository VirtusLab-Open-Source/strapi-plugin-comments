import React from 'react';
import PropTypes from 'prop-types';
import Item from '../Item';
import Container from './Container';

const List = ({ items }) => (
  <Container>
    { items.map((item, n) => (
      <Item
      key={`list-item-${item.id || n}`}
      {...item}
      /> ))}
  </Container>
);

List.propTypes = {
  items: PropTypes.array,
};

export default List;
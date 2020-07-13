import React from 'react';
import { IconLinks } from '@buffetjs/core';
import { Card } from '@buffetjs/styles';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrashAlt,
  faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import pluginId from '../../pluginId';
import Item from '../Item';
import Container from './Container';

const List = ({ items }) => {

  const handleEditClick = e => {
    e.preventDefault();
    e.stopPropagation();
    console.log(e);
  };
  const handleDeleteClick = e => {
    e.preventDefault();
    e.stopPropagation();
    console.log(e);
  };

  return (
    <Container>
      { items.map(item => (
        <Item
        {...item}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick} 
        
        /> ))}
    </Container>
  );
};

export default List;
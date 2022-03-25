import { first } from 'lodash';

const renderInitials = (value = '') => value.split(' ').map(_ => first(_)).join('').toUpperCase();

export default renderInitials;
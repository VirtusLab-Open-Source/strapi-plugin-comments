import { camelCase } from 'lodash';

export const isMatch = filterValue => ({ value }) => {
  const parsedValue = Number(filterValue);
  return isNaN(parsedValue) ? filterValue === value : parsedValue === value;
};

export const isRelatedFilter = (name) => name === 'related';

export const isEntityFilter = (name) => name === 'entity';

const defaultFilter = [
  { name: 'related', filter: '=', value: '' },
  { name: 'entity', filter: '=', value: '' },
];
export const initFilters = (queryFilters) => {
  return ([...defaultFilter, ...queryFilters])
    .reduce(
      (acc, current) => ({ ...acc, [camelCase(current.name)]: current }), {},
    );
};

import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Collapse } from 'reactstrap';
import { Select } from '@buffetjs/core';
import { map, noop } from 'lodash';

import { FilterButton, getFilterType } from 'strapi-helper-plugin';

import { AddFilterCta, Container, FilterIcon, FiltersWrapper, InputWrapper, styles, Wrapper } from './index.styled';
import useDataManager from '../../hooks/useDataManager';
import { isEntityFilter, isMatch } from './utils';

const allowedAttributes = ['Related to'];

const Filters = ({
  contentsTypes,
  isLoadingContentsTypes,
  isOpenFilter,
  onToggleOpen,
  onRemoveFilter,
  onChangeFilter,
  filters,
  isLoadingEntries,
  availableEntriesMap,
}) => {
  const filtersOptions = getFilterType();
  const { search } = useDataManager();

  const searchFilters = useMemo(
    () => (search.filters.reduce(
        (acc, current) => ({ ...acc, [current.name]: { ...current, contentType: filters?.related?.value } }),
        {})
    ),
    [search.filters],
  );

  const contentsTypesOptions = useMemo(
    () => [{ key: '', value: '' }, ...(contentsTypes || [])],
    [contentsTypes],
  );
  const availableEntriesOptions = useMemo(
    () => [{ key: '', value: '' }, ...(availableEntriesMap[filters?.related?.value] || [])],
    [availableEntriesMap],
  );

  if (isLoadingContentsTypes) {
    return null;
  }
  return (
    <>
      <Collapse isOpen={isOpenFilter}>
        <Container>
          <form>
            <Wrapper>
              <FiltersWrapper borderLeft={filters.related.value}>
                <InputWrapper>
                  <Select
                    disabled
                    options={allowedAttributes}
                    onChange={noop}
                    name='name'
                    value={filters.related.name}
                    style={styles.select}
                  />
                  <Select
                    disabled
                    name='filter'
                    onChange={noop}
                    value={filters.related.filter}
                    options={
                      filtersOptions.map(({ id, value }) => (
                        <FormattedMessage key={id} id={id}>
                          {msg => <option value={value}>{msg}</option>}
                        </FormattedMessage>
                      ))
                    }
                    style={styles.selectMiddle}
                  />
                  <Select
                    name="related-value"
                    onChange={onChangeFilter}
                    value={filters.related.value}
                    options={
                      contentsTypesOptions
                        .map(({ key, value }) => (
                          <option key={value} value={value}>
                            {key}
                          </option>
                        ))
                    }
                    style={styles.select}
                  />
                  {
                    filters.related.value && !isLoadingEntries && (
                      <Select
                        name="entity-value"
                        options={
                          availableEntriesOptions.map(({ key, value }) => (
                            <option key={key} value={value}>
                              {key}
                            </option>
                          ))
                        }
                        value={filters?.entity?.value}
                        onChange={onChangeFilter}
                        style={styles.select}
                      />
                    )
                  }
                </InputWrapper>
              </FiltersWrapper>
            </Wrapper>
          </form>
        </Container>
      </Collapse>
      <div className="container-fluid">
        <div className="row">
          <AddFilterCta type="button" onClick={onToggleOpen}>
            <FilterIcon />
            <FormattedMessage id="app.utils.filters" />
          </AddFilterCta>
          {
            !isLoadingEntries && map(
              searchFilters,
              (filter) => {
                if (!filter.value) {
                  return null;
                }
                const label = {
                  ...filter,
                  value: (isEntityFilter(filter.name) ? availableEntriesMap[filter.contentType] || [] : contentsTypesOptions).find(isMatch(filter.value))?.key,
                };
                return (
                  <FilterButton
                    key={filter.name}
                    onClick={onRemoveFilter(filter)}
                    label={label}
                    type="string"
                  />
                );
              })
          }
        </div>
      </div>
    </>
  );
};

export default Filters;

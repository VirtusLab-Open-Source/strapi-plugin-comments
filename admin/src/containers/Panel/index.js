/*
 *
 * CommentsPanel
 *
 */

import React, { memo, useEffect, useReducer, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { generateSearchFromFilters, PluginHeader, request, useGlobalContext } from 'strapi-helper-plugin';
import { camelCase, get, isEmpty } from 'lodash';

import ListView from '../ListView';
import DetailsView from '../DetailsView';
import Filters from '../../components/Filters';
import { initFilters, isRelatedFilter } from '../../components/Filters/utils';
import getTradId from '../../utils/getTradId';
import useDataManager from '../../hooks/useDataManager';
import { Container } from './index.styled';
import {
  GET_CONTENT_LIST_CONTENT_TYPE,
  GET_CONTENT_LIST_CONTENT_TYPE_SUCCEEDED,
  GET_CONTENT_TYPES,
  GET_CONTENT_TYPES_SUCCEEDED,
} from './actions';
import pluginId from '../../pluginId';
import reducer, { initialState } from './reducer';
import getTrad from '../../utils/getTrad';

const getContentTypes = async (dispatch) => {
  try {
    dispatch({ type: GET_CONTENT_TYPES });
    const { list: contentsTypes } = await request(`/${pluginId}/moderation/contents-types`, { method: 'GET' });
    dispatch({ type: GET_CONTENT_TYPES_SUCCEEDED, contentsTypes });
  } catch (err) {
    console.log('err', err);
  }
};

const fetchContentTypeList = async (dispatch, contentTypeName, prev) => {
  try {
    dispatch({ type: GET_CONTENT_LIST_CONTENT_TYPE });
    if (contentTypeName) {
      const { list } = await request(
        `/${pluginId}/moderation/contents-types/${contentTypeName}`,
      );
      dispatch({
        type: GET_CONTENT_LIST_CONTENT_TYPE_SUCCEEDED,
        payload: {
          ...prev,
          [contentTypeName]: list,
        },
      });
    }
  } catch (err) {
    console.log('err', err);
  }
};

const Panel = () => {
  const [reducerState, dispatch] = useReducer(reducer, initialState);
  const {
    contentsTypes,
    isLoadingContentsTypes,
    isLoadingEntries,
    availableEntriesMap,
  } = reducerState.toJS();
  const { formatMessage } = useGlobalContext();
  const { getSearchParams, search, items } = useDataManager();
  const newItemsCount = items.filter(_ => _.isNew).length;

  const { push } = useHistory();

  const { filters: queryFilters } = getSearchParams();
  const [filters, setFilters] = useState(initFilters(queryFilters));

  const [isOpenFilter, setIsOpenFilter] = useState(false);

  useEffect(
    () => {
      getContentTypes(dispatch);
    },
    [dispatch],
  );

  useEffect(() => {
    fetchContentTypeList(dispatch, get(filters, 'related.value'), availableEntriesMap || {});
  }, [filters, dispatch]);

  const onToggleOpen = () => {
    if (isEmpty(filters)) {
      setFilters(initFilters([]));
    }
    setIsOpenFilter(prevState => !prevState);
  };
  const onClose = () => setIsOpenFilter(false);

  const onRemoveFilter = ({ name }) => () => {
    onChangeFilter({ target: { name: `${name}.value`, value: '' } });
    onSubmit(isRelatedFilter(name) ? [name, 'entity'] : [name]);
  };

  const onChangeFilter = ({ target: { name, value } }) => {
    setFilters(prevState => {
      const [filterName, property] = name.split('-').map(camelCase);
      const filter = { ...(prevState[camelCase(filterName)] || {}) };
      if (filter) {
        if (isRelatedFilter(filterName) && prevState.entity) {
          prevState.entity.prevValue = prevState.entity.value;
          prevState.entity.value = '';
        }
        filter[property] = value;
        return { ...prevState, [camelCase(filterName)]: filter };
      }
      return { ...prevState };
    });
  };

  const onSubmit = (ignoreFilterNames = []) => {
    const searchParams = getSearchParams();
    searchParams.filters = Object
      .values(filters)
      .filter(({ value, name }) => !!value && !ignoreFilterNames.some(_ => _ === name));
    const newSearchParams = generateSearchFromFilters(searchParams);
    push({ search: newSearchParams });
  };

  const clearAll = () => {
    const searchParams = getSearchParams();
    searchParams.filters = [];
    const newSearchParams = generateSearchFromFilters(searchParams);
    setFilters(initFilters([]));
    push({ search: newSearchParams });
  };

  const filterPickerActions = [
    {
      label: getTrad(`list.header.filters.clearAll`),
      kind: 'secondary',
      onClick: () => {
        onClose();
        clearAll();
      },
    },
    {
      label: getTrad(`list.header.filters.apply`),
      kind: 'primary',
      type: 'button',
      onClick: () => {
        onClose();
        onSubmit();
      },
    },
  ];

  const isFilters = search.filters.length > 0;

  return (
    <>
      <Container isOpenFilter={isOpenFilter}>
        <PluginHeader
          title={formatMessage(getTradId('list.header.title'))}
          description={formatMessage(
            getTradId(isFilters ? 'list.header.filters.message' : 'list.header.description'),
            { count: isFilters ? items.length : newItemsCount })
          }
          actions={isOpenFilter ? filterPickerActions : []}
        />
        <Filters
          contentsTypes={contentsTypes}
          isLoadingContentsTypes={isLoadingContentsTypes}
          isLoadingEntries={isLoadingEntries}
          availableEntriesMap={availableEntriesMap}
          filters={filters}
          isOpenFilter={isOpenFilter}
          onToggleOpen={onToggleOpen}
          onChangeFilter={onChangeFilter}
          onRemoveFilter={onRemoveFilter}
        />
      </Container>
      <div className="container-fluid">
        <div className="row">
          <ListView />
          <DetailsView />
        </div>
      </div>
    </>
  );
};

export default memo(Panel);

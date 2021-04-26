import React, { memo, useCallback, useEffect, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  request,
  storeData,
  LoadingIndicatorPage,
  useGlobalContext,
  generateFiltersFromSearch,
  generateSearchFromFilters,
  generateSearchFromObject,
  getQueryParameters,
} from 'strapi-helper-plugin';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import moment from 'moment';
import DataManagerContext from '../../contexts/DataManagerContext';
import Container from '../../components/Container';
import Search from '../../components/Search';
import getTrad from '../../utils/getTrad';
import pluginId from '../../pluginId';
import init from './init';
import reducer, { initialState } from './reducer';
import {
  BLOCK_COMMENT,
  BLOCK_COMMENT_SUCCESS,
  BLOCK_COMMENT_THREAD,
  BLOCK_COMMENT_THREAD_SUCCESS,
  GET_DATA,
  GET_DATA_SUCCEEDED,
  GET_SINGLE_DATA,
  GET_SINGLE_DATA_SUCCEEDED,
  RESOLVE_ABUSE_REPORT,
  RESOLVE_ABUSE_REPORT_SUCCESS,
} from './actions';

const RECENTLY_VIEVEW_KEY = `${pluginId}-recently-viewed`;

const getCurrent = async (dispatch, searchParams = {}, recentlyViewed = undefined) => {
  try {
    const generatedSearch = generateSearchFromObject(searchParams);
    dispatch({
      type: GET_DATA,
    });
    const result = await request(`/${pluginId}/moderation/all?${generatedSearch}`, {
      method: 'GET',
    });
    const { items, total: itemsTotal } = result;

    dispatch({
      type: GET_DATA_SUCCEEDED,
      items,
      itemsTotal,
      recentlyViewed,
    });
  } catch (err) {
    console.error({ err });
    strapi.notification.error('notification.error');
  }
};

const getDetails = async (dispatch, activeId) => {
  try {
    if (activeId) {
      dispatch({
        type: GET_SINGLE_DATA,
      });

      const activeItem = await request(`/${pluginId}/moderation/single/${activeId}`, {
        method: 'GET',
      });

      dispatch({
        type: GET_SINGLE_DATA_SUCCEEDED,
        activeItem,
      });
    }
  } catch (err) {
    console.error({ err });
    strapi.notification.error('notification.error');
  }
};

const DataManagerProvider = ({ children }) => {
  const [reducerState, dispatch] = useReducer(reducer, initialState, init);
  const {
    autoReload,
    currentEnvironment,
    emitEvent,
    formatMessage,
  } = useGlobalContext();
  const {
    items,
    itemsTotal,
    activeItem,
    isLoading,
    isLoadingForDetailsDataToBeSet,
    initialData,
  } = reducerState.toJS();
  const { pathname, search } = useLocation();
  const { push } = useHistory();

  const formatMessageRef = useRef();
  formatMessageRef.current = formatMessage;

  const isInDevelopmentMode = currentEnvironment === 'development' && autoReload;

  const detailsViewMatch = useRouteMatch(`/plugins/${pluginId}/display/:id`);
  const activeId = get(detailsViewMatch, 'params.id', null);

  useEffect(() => {
    getCurrent(dispatch, getSearchParams(), moment(storeData.get(RECENTLY_VIEVEW_KEY) || undefined));
    storeData.set(RECENTLY_VIEVEW_KEY, moment().toString());
  }, [search, dispatch]);

  useEffect(() => {
    // We need to set the modifiedData after the data has been retrieved
    // and also on pathname change
    if (!isLoading) {
      getDetails(dispatch, activeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, pathname, dispatch, activeId]);

  useEffect(() => {
    if (currentEnvironment === 'development' && !autoReload) {
      strapi.notification.info(
        formatMessageRef.current({
          id: getTrad('notification.info.autoreaload-disable'),
        }),
      );
    }
  }, [autoReload, currentEnvironment]);

  const blockComment = async (id) => {
    try {
      emitEvent('willBlockComment');
      dispatch({ type: BLOCK_COMMENT });

      await request(`/${pluginId}/moderation/block/${id}`, {
        method: 'PUT',
      });

      getCurrent(dispatch, getSearchParams());
      getDetails(dispatch, activeId);

      emitEvent('didBlockComment');
      dispatch({ type: BLOCK_COMMENT_SUCCESS });

      strapi.notification.success(`${pluginId}.notification.comment.visibility`);

    } catch (err) {
      emitEvent('didNotBlockComment');
      console.error({ err: err.response });
      strapi.notification.error('notification.error');
    }
  };

  const blockCommentThread = async (id) => {
    try {
      emitEvent('willBlockCommentThread');
      dispatch({ type: BLOCK_COMMENT_THREAD });

      await request(`/${pluginId}/moderation/block-thread/${id}`, {
        method: 'PUT',
      });

      getCurrent(dispatch, getSearchParams());
      getDetails(dispatch, activeId);

      emitEvent('didBlockCommentThread');
      dispatch({ type: BLOCK_COMMENT_THREAD_SUCCESS });

      strapi.notification.success(`${pluginId}.notification.thread.visibility`);

    } catch (err) {
      emitEvent('didNotBlockCommentThread');
      console.error({ err: err.response });
      strapi.notification.error('notification.error');
    }
  };

  const resolveAbuseReport = async (id, commentId) => {
    try {
      emitEvent('willResolveAbuseReport');
      dispatch({ type: RESOLVE_ABUSE_REPORT });

      await request(`/${pluginId}/moderation/abuse-reports/${commentId}/resolve/${id}`, {
        method: 'PATCH',
      });

      getCurrent(dispatch, getSearchParams());
      getDetails(dispatch, activeId);

      emitEvent('didResolveAbuseReport');
      dispatch({ type: RESOLVE_ABUSE_REPORT_SUCCESS });

      strapi.notification.success(`${pluginId}.notification.abuse-report.resolution`);

    } catch (err) {
      emitEvent('didNotResolveAbuseReport');
      console.error({ err: err.response });
      strapi.notification.error('notification.error');
    }
  };

  const getSearchParams = useCallback(
    (updatedParams = {}) => {
      return {
        _limit: getQueryParameters(search, '_limit') || 10,
        _page: getQueryParameters(search, '_page') || 1,
        _q: getQueryParameters(search, '_q') || '',
        filters: generateFiltersFromSearch(search),
        ...updatedParams,
      };
    },
    [search],
  );

  const handleChangeParams = ({ target: { name, value } }) => {
    const currentParams = getSearchParams();
    const updatedParams = {
      ...currentParams,
      [name]: value,
    };
    const updatedSearch = getSearchParams({
      ...updatedParams,
      _start: name === '_q' ? 0 : updatedParams._start,
      _page: name === '_q' ? 1 : updatedParams._page,
    });
    const newSearch = generateSearchFromFilters(updatedSearch);

    if (name === '_limit') {
      emitEvent('willChangeNumberOfEntriesPerPage');
    }

    push({ search: newSearch });
  };

  return (
    <DataManagerContext.Provider
      value={{
        items,
        itemsTotal,
        search: getSearchParams(),
        getSearchParams,
        activeItem,
        initialData,
        isLoading,
        isLoadingForDetailsDataToBeSet,
        blockComment,
        blockCommentThread,
        resolveAbuseReport,
        isInDevelopmentMode,
        handleChangeParams,
      }}
    >
      {isLoading ? (
        <LoadingIndicatorPage />
      ) : (
        <>
          <Container>
            <Search
              changeParams={handleChangeParams}
              initValue={getQueryParameters(search, '_q') || ''}
              model="Comments"
              value={getQueryParameters(search, '_q') || ''}
            />
          </Container>
          {children}
        </>
      )}
    </DataManagerContext.Provider>
  );
};

DataManagerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default memo(DataManagerProvider);

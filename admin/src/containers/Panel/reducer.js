import { fromJS, Set } from 'immutable';
import {
  GET_CONFIG,
  GET_CONFIG_SUCCESS,
  GET_CONTENT_LIST_CONTENT_TYPE,
  GET_CONTENT_LIST_CONTENT_TYPE_SUCCEEDED,
} from './actions';

export const initialState = fromJS({
  isLoadingContentsTypes: false,
  isLoadingEntries: false,
  contentsTypes: [],
  relatedContentTypes: {},
  availableEntriesMap: Set(),
});

const reducer = (state, action) => {
  switch (action.type) {
    case GET_CONFIG: {
      return state
        .update('isLoadingContentsTypes', () => true);
    }
    case GET_CONFIG_SUCCESS: {
      return state
        .update('isLoadingContentsTypes', () => false)
        .update('contentsTypes', () => action.contentsTypes)
        .update('relatedContentTypes', () => action.relatedContentTypes);
    }
    case GET_CONTENT_LIST_CONTENT_TYPE: {
      return state
        .update('isLoadingEntries', () => true)
        .update('availableEntriesMap', () => ({}));
    }
    case GET_CONTENT_LIST_CONTENT_TYPE_SUCCEEDED: {
      return state
        .update('isLoadingEntries', () => false)
        .update('availableEntriesMap', () => action.payload);
    }
    default:
      return state;
  }
};

export default reducer;

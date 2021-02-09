import { fromJS, Set } from 'immutable';
import {
  GET_CONTENT_LIST_CONTENT_TYPE,
  GET_CONTENT_LIST_CONTENT_TYPE_SUCCEEDED,
  GET_CONTENT_TYPES,
  GET_CONTENT_TYPES_SUCCEEDED,
} from './actions';

export const initialState = fromJS({
  isLoadingContentsTypes: false,
  isLoadingEntries: false,
  contentsTypes: [],
  availableEntriesMap: Set(),
});

const reducer = (state, action) => {
  switch (action.type) {
    case GET_CONTENT_TYPES: {
      return state
        .update('isLoadingContentsTypes', () => true);
    }
    case GET_CONTENT_TYPES_SUCCEEDED: {
      return state
        .update('isLoadingContentsTypes', () => false)
        .update('contentsTypes', () => action.contentsTypes);
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

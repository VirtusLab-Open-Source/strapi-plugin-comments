import { fromJS } from 'immutable';
import moment from 'moment';
import {
  BLOCK_COMMENT,
  BLOCK_COMMENT_THREAD,
  GET_DATA,
  GET_DATA_SUCCEEDED,
  GET_SINGLE_DATA,
  GET_SINGLE_DATA_SUCCEEDED,
  RELOAD_PLUGIN,
} from './actions';

const initialState = fromJS({
  items: [],
  itemsTotal: 0,
  activeItem: undefined,
  isLoading: true,
  isLoadingForDataToBeSet: false,
  isLoadingForDetailsDataToBeSet: false,
});

const reducer = (state, action) => {
  switch (action.type) {
    case GET_DATA: {
      return state
        .removeIn('items')
        .update('isLoadingForDataToBeSet', () => true);
    }
    case GET_DATA_SUCCEEDED: {
      return state
        .update('items', () => fromJS(action.items.map(_ => ({
          ..._,
          isNew: moment(_.created_at).diff(moment(action.recentlyViewed), 'seconds') > 0,
        }))))
        .update('itemsTotal', () => fromJS(action.itemsTotal))
        .update('isLoading', () => false)
        .update('isLoadingForDataToBeSet', () => false);
    }
    case GET_SINGLE_DATA:
    case BLOCK_COMMENT:
    case BLOCK_COMMENT_THREAD: {
      return state
        .removeIn('activeItem')
        .update('isLoadingForDetailsDataToBeSet', () => true);
    }
    case GET_SINGLE_DATA_SUCCEEDED: {
      return state
        .update('activeItem', () => fromJS(action.activeItem))
        .update('isLoadingForDetailsDataToBeSet', () => false);
    }
    case RELOAD_PLUGIN:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
export { initialState };

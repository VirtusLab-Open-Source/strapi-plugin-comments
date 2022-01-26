
   
import { createSelector } from 'reselect';
import { initialState } from './';
import { REDUCER_NAME } from './constants';

/**
 * Direct selector to the listView state domain
 */
const appView = () => state => state[REDUCER_NAME] || initialState;

/**
 * Other specific selectors
 */

/**
 * Default selector used by listView
 */

const makeAppView = () =>
  createSelector(
    appView(),
    substate => {
      return substate;
    }
  );

const selectConfig = state => {
  const { config } = state;

  return config;
};

export default makeAppView;
export { appView, selectConfig };
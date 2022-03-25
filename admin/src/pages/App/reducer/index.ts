// @ts-nocheck

import produce from "immer"; // current
import { set } from "lodash";
import { GET_CONFIG, SET_CONFIG } from "./constants";

const initialState = {
  config: {},
};

const reducer = (state = initialState, action) =>
  // eslint-disable-next-line consistent-return
  produce(state, (draftState) => {
    switch (action.type) {
      case SET_CONFIG: {
        set(draftState, "config", action.data);
        break;
      }
      case GET_CONFIG: {
        return draftState?.config;
      }
      default:
        return draftState;
    }
  });

export default reducer;
export { initialState };

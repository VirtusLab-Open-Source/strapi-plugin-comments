import appReducer from "./pages/App/reducer";
import { REDUCER_NAME } from "./pages/App/reducer/constants";

const reducers = {
  [`${REDUCER_NAME}`]: appReducer,
};

export default reducers;

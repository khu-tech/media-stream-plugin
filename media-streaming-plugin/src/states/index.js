import { combineReducers } from "redux";
import { reduce as StreamingReducer } from "./StreamingStatus";

// Register your redux store under a unique namespace
export const namespace = "stop-streaming";

// Combine the reducers
export default combineReducers({
  streaming: StreamingReducer,
});

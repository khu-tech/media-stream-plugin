const ACTION_SET_STR_STATUS = "SET_STREAMING_STATUS";

const initialState = {};

export class Actions {
  static setStreamingStatus = (status) => ({
    type: ACTION_SET_STR_STATUS,
    status,
  });
}

export function reduce(state = initialState, action) {
  switch (action.type) {
    case ACTION_SET_STR_STATUS: {
      return { status: action.status };
    }
    default:
      return state;
  }
}

import { createAction, handleActions } from 'redux-actions';
import { getMutableState, getImmutableState } from './helpers/state';

export const LOAD = '@reduxAsyncConnect/LOAD';
export const LOAD_SUCCESS = '@reduxAsyncConnect/LOAD_SUCCESS';
export const LOAD_FAIL = '@reduxAsyncConnect/LOAD_FAIL';
export const CLEAR = '@reduxAsyncConnect/CLEAR';
export const BEGIN_GLOBAL_LOAD = '@reduxAsyncConnect/BEGIN_GLOBAL_LOAD';
export const END_GLOBAL_LOAD = '@reduxAsyncConnect/END_GLOBAL_LOAD';

const initialState = {
  loaded: false,
  loadState: {},
};

const reduxAsyncReducer = handleActions({
  [BEGIN_GLOBAL_LOAD]: (state) => ({
    ...state,
    loaded: false,
  }),

  [END_GLOBAL_LOAD]: (state) => ({
    ...state,
    loaded: true,
  }),

  [LOAD]: (state, { payload }) => ({
    ...state,
    loadState: {
      ...state.loadState,
      [payload.key]: {
        loading: true,
        loaded: false,
      },
    },
  }),

  [LOAD_SUCCESS]: (state, { payload: { key, data } }) => ({
    ...state,
    loadState: {
      ...state.loadState,
      [key]: {
        loading: false,
        loaded: true,
        error: null,
      },
    },
    [key]: data,
  }),

  [LOAD_FAIL]: (state, { payload: { key, error } }) => ({
    ...state,
    loadState: {
      ...state.loadState,
      [key]: {
        loading: false,
        loaded: false,
        error,
      },
    },
  }),

  [CLEAR]: (state, { payload }) => ({
    ...state,
    loadState: {
      ...state.loadState,
      [payload]: {
        loading: false,
        loaded: false,
        error: null,
      },
    },
    [payload]: null,
  }),

}, initialState);

export const reducer = function wrappedReducer(immutableState, action) {
  // We need to convert immutable state to mutable state before our reducer can act upon it
  let mutableState;
  if (immutableState === undefined) {
    // if state is undefined (no initial state yet) then we can't convert it, so let the
    // reducer set the initial state for us
    mutableState = immutableState;
  } else {
    // Convert immutable state to mutable state so our reducer will accept it
    mutableState = getMutableState(immutableState);
  }

  // Run the reducer and then re-convert the mutable output state back to immutable state
  return getImmutableState(reduxAsyncReducer(mutableState, action));
};

export const clearKey = createAction(CLEAR);

export const beginGlobalLoad = createAction(BEGIN_GLOBAL_LOAD);

export const endGlobalLoad = createAction(END_GLOBAL_LOAD);

export const load = createAction(LOAD, (key) => ({
  key,
}));

export const loadSuccess = createAction(LOAD_SUCCESS, (key, data) => ({
  key,
  data,
}));

export const loadFail = createAction(LOAD_FAIL, (key, error) => ({
  key,
  error,
}));

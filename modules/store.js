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

export const reducer = function wrappedReducer(state, action) {
  // if state is undefined then it can't be converted to mutable
  let mutableState = state;
  if (mutableState !== undefined) {
    mutableState = getMutableState(state);
  }
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

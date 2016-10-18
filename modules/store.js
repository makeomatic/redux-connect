import { createAction, handleActions } from 'redux-actions';
import { getMutableState, getImmutableState } from './helpers/state';

export const clearKey = createAction('@redux-conn/CLEAR');
export const beginGlobalLoad = createAction('@redux-conn/BEGIN_GLOBAL_LOAD');
export const endGlobalLoad = createAction('@redux-conn/END_GLOBAL_LOAD');
export const load = createAction('@redux-conn/LOAD', key => ({ key }));
export const loadSuccess = createAction('@redux-conn/LOAD_SUCCESS', (key, data) => ({ key, data }));
export const loadFail = createAction('@redux-conn/LOAD_FAIL', (key, error) => ({ key, error }));

const initialState = {
  loaded: false,
  loadState: {},
};

export const reducer = handleActions({
  [beginGlobalLoad]: state => ({
    ...state,
    loaded: false,
  }),

  [endGlobalLoad]: state => ({
    ...state,
    loaded: true,
  }),

  [load]: (state, { payload }) => ({
    ...state,
    loadState: {
      ...state.loadState,
      [payload.key]: {
        loading: true,
        loaded: false,
      },
    },
  }),

  [loadSuccess]: (state, { payload: { key, data } }) => ({
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

  [loadFail]: (state, { payload: { key, error } }) => ({
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

  [clearKey]: (state, { payload }) => ({
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

export const immutableReducer = function wrapReducer(immutableState, action) {
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
  return getImmutableState(reducer(mutableState, action));
};

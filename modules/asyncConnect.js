import { connect } from 'react-redux';
import { createAction, handleActions } from 'redux-actions';
import { isPromise } from './isPromise.js';

export const LOAD = 'reduxAsyncConnect/LOAD';
export const LOAD_SUCCESS = 'reduxAsyncConnect/LOAD_SUCCESS';
export const LOAD_FAIL = 'reduxAsyncConnect/LOAD_FAIL';
export const CLEAR = 'reduxAsyncConnect/CLEAR';
export const BEGIN_GLOBAL_LOAD = 'reduxAsyncConnect/BEGIN_GLOBAL_LOAD';
export const END_GLOBAL_LOAD = 'reduxAsyncConnect/END_GLOBAL_LOAD';

const initialState = {
  loaded: false,
  loadState: {},
};

export const reducer = handleActions({

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
    [key]: data
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

function wrapWithDispatch(asyncItems) {
  return asyncItems.map(item => {
    const key = item.key;
    if (!key) {
      return item;
    }

    return {
      ...item,
      promise: options => {
        const { store: { dispatch } } = options;
        const next = item.promise(options);

        if (isPromise(next)) {
          dispatch(load(key));
          next
            .then(data => dispatch(loadSuccess(key, data)))
            .catch(err => dispatch(loadFail(key, err)));
        } else if (next) {
          dispatch(loadSuccess(key, next));
        }

        return next;
      },
    };
  });
}

export function asyncConnect(asyncItems) {
  return Component => {
    Component.reduxAsyncConnect = wrapWithDispatch(asyncItems);

    const finalMapStateToProps = state => (
      asyncItems.reduce((result, { key }) => {
        if (!key) {
          return result;
        }

        return {
          ...result,
          [key]: state.reduxAsyncConnect[key],
        };
      }, {})
    );

    return connect(finalMapStateToProps)(Component);
  };
}

import { createAction, handleActions } from 'redux-actions';

const initialState = {
  data: null,
  loaded: false,
  err: null,
};

export const fetchData = createAction('@@lunch/fetch', http => http.get('/api/endpoint'));

export default handleActions({
  [fetchData]: {
    next: (state, { payload }) => ({
      ...state,
      data: payload.data,
      loaded: true,
    }),
    throw: (state, { payload }) => ({
      ...state,
      err: String(payload),
      loaded: true,
    }),
  },
}, initialState);

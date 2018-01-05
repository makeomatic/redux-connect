import { createStore, combineReducers } from 'redux';
import { reducer as reduxAsyncConnect } from '../../../';

export default function configureStore(initialState) {
  return createStore(combineReducers({ reduxAsyncConnect }), initialState);
}

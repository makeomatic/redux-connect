import { createStore, combineReducers, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import { reducer as reduxAsyncConnect } from '../../../../';
import lunch from './reducers/lunch';

export default function configureStore(initialState) {
  return createStore(
    // `reduxAsyncConnect` is mandatory name for mount point of redux-connect's reducer
    combineReducers({ lunch, reduxAsyncConnect }),
    initialState,
    applyMiddleware(promiseMiddleware)
  );
}

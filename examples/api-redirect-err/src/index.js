import React from 'react';
import ReactDOM from 'react-dom';
import BrowserRouter from 'react-router-dom/BrowserRouter';
import { Provider } from 'react-redux';
import { ReduxAsyncConnect } from '../../../';
import configureStore from './store';
import routes from './routes';
import * as helpers from './helpers';

import './index.css';

const store = configureStore(window.__DATA);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <ReduxAsyncConnect routes={routes} helpers={helpers} />
    </BrowserRouter>
  </Provider>
  , document.getElementById('root'));

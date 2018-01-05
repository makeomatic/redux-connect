import React from 'react';
import Redirect from 'react-router/Redirect';
import App from './App';
import Wrapped from './containers/Wrapped';
import Unwrapped from './components/Unwrapped';
import NotFound from './components/NotFound';

export default [{
  path: '/',
  component: App,
  routes: [{
    path: '/',
    exact: true,
    component: () => <Redirect to="/wrapped/second" />,
  }, {
    path: '/unwrapped',
    component: Unwrapped,
  }, {
    path: '/wrapped',
    component: Wrapped,
  }, {
    path: '*',
    component: NotFound,
  }],
}];

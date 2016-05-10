/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { Router, createMemoryHistory, match, Route } from 'react-router';
import { createStore, combineReducers } from 'redux';
import { mount, render } from 'enzyme';
import { spy } from 'sinon';

// import module
import {
  ReduxAsyncConnect,
  asyncConnect,
  reducer as reduxAsyncConnect,
  loadOnServer,
} from '../modules/index';

describe('<ReduxAsyncConnect />', function suite() {
  const renderReduxAsyncConnect = props => <ReduxAsyncConnect {...props} />;
  const App = (props) => <div>{props.lunch}</div>;
  const WrappedApp = asyncConnect([{
    key: 'lunch',
    promise: () => Promise.resolve('sandwich'),
  }])(App);
  const reducers = combineReducers({ reduxAsyncConnect });
  const routes = (
    <Route path="/" component={WrappedApp} />
  );

  // inter-test state
  let state;

  pit('properly fetches data on the server', function test() {
    return new Promise((resolve, reject) => {
      const store = createStore(reducers);

      match({ routes, location: '/' }, (err, redirect, renderProps) => {
        if (err) {
          return reject(err);
        }

        if (redirect) {
          return reject(new Error('redirected'));
        }

        if (!renderProps) {
          return reject(new Error('404'));
        }

        return loadOnServer({ ...renderProps, store }).then(() => {
          const html = render(
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} />
            </Provider>
          );

          expect(html.text()).toContain('sandwich');
          state = store.getState();
          expect(state.reduxAsyncConnect.loaded).toBe(true);
          expect(state.reduxAsyncConnect.lunch).toBe('sandwich');
          expect(state.reduxAsyncConnect.loadState.lunch.loading).toBe(false);
          expect(state.reduxAsyncConnect.loadState.lunch.loaded).toBe(true);
          expect(state.reduxAsyncConnect.loadState.lunch.error).toBe(null);
          resolve();
        })
        .catch(reject);
      });
    });
  });

  it('properly picks data up from the server', function test() {
    const store = createStore(reducers, state);
    const history = createMemoryHistory();
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    const wrapper = mount(
      <Provider store={store} key="provider">
        <Router render={renderReduxAsyncConnect} history={history} >
          {routes}
        </Router>
      </Provider>
    );

    expect(proto.loadAsyncData.called).toBe(false);
    expect(proto.componentDidMount.calledOnce).toBe(true);

    expect(wrapper.find(App).length).toBe(1);
    expect(wrapper.find(App).prop('lunch')).toBe('sandwich');

    proto.loadAsyncData.restore();
    proto.componentDidMount.restore();
  });

  it('loads data on client side when it wasn\'t provided by server', function test() {
    const store = createStore(reducers);
    const history = createMemoryHistory();
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    mount(
      <Provider store={store} key="provider">
        <Router render={renderReduxAsyncConnect} history={history} >
          {routes}
        </Router>
      </Provider>
    );

    expect(proto.loadAsyncData.calledOnce).toBe(true);
    expect(proto.componentDidMount.calledOnce).toBe(true);

    proto.loadAsyncData.restore();
    proto.componentDidMount.restore();
  });
});

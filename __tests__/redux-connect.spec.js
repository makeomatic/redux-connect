/* eslint-disable react/prop-types */
import Promise from 'bluebird';
import React from 'react';
import { Provider, connect } from 'react-redux';
import { Router, createMemoryHistory, match, Route, IndexRoute } from 'react-router';
import { createStore, combineReducers } from 'redux';
import { mount, render } from 'enzyme';
import { spy } from 'sinon';

// import module
import { endGlobalLoad, beginGlobalLoad } from '../modules/store';
import AsyncConnect from '../modules/components/AsyncConnect';
import {
  asyncConnect,
  reducer as reduxAsyncConnect,
  loadOnServer,
} from '../modules/index';

describe('<ReduxAsyncConnect />', function suite() {
  const endGlobalLoadSpy = spy(endGlobalLoad);
  const beginGlobalLoadSpy = spy(beginGlobalLoad);
  const ReduxAsyncConnect = connect(null, {
    beginGlobalLoad: beginGlobalLoadSpy,
    endGlobalLoad: endGlobalLoadSpy,
  })(AsyncConnect);
  const renderReduxAsyncConnect = props => <ReduxAsyncConnect {...props} />;
  const App = (props) => <div>{props.lunch}</div>;
  const WrappedApp = asyncConnect([{
    key: 'lunch',
    promise: () => Promise.resolve('sandwich'),
  }, {
    key: 'action',
    promise: ({ helpers }) => Promise.resolve(helpers.eat()),
  }])(App);
  const UnwrappedApp = () => <div>Hi, I do not use @asyncConnect</div>;
  const reducers = combineReducers({ reduxAsyncConnect });
  const routes = (
    <Route path="/">
      <IndexRoute component={WrappedApp} />
      <Route path="/notconnected" component={UnwrappedApp} />
    </Route>
  );

  // inter-test state
  let state;

  pit('properly fetches data on the server', function test() {
    return new Promise((resolve, reject) => {
      const store = createStore(reducers);
      const eat = spy(() => 'yammi');

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

        return loadOnServer({ ...renderProps, store, helpers: { eat } }).then(() => {
          const html = render(
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} />
            </Provider>
          );

          expect(html.text()).toContain('sandwich');
          state = store.getState();
          expect(state.reduxAsyncConnect.loaded).toBe(true);
          expect(state.reduxAsyncConnect.lunch).toBe('sandwich');
          expect(state.reduxAsyncConnect.action).toBe('yammi');
          expect(state.reduxAsyncConnect.loadState.lunch.loading).toBe(false);
          expect(state.reduxAsyncConnect.loadState.lunch.loaded).toBe(true);
          expect(state.reduxAsyncConnect.loadState.lunch.error).toBe(null);
          expect(eat.calledOnce).toBe(true);

          // global loader spy
          expect(endGlobalLoadSpy.called).toBe(false);
          expect(beginGlobalLoadSpy.called).toBe(false);
          endGlobalLoadSpy.reset();
          beginGlobalLoadSpy.reset();

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
    const eat = spy(() => 'yammi');

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    const wrapper = mount(
      <Provider store={store} key="provider">
        <Router render={renderReduxAsyncConnect} helpers={{ eat }} history={history} >
          {routes}
        </Router>
      </Provider>
    );

    expect(proto.loadAsyncData.called).toBe(false);
    expect(proto.componentDidMount.calledOnce).toBe(true);
    expect(eat.called).toBe(false);

    expect(wrapper.find(App).length).toBe(1);
    expect(wrapper.find(App).prop('lunch')).toBe('sandwich');

    // global loader spy
    expect(endGlobalLoadSpy.called).toBe(false);
    expect(beginGlobalLoadSpy.called).toBe(false);
    endGlobalLoadSpy.reset();
    beginGlobalLoadSpy.reset();

    proto.loadAsyncData.restore();
    proto.componentDidMount.restore();
  });

  pit('loads data on client side when it wasn\'t provided by server', function test() {
    const store = createStore(reducers);
    const history = createMemoryHistory();
    const eat = spy(() => 'yammi');
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    mount(
      <Provider store={store} key="provider">
        <Router render={renderReduxAsyncConnect} history={history} helpers={{ eat }} >
          {routes}
        </Router>
      </Provider>
    );

    expect(proto.loadAsyncData.calledOnce).toBe(true);
    expect(proto.componentDidMount.calledOnce).toBe(true);


    // global loader spy
    expect(beginGlobalLoadSpy.called).toBe(true);
    beginGlobalLoadSpy.reset();

    return proto.loadAsyncData.returnValues[0].then(() => {
      expect(endGlobalLoadSpy.called).toBe(true);
      endGlobalLoadSpy.reset();

      proto.loadAsyncData.restore();
      proto.componentDidMount.restore();
    });
  });

  pit('renders even when no component is connected', function test() {
    return new Promise((resolve, reject) => {
      const store = createStore(reducers);
      const eat = spy(() => 'yammi');

      match({ routes, location: '/notconnected' }, (err, redirect, renderProps) => {
        if (err) {
          return reject(err);
        }

        if (redirect) {
          return reject(new Error('redirected'));
        }

        if (!renderProps) {
          return reject(new Error('404'));
        }

        return loadOnServer({ ...renderProps, store, helpers: { eat } }).then(() => {
          const html = render(
            <Provider store={store} key="provider">
              <ReduxAsyncConnect {...renderProps} />
            </Provider>
          );

          expect(html.text()).toContain('I do not use @asyncConnect');
          state = store.getState();
          expect(state.reduxAsyncConnect.loaded).toBe(true);
          expect(state.reduxAsyncConnect.lunch).toBe(undefined);
          expect(eat.called).toBe(false);

          // global loader spy
          expect(endGlobalLoadSpy.called).toBe(false);
          expect(beginGlobalLoadSpy.called).toBe(false);
          endGlobalLoadSpy.reset();
          beginGlobalLoadSpy.reset();

          resolve();
        })
        .catch(reject);
      });
    });
  });
});

import Enzyme, { mount, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Promise from 'bluebird';
import React from 'react';
import { Provider, connect } from 'react-redux';
import { Router, createMemoryHistory, match, Route, IndexRoute } from 'react-router';
import { createStore, combineReducers } from 'redux';
import { combineReducers as combineImmutableReducers } from 'redux-immutable';
import { spy } from 'sinon';
import Immutable from 'immutable';
import { setToImmutableStateFunc, setToMutableStateFunc } from '../modules/helpers/state';

// import module
import { endGlobalLoad, beginGlobalLoad } from '../modules/store';
import { AsyncConnect } from '../modules/components/AsyncConnect';
import {
  asyncConnect,
  reducer as reduxAsyncConnect,
  immutableReducer,
  loadOnServer
} from '../modules/index';

Enzyme.configure({ adapter: new Adapter() });

describe('<ReduxAsyncConnect />', function suite() {
  const initialState = {
    reduxAsyncConnect: { loaded: false, loadState: {}, $$external: 'supported' },
  };

  const endGlobalLoadSpy = spy(endGlobalLoad);
  const beginGlobalLoadSpy = spy(beginGlobalLoad);

  const ReduxAsyncConnect = connect(null, {
    beginGlobalLoad: beginGlobalLoadSpy,
    endGlobalLoad: endGlobalLoadSpy,
  })(AsyncConnect);

  const renderReduxAsyncConnect = props => <ReduxAsyncConnect {...props} />;

  /* eslint-disable no-unused-vars */
  const App = ({
    // NOTE: use this as a reference of props passed to your component from router
    // these are the params that are passed from router
    history,
    location,
    params,
    route,
    router,
    routeParams,
    routes,
    externalState,
    remappedProp,
    // our param
    lunch,
    // react-redux dispatch prop
    dispatch,
    ...rest
  }) => <div {...rest}>{lunch}</div>;

  const MultiAppA = ({
    compA,
    compB,
    // our param
    breakfast,
    // react-redux dispatch prop
    ...rest
  }) => <div><div>{breakfast}</div><div>{compA}</div><div>{compB}</div></div>;

  const MultiAppB = ({
    dinner,
    ...rest
  }) => <div>{dinner}</div>;
  /* eslint-enable no-unused-vars */

  const WrappedApp = asyncConnect([{
    key: 'lunch',
    promise: () => Promise.resolve('sandwich'),
  }, {
    key: 'action',
    promise: ({ helpers }) => Promise.resolve(helpers.eat()),
  }], (state, ownProps) => ({
    externalState: state.reduxAsyncConnect.$$external,
    remappedProp: ownProps.route.remap,
  }))(App);

  const WrappedAppA = asyncConnect([{
    key: 'breakfast',
    promise: () => Promise.resolve('omelette'),
  }, {
    key: 'action',
    promise: ({ helpers }) => Promise.resolve(helpers.eat('breakfast')),
  }], (state, ownProps) => ({
    externalState: state.reduxAsyncConnect.$$external,
    compA: ownProps.compA,
    compB: ownProps.compB,
  }))(MultiAppA);

  const WrappedAppB = asyncConnect([{
    key: 'dinner',
    promise: () => Promise.resolve('chicken'),
  }, {
    key: 'action',
    promise: ({ helpers }) => Promise.resolve(helpers.eat('dinner')),
  }], state => ({
    externalState: state.reduxAsyncConnect.$$external,
  }))(MultiAppB);

  const UnwrappedApp = () => <div>Hi, I do not use @asyncConnect</div>;
  const reducers = combineReducers({ reduxAsyncConnect });

  const routes = (
    <Route path="/">
      <IndexRoute component={WrappedApp} remap="on" />
      <Route path="/notconnected" component={UnwrappedApp} />
      <Route path="/multi" component={WrappedAppA}>
        <IndexRoute components={{ compA: UnwrappedApp, compB: WrappedAppB }} />
      </Route>
    </Route>
  );

  // inter-test state
  let testState;

  it('properly fetches data on the server', function test() {
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

        return loadOnServer({ ...renderProps, store, helpers: { eat } })
          .then(() => {
            const html = render(
              <Provider store={store} key="provider">
                <ReduxAsyncConnect {...renderProps} />
              </Provider>
            );

            expect(html.text()).toContain('sandwich');
            testState = store.getState();
            expect(testState.reduxAsyncConnect.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.lunch).toBe('sandwich');
            expect(testState.reduxAsyncConnect.action).toBe('yammi');
            expect(testState.reduxAsyncConnect.loadState.lunch.loading).toBe(false);
            expect(testState.reduxAsyncConnect.loadState.lunch.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.loadState.lunch.error).toBe(null);
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
    const store = createStore(reducers, testState);
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

  it('loads data on client side when it wasn\'t provided by server', function test() {
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

  it('supports extended connect signature', function test() {
    const store = createStore(reducers, initialState);
    const history = createMemoryHistory();
    const eat = spy(() => 'yammi');
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    const wrapper = mount(
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

      // https://github.com/airbnb/enzyme/blob/master/docs/guides/migration-from-2-to-3.md#for-mount-updates-are-sometimes-required-when-they-werent-before
      wrapper.update();

      expect(wrapper.find(App).length).toBe(1);
      expect(wrapper.find(App).prop('lunch')).toBe('sandwich');
      expect(wrapper.find(App).prop('externalState')).toBe('supported');
      expect(wrapper.find(App).prop('remappedProp')).toBe('on');

      proto.loadAsyncData.restore();
      proto.componentDidMount.restore();
    });
  });


  it('renders even when no component is connected', function test() {
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

        return loadOnServer({ ...renderProps, store, helpers: { eat } })
          .then(() => {
            const html = render(
              <Provider store={store} key="provider">
                <ReduxAsyncConnect {...renderProps} />
              </Provider>
            );

            expect(html.text()).toContain('I do not use @asyncConnect');
            testState = store.getState();
            expect(testState.reduxAsyncConnect.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.lunch).toBe(undefined);
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

  it('properly fetches data in the correct order given a nested routing structure', function test() {
    return new Promise((resolve, reject) => {
      const store = createStore(reducers);
      const promiseOrder = [];
      const eat = spy((meal) => {
        promiseOrder.push(meal);
        return `yammi ${meal}`;
      });

      match({ routes, location: '/multi' }, (err, redirect, renderProps) => {
        if (err) {
          return reject(err);
        }

        if (redirect) {
          return reject(new Error('redirected'));
        }

        if (!renderProps) {
          return reject(new Error('404'));
        }

        return loadOnServer({ ...renderProps, store, helpers: { eat } })
          .then(() => {
            const html = render(
              <Provider store={store} key="provider">
                <ReduxAsyncConnect {...renderProps} />
              </Provider>
            );

            expect(html.text()).toContain('omelette');
            expect(html.text()).toContain('chicken');
            testState = store.getState();
            expect(testState.reduxAsyncConnect.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.breakfast).toBe('omelette');
            expect(testState.reduxAsyncConnect.dinner).toBe('chicken');
            expect(testState.reduxAsyncConnect.action).toBe('yammi dinner');
            expect(testState.reduxAsyncConnect.loadState.dinner.loading).toBe(false);
            expect(testState.reduxAsyncConnect.loadState.dinner.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.loadState.dinner.error).toBe(null);
            expect(testState.reduxAsyncConnect.loadState.breakfast.loading).toBe(false);
            expect(testState.reduxAsyncConnect.loadState.breakfast.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.loadState.breakfast.error).toBe(null);
            expect(eat.calledTwice).toBe(true);

            expect(promiseOrder).toEqual(['breakfast', 'dinner']);

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

  it('properly fetches data on the server when using immutable data structures', function test() {
    // We use a special reducer built for handling immutable js data
    const immutableReducers = combineImmutableReducers({
      reduxAsyncConnect: immutableReducer,
    });

    // We need to re-wrap the component so the mapStateToProps expects immutable js data
    const ImmutableWrappedApp = asyncConnect([{
      key: 'lunch',
      promise: () => Promise.resolve('sandwich'),
    }, {
      key: 'action',
      promise: ({ helpers }) => Promise.resolve(helpers.eat()),
    }], (state, ownProps) => ({
      externalState: state.getIn(['reduxAsyncConnect', '$$external']), // use immutablejs methods
      remappedProp: ownProps.route.remap,
    }))(App);

    // Custom routes using our custom immutable wrapped component
    const immutableRoutes = (
      <Route path="/">
        <IndexRoute component={ImmutableWrappedApp} remap="on" />
        <Route path="/notconnected" component={UnwrappedApp} />
      </Route>
    );

    // Set the mutability/immutability functions
    setToImmutableStateFunc(mutableState => Immutable.fromJS(mutableState));
    setToMutableStateFunc(immutableState => immutableState.toJS());

    return new Promise((resolve, reject) => {
      // Create the store with initial immutable data
      const store = createStore(immutableReducers, Immutable.Map({}));
      const eat = spy(() => 'yammi');

      // Use the custom immutable routes
      match({ routes: immutableRoutes, location: '/' }, (err, redirect, renderProps) => {
        if (err) {
          return reject(err);
        }

        if (redirect) {
          return reject(new Error('redirected'));
        }

        if (!renderProps) {
          return reject(new Error('404'));
        }

        return loadOnServer({ ...renderProps, store, helpers: { eat } })
          .then(() => {
            const html = render(
              <Provider store={store} key="provider">
                <ReduxAsyncConnect {...renderProps} />
              </Provider>
            );

            expect(html.text()).toContain('sandwich');
            testState = store.getState().toJS(); // convert to plain js for assertions
            expect(testState.reduxAsyncConnect.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.lunch).toBe('sandwich');
            expect(testState.reduxAsyncConnect.action).toBe('yammi');
            expect(testState.reduxAsyncConnect.loadState.lunch.loading).toBe(false);
            expect(testState.reduxAsyncConnect.loadState.lunch.loaded).toBe(true);
            expect(testState.reduxAsyncConnect.loadState.lunch.error).toBe(null);
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
});

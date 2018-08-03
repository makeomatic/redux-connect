import Enzyme, { mount, render } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Promise from 'bluebird';
import React from 'react';
import { Provider, connect } from 'react-redux';
import withRouter from 'react-router/withRouter';
import StaticRouter from 'react-router/StaticRouter';
import MemoryRouter from 'react-router/MemoryRouter';
import renderRoutes from 'react-router-config/renderRoutes';
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

  const ReduxAsyncConnect = withRouter(connect(null, {
    beginGlobalLoad: beginGlobalLoadSpy,
    endGlobalLoad: endGlobalLoadSpy,
  })(AsyncConnect));

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
    staticContext,
    // our param
    lunch,
    // react-redux dispatch prop
    dispatch,
    ...rest
  }) => <div {...rest}>{lunch}</div>;

  const MultiAppA = ({
    route,
    // our param
    breakfast,
    // react-redux dispatch prop
    ...rest
  }) => (
    <div>
      <div>{breakfast}</div>
      {renderRoutes(route.routes)}
    </div>
  );

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
  }], state => ({
    externalState: state.reduxAsyncConnect.$$external,
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

  const UnwrappedApp = ({ route }) => (
    <div>
      {'Hi, I do not use @asyncConnect'}
      {renderRoutes(route.routes)}
    </div>
  );

  const reducers = combineReducers({ reduxAsyncConnect });

  /*
  const routes = (
    <Route path="/">
      <IndexRoute component={WrappedApp} remap="on" />
      <Route path="/notconnected" component={UnwrappedApp} />
      <Route path="/multi" component={WrappedAppA}>
        <IndexRoute components={{ compA: UnwrappedApp, compB: WrappedAppB }} />
      </Route>
    </Route>
  );
  */

  const routes = [
    {
      path: '/', exact: true, component: WrappedApp, remap: 'on',
    },
    {
      path: '/notconnected', component: UnwrappedApp,
    },
    {
      path: '/multi',
      component: WrappedAppA,
      routes: [
        {
          path: '/multi',
          exact: true,
          component: UnwrappedApp,
          routes: [{ component: WrappedAppB }],
        },
      ],
    },
  ];

  // inter-test state
  let testState;

  it('properly fetches data on the server', function test() {
    const store = createStore(reducers);
    const eat = spy(() => 'yammi');
    const helpers = { eat };
    const location = { pathname: '/' };

    return loadOnServer({
      store, location, routes, helpers,
    })
      .then(() => {
        const context = {};

        const html = render((
          <Provider store={store} key="provider">
            <StaticRouter location={location} context={context}>
              <ReduxAsyncConnect routes={routes} helpers={helpers} />
            </StaticRouter>
          </Provider>
        ));

        if (context.url) {
          throw new Error('redirected');
        }

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
        endGlobalLoadSpy.resetHistory();
        beginGlobalLoadSpy.resetHistory();
      });
  });

  it('properly picks data up from the server', function test() {
    const store = createStore(reducers, testState);
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;
    const eat = spy(() => 'yammi');

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    const wrapper = mount((
      <Provider store={store} key="provider">
        <MemoryRouter>
          <ReduxAsyncConnect routes={routes} helpers={{ eat }} />
        </MemoryRouter>
      </Provider>
    ));

    expect(proto.loadAsyncData.called).toBe(false);
    expect(proto.componentDidMount.calledOnce).toBe(true);
    expect(eat.called).toBe(false);

    expect(wrapper.find(App).length).toBe(1);
    expect(wrapper.find(App).prop('lunch')).toBe('sandwich');

    // global loader spy
    expect(endGlobalLoadSpy.called).toBe(false);
    expect(beginGlobalLoadSpy.called).toBe(false);
    endGlobalLoadSpy.resetHistory();
    beginGlobalLoadSpy.resetHistory();

    proto.loadAsyncData.restore();
    proto.componentDidMount.restore();
  });

  it('loads data on client side when it wasn\'t provided by server', function test() {
    const store = createStore(reducers);
    const eat = spy(() => 'yammi');
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    mount((
      <Provider store={store} key="provider">
        <MemoryRouter>
          <ReduxAsyncConnect routes={routes} helpers={{ eat }} />
        </MemoryRouter>
      </Provider>
    ));

    expect(proto.loadAsyncData.calledOnce).toBe(true);
    expect(proto.componentDidMount.calledOnce).toBe(true);


    // global loader spy
    expect(beginGlobalLoadSpy.called).toBe(true);
    beginGlobalLoadSpy.resetHistory();

    return proto.loadAsyncData.returnValues[0].then(() => {
      expect(endGlobalLoadSpy.called).toBe(true);
      endGlobalLoadSpy.resetHistory();

      proto.loadAsyncData.restore();
      proto.componentDidMount.restore();
    });
  });

  it('supports extended connect signature', function test() {
    const store = createStore(reducers, initialState);
    const eat = spy(() => 'yammi');
    const proto = ReduxAsyncConnect.WrappedComponent.prototype;

    spy(proto, 'loadAsyncData');
    spy(proto, 'componentDidMount');

    const wrapper = mount((
      <Provider store={store} key="provider">
        <MemoryRouter>
          <ReduxAsyncConnect routes={routes} helpers={{ eat }} />
        </MemoryRouter>
      </Provider>
    ));

    expect(proto.loadAsyncData.calledOnce).toBe(true);
    expect(proto.componentDidMount.calledOnce).toBe(true);

    // global loader spy
    expect(beginGlobalLoadSpy.called).toBe(true);
    beginGlobalLoadSpy.resetHistory();

    return proto.loadAsyncData.returnValues[0].then(() => {
      expect(endGlobalLoadSpy.called).toBe(true);
      endGlobalLoadSpy.resetHistory();

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
    const store = createStore(reducers);
    const eat = spy(() => 'yammi');
    const location = { pathname: '/notconnected' };
    const helpers = { eat };

    return loadOnServer({
      store, location, routes, helpers,
    })
      .then(() => {
        const context = {};

        const html = render((
          <Provider store={store} key="provider">
            <StaticRouter location={location} context={context}>
              <ReduxAsyncConnect routes={routes} helpers={helpers} />
            </StaticRouter>
          </Provider>
        ));

        if (context.url) {
          throw new Error('redirected');
        }

        expect(html.text()).toContain('I do not use @asyncConnect');
        testState = store.getState();
        expect(testState.reduxAsyncConnect.loaded).toBe(true);
        expect(testState.reduxAsyncConnect.lunch).toBe(undefined);
        expect(eat.called).toBe(false);

        // global loader spy
        expect(endGlobalLoadSpy.called).toBe(false);
        expect(beginGlobalLoadSpy.called).toBe(false);
        endGlobalLoadSpy.resetHistory();
        beginGlobalLoadSpy.resetHistory();
      });
  });

  it('properly fetches data in the correct order given a nested routing structure', function test() {
    const store = createStore(reducers);
    const promiseOrder = [];
    const eat = spy((meal) => {
      promiseOrder.push(meal);
      return `yammi ${meal}`;
    });
    const location = { pathname: '/multi' };
    const helpers = { eat };

    return loadOnServer({
      store, routes, location, helpers,
    })
      .then(() => {
        const context = {};

        const html = render((
          <Provider store={store} key="provider">
            <StaticRouter location={location} context={context}>
              <ReduxAsyncConnect routes={routes} helpers={helpers} />
            </StaticRouter>
          </Provider>
        ));

        if (context.url) {
          throw new Error('redirected');
        }

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
        endGlobalLoadSpy.resetHistory();
        beginGlobalLoadSpy.resetHistory();
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
    /*
    const immutableRoutes = (
      <Route path="/">
        <IndexRoute component={ImmutableWrappedApp} remap="on" />
        <Route path="/notconnected" component={UnwrappedApp} />
      </Route>
    );
    */
    const immutableRoutes = [
      {
        path: '/', exact: true, component: ImmutableWrappedApp, remap: 'on',
      },
      { path: '/notconnected', component: UnwrappedApp },
    ];

    // Set the mutability/immutability functions
    setToImmutableStateFunc(mutableState => Immutable.fromJS(mutableState));
    setToMutableStateFunc(immutableState => immutableState.toJS());

    // Create the store with initial immutable data
    const store = createStore(immutableReducers, Immutable.Map({}));
    const eat = spy(() => 'yammi');
    const location = { pathname: '/' };
    const helpers = { eat };

    // Use the custom immutable routes
    return loadOnServer({
      store, location, routes: immutableRoutes, helpers,
    })
      .then(() => {
        const context = {};

        const html = render((
          <Provider store={store} key="provider">
            <StaticRouter location={location} context={context}>
              <ReduxAsyncConnect routes={immutableRoutes} helpers={helpers} />
            </StaticRouter>
          </Provider>
        ));

        if (context.url) {
          throw new Error('redirected');
        }

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
        endGlobalLoadSpy.resetHistory();
        beginGlobalLoadSpy.resetHistory();
      });
  });
});

ReduxConnect for React Router
============
[![npm version](https://img.shields.io/npm/v/redux-connect.svg?style=flat-square)](https://www.npmjs.com/package/redux-connect)
[![Build Status](https://travis-ci.org/makeomatic/redux-connect.svg?branch=master)](https://travis-ci.org/makeomatic/redux-connect)


How do you usually request data and store it to redux state?
You create actions that do async jobs to load data, create reducer to save this data to redux state,
then connect data to your component or container.

Usually it's very similar routine tasks.

Also, usually we want data to be preloaded. Especially if you're building universal app,
or you just want pages to be solid, don't jump when data was loaded.

This package consist of 2 parts: one part allows you to delay containers rendering until some async actions are happening.
Another stores your data to redux state and connect your loaded data to your container.

## Notice

This is a fork and refactor of [redux-async-connect](https://github.com/Rezonans/redux-async-connect)

## Installation & Usage

Using [npm](https://www.npmjs.com/):

`$ npm install redux-connect -S`

```js
import BrowserRouter from 'react-router-dom/BrowserRouter'
import renderRoutes from 'react-router-config/renderRoutes'
import { ReduxAsyncConnect, asyncConnect, reducer as reduxAsyncConnect } from 'redux-connect'
import React from 'react'
import { hydrate } from 'react-dom'
import { createStore, combineReducers } from 'redux'

// 1. Connect your data, similar to react-redux @connect
@asyncConnect([{
  key: 'lunch',
  promise: ({ match: { params }, helpers }) => Promise.resolve({ id: 1, name: 'Borsch' })
}])
class App extends React.Component {
  render() {
    // 2. access data as props
    const { lunch, route } = this.props

    return (
      <div>
        {lunch.name}
        {renderRoutes(route.routes)}
      </div>
    )
  }
}

class Child extends React.component {
  render() {
    return (
      <div>{'child component'}</div>
    )
  }
}

const routes = [{
  path: '/',
  component: App,
  routes: [{
    path: '/child',
    exact: true,
    component: Child,
  }]
}]

// 2. Connect redux async reducer
const store = createStore(combineReducers({ reduxAsyncConnect }), window.__data)

// 3. Render `Router` with ReduxAsyncConnect middleware
hydrate((
  <Provider store={store} key="provider">
    <BrowserRouter>
      <ReduxAsyncConnect routes={routes} helpers={helpers} />
    </BrowserRouter>
  </Provider>
), el)
```

### Server

```js
import { renderToString } from 'react-dom/server'
import StaticRouter from 'react-router/StaticRouter'
import { ReduxAsyncConnect, loadOnServer, reducer as reduxAsyncConnect } from 'redux-connect'
import { parse as parseUrl } from 'url'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import serialize from 'serialize-javascript'

app.get('*', (req, res) => {
  const store = createStore(combineReducers({ reduxAsyncConnect }))
  const url = req.originalUrl || req.url
  const location = parseUrl(url)

  // 1. load data
  loadOnServer({ store, location, routes, helpers })
    .then(() => {
      const context = {}

      // 2. use `ReduxAsyncConnect` to render component tree
      const appHTML = renderToString(
        <Provider store={store} key="provider">
          <StaticRouter location={location} context={context}>
            <ReduxAsyncConnect routes={routes} helpers={helpers} />
          </StaticRouter>
        </Provider>
      )

      // handle redirects
      if (context.url) {
        req.header('Location', context.url)
        return res.send(302)
      }

      // 3. render the Redux initial data into the server markup
      const html = createPage(appHTML, store)
      res.send(html)
    })
})

function createPage(html, store) {
  return `
    <!doctype html>
    <html>
      <body>
        <div id="app">${html}</div>

        <!-- its a Redux initial data -->
        <script type="text/javascript">
          window.__data=${serialize(store.getState())};
        </script>
      </body>
    </html>
  `
}
```

## [API](/docs/API.MD)

## Usage with `ImmutableJS`

This lib can be used with ImmutableJS or any other immutability lib by providing methods that convert the state between mutable and immutable data. Along with those methods, there is also a special immutable reducer that needs to be used instead of the normal reducer.

```js
import { setToImmutableStateFunc, setToMutableStateFunc, immutableReducer as reduxAsyncConnect } from 'redux-connect';

// Set the mutability/immutability functions
setToImmutableStateFunc((mutableState) => Immutable.fromJS(mutableState));
setToMutableStateFunc((immutableState) => immutableState.toJS());

// Thats all, now just use redux-connect as normal
export const rootReducer = combineReducers({
  reduxAsyncConnect,
  ...
})
```

## Comparing with other libraries

There are some solutions of problem described above:

- [**AsyncProps**](https://github.com/ryanflorence/async-props)
  It solves the same problem, but it doesn't work with redux state. Also it's significantly more complex inside,
  because it contains lots of logic to connect data to props.
  It uses callbacks against promises...
- [**react-fetcher**](https://github.com/markdalgleish/react-fetcher)
  It's very simple library too. But it provides you only interface for decorating your components and methods
  to fetch data for them. It doesn't integrated with React Router or Redux. So, you need to write you custom logic
  to delay routing transition for example.
- [**react-resolver**](https://github.com/ericclemmons/react-resolver)
  Works similar, but isn't integrated with redux.

**Redux Connect** uses awesome [Redux](https://github.com/reactjs/redux) to keep all fetched data in state.
This integration gives you agility:

- you can react on fetching actions like data loading or load success in your own reducers
- you can create own middleware to handle Redux Async Connect actions
- you can connect to loaded data anywhere else, just using simple redux @connect
- finally, you can debug and see your data using Redux Dev Tools

Also it's integrated with [React Router](https://github.com/rackt/react-router) to prevent routing transition
until data is loaded.

## Contributors
- [Vitaly Aminev](https://makeomatic.ca)
- [Gerhard Sletten](https://github.com/gerhardsletten)
- [Todd Bluhm](https://github.com/toddbluhm)
- [Eliseu Monar](https://github.com/eliseumds)
- [Rui Araújo](https://github.com/ruiaraujo)
- [Rodion Salnik](https://github.com/sars)
- [Rezonans team](https://github.com/Rezonans)

## Collaboration
You're welcome to PR, and we appreciate any questions or issues, please [open an issue](https://github.com/makeomatic/redux-connect/issues)!

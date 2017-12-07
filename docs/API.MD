API
============

## ReduxAsyncConnect
It allows to delay route transition until all promises returned by reduxAsyncConnect methods of components defined within corresponding route are resolved or rejected.

#### Props
##### `routes` (required)
Static route configuration (`Array<Route>`)

##### `filter`
Function used to filter `asyncConnect` items in components matched by `machRoutes`.
Has signature: `(item: { key?: string, promise: () => Promise<any> | undefined | any }, component: React.Component) => boolean`

##### `render`
Function that accepts props and used to render route components.
Defaults to `({ routes }) => renderRoutes(routes)`

##### `helpers`
Any helpers you may want pass to your reduxAsyncConnect static method.
For example some fetching library.

## asyncConnect decorator

```js
asyncConnect(AsyncProps: Array, mapStateToProps?, mapDispatchToProps?, mergeProps?, options?)
```

Signature now corresponds to [react-redux connect](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)

This function is used to decorate your container components that are connected to the router. It should provide a `mapStateToProps` object as follows:

```js
@asyncConnect([{
  key: 'lunches',
  promise: ({ store: { dispatch, getState }, helpers }) => (
    helpers.client.get('/lunches')
  ),
}])
export default class Home extends Component {
  // ...
}
```

`AsyncProps` is an array of objects with `key` and `promise` fields. 

The interface is similar to react-redux connect. The `key` field of each object will be used to connect data returned from from `promise` to both the redux state and the corresponding prop in the component.
So in example above you'll have `this.props.lunches`.

The `promise` field should be a function that accepts a single object as an option. 

Given that you are using `loadOnServer` as follows with the current version of react-router (v4.x at the time of writing),

    loadOnServer(params: { location: { pathname: string }, routes: Array<Route>, store? : { dispatch: (Action) => any, getState: () => any } , helpers?: any }) => Promise<void>

the option can include the following keys:

* _**store**_ - Includes methods `dispatch` and `getState`
* _**match**_ - `{ params: any, isExact: boolean, path: string, url: string }` the match object that also gets passed to `<Route>` render method
* _**route**_ - a reference to the matched item from routes array
* _**routes**_ - routes you have passed to `loadOnServer`
* _**helpers**_ - Any helpers you have passed from `loadOnServer`
* _**location**_ - location you have passed to `loadOnServer`

The `promise` function can return:
- _**undefined**_ - In this case we'll do nothing
- _**promise**_ - In this case we'll store data from this promise on the appropriate key in the redux state and will ask ReduxAsyncConnect to delay rendering until it's resolved.
- _**other value**_ - In this case we'll store this data to redux state on the appropriate key immediately

## reducer
This reducer MUST be mounted to `reduxAsyncConnect` key in combineReducers.
It uses to store information about global loading and all other data to redux store.

## redux state
You'll have the following in your `reduxAsyncConnect` key in redux state:
_(the [key] here is corresponding to mapStateToProps object's keys passed to asyncConnect decorator)_

- _**loaded**_ It's global loading identifier. Useful for page preloader
- _**[key].loading**_ Identifies that promise resolving in progress
- _**[key].loaded**_ Identifies that promise was resolved
- _**[key].data**_ Data, returned from resolved promise
- _**[key].error**_ Errors, returned from rejected promise

## redux actions
There are some actions you can react on:
- **LOAD** data loading for particular key is started
- **LOAD_SUCCESS** data loading process successfully finished. You'll have data returned from promise
- **LOAD_FAIL** data loading process was failed. You'll have error returned from promise
- **CLEAR** data for particular key was cleared
- **BEGIN_GLOBAL_LOAD** loading for all components began
- **END_GLOBAL_LOAD** loading for all components finished

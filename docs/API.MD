API
============

## ReduxAsyncConnect
It allows to delay route transition until all promises returned by reduxAsyncConnect methods of components defined within corresponding route are resolved or rejected.

#### Props
##### `components` (required)
The list of components corresponding current route. It not instances...
Usually it is provided by react Router component or match method from react router.

##### `params` (required)
Router params.
Usually it is provided by react Router component or match method from react router.

##### `render` (required)
Function that accepts props and uses to render components.
Usually it's just <RouterContext {...props} /> (by default)

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
  promise: (params, helpers) => helpers.client.get('/lunches'),
}])
export default class Home extends Component {
  // ...
}
```

The interface is similar to react-redux connect. The keys of this object will be used to connect data returned from from promise to corresponding prop in the component.
So in example above you'll have this.props.lunches

The value of each key should be function, that accepts params from router and helpers. Redux store exists in helpers by default.
This function can return:
- _**undefined**_ In this case we'll do nothing
- _**promise**_ In this case we'll store data from this promise to redux state to appropriate key and will ask ReduxAsyncConnect to delay rendering
- _**other value**_ In this case we'll store this data to redux state to appropriate key immediately

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

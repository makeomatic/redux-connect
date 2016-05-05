import { connect } from 'react-redux';
import { load, loadFail, loadSuccess, isPromise } from '../helpers/utils';

/**
 * Wraps react components with data loaders
 * @param  {Array} asyncItems
 * @return {WrappedComponent}
 */
function wrapWithDispatch(asyncItems) {
  return asyncItems.map(item => {
    const key = item.key;
    if (!key) {
      return item;
    }

    return {
      ...item,
      promise: options => {
        const { store: { dispatch } } = options;
        const next = item.promise(options);

        if (isPromise(next)) {
          dispatch(load(key));
          // add action dispatchers
          next.then(
            data => dispatch(loadSuccess(key, data)),
            err => dispatch(loadFail(key, err))
          );
        } else if (next) {
          dispatch(loadSuccess(key, next));
        }

        return next;
      },
    };
  });
}

export function asyncConnect(asyncItems) {
  return Component => {
    Component.reduxAsyncConnect = wrapWithDispatch(asyncItems);

    const finalMapStateToProps = state => (
      asyncItems.reduce((result, { key }) => {
        if (!key) {
          return result;
        }

        return {
          ...result,
          [key]: state.reduxAsyncConnect[key],
        };
      }, {})
    );

    return connect(finalMapStateToProps)(Component);
  };
}

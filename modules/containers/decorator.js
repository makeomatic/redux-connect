import { connect } from 'react-redux';
import { isPromise } from '../helpers/utils';
import { load, loadFail, loadSuccess } from '../store';
import { getMutableState, getImmutableState } from '../helpers/state';

/**
 * Wraps react components with data loaders
 * @param  {Array} asyncItems
 * @return {WrappedComponent}
 */
function wrapWithDispatch(asyncItems) {
  return asyncItems.map((item) => {
    const { key } = item;
    if (!key) return item;

    return {
      ...item,
      promise: (options) => {
        const { store: { dispatch } } = options;
        const next = item.promise(options);

        // NOTE: possibly refactor this with a breaking change in mind for future versions
        // we can return result of processed promise/thunk if need be
        if (isPromise(next)) {
          dispatch(load(key));
          // add action dispatchers
          next
            .then(data => dispatch(loadSuccess(key, data)))
            .catch(err => dispatch(loadFail(key, err)));
        } else if (next) {
          dispatch(loadSuccess(key, next));
        }

        return next;
      },
    };
  });
}

/**
 * Exports decorator, which wraps React components with asyncConnect and connect at the same time
 * @param  {Array} asyncItems
 * @param  {Function} [mapStateToProps]
 * @param  {Object|Function} [mapDispatchToProps]
 * @param  {Function} [mergeProps]
 * @param  {Object} [options]
 * @return {Function}
 */
export function asyncConnect(asyncItems, mapStateToProps, mapDispatchToProps, mergeProps, options) {
  return (Component) => {
    Component.reduxAsyncConnect = wrapWithDispatch(asyncItems);

    const finalMapStateToProps = (state, ownProps) => {
      const mutableState = getMutableState(state);
      const asyncStateToProps = asyncItems.reduce((result, { key }) => {
        if (!key) {
          return result;
        }

        return {
          ...result,
          [key]: mutableState.reduxAsyncConnect[key],
        };
      }, {});

      if (typeof mapStateToProps !== 'function') {
        return asyncStateToProps;
      }

      return {
        ...mapStateToProps(getImmutableState(mutableState), ownProps),
        ...asyncStateToProps,
      };
    };

    return connect(finalMapStateToProps, mapDispatchToProps, mergeProps, options)(Component);
  };
}

// convenience export
export default asyncConnect;

import { endGlobalLoad } from '../store';

/**
 * Tells us if input looks like promise or not
 * @param  {Mixed} obj
 * @return {Boolean}
 */
export function isPromise(obj) {
  return typeof obj === 'object' && obj && obj.then instanceof Function;
}

/**
 * Utility to be able to iterate over array of promises in an async fashion
 * @param  {Array} iterable
 * @param  {Function} iterator
 * @return {Promise}
 */
const mapSeries = Promise.mapSeries || function promiseMapSeries(iterable, iterator) {
  const length = iterable.length;
  const results = new Array(length);
  let i = 0;

  return Promise.resolve()
    .then(function iterateOverResults() {
      return iterator(iterable[i], i, iterable).then(result => {
        results[i++] = result;
        if (i < length) {
          return iterateOverResults();
        }

        return results;
      });
    });
};

/**
 * We need to iterate over all components for specified routes.
 * Components array can include objects if named components are used:
 * https://github.com/rackt/react-router/blob/latest/docs/API.md#named-components
 *
 * @param components
 * @param iterator
 */
export function eachComponents(components, iterator) {
  const l = components.length;
  for (let i = 0; i < l; i++) {
    const component = components[i];
    if (typeof component === 'object') {
      const keys = Object.keys(component);
      keys.forEach(key => iterator(component[key], i, key));
    } else {
      iterator(component, i);
    }
  }
}

/**
 * Returns flattened array of components that are wrapped with reduxAsyncConnect
 * @param  {Array} components
 * @return {Array}
 */
export function filterAndFlattenComponents(components) {
  const flattened = [];
  eachComponents(components, component => {
    if (component && component.reduxAsyncConnect) {
      flattened.push(component);
    }
  });
  return flattened;
}

/**
 * Function that accepts components with reduxAsyncConnect definitions
 * and loads data
 * @param  {Object} data.components
 * @param  {Function} [data.filter] - filtering function
 * @return {Promise}
 */
export function loadAsyncConnect({ components, filter = () => true, ...rest }) {
  const flattened = filterAndFlattenComponents(components);

  // this allows us to have nested promises, that rely on each other's completion
  // cycle
  return mapSeries(flattened, component => {
    const asyncItems = component.reduxAsyncConnect;

    // get array of results
    const results = asyncItems.reduce((itemsResults, item) => {
      if (filter(item, component)) {
        let promiseOrResult = item.promise(rest);

        if (isPromise(promiseOrResult)) {
          promiseOrResult = promiseOrResult.catch(error => ({ error }));
        }

        itemsResults.push(promiseOrResult);
      }

      return itemsResults;
    }, []);

    return Promise.all(results)
      .then(finalResults => finalResults.reduce((finalResult, result, idx) => {
        const { key } = asyncItems[idx];
        if (key) {
          finalResult[key] = result;
        }

        return finalResult;
      }, {}));
  });
}

/**
 * Helper to load data on server
 * @param  {Mixed} args
 * @return {Promise}
 */
export function loadOnServer(args) {
  return loadAsyncConnect(args).then(() => {
    args.store.dispatch(endGlobalLoad());
  });
}

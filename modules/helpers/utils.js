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
 * We need to iterate over all components for specified routes.
 * Components array can include objects if named components are used:
 * https://github.com/rackt/react-router/blob/latest/docs/API.md#named-components
 *
 * @param components
 * @param iterator
 */
export function eachComponents(components, iterator) {
  for (let i = 0, l = components.length; i < l; i++) { // eslint-disable-line id-length
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

const promiseMapSeries = Promise.mapSeries || function mapSeries(array, iterator) {
  const length = array.length;
  let current = Promise.resolve();
  const results = new Array(length);
  const cb = (arr, index) => () => iterator(array[index], index, arr);

  for (let i = 0; i < length; ++i) {
    current = results[i] = current.then(cb(array, i));
  }

  return Promise.all(results);
};


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
  return promiseMapSeries(flattened, component => {
    const asyncItems = component.reduxAsyncConnect || [];

    return Promise.all(asyncItems
        .reduce((itemsResults, item) => {
          if (filter(item, component)) {
            let promiseOrResult = item.promise(rest);

            if (isPromise(promiseOrResult)) {
              promiseOrResult = promiseOrResult.catch(error => ({ error }));
            }

            return itemsResults.concat(promiseOrResult);
          }

          return itemsResults;
        }, []))
        .then(results => results.reduce((finalResult, result, idx) => {
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

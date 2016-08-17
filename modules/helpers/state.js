// Global vars holding the custom state conversion methods. Default is just identity methods
let immutableStateFunc = (state) => state;
let mutableStateFunc = (state) => state;

/**
 * Sets the function to be used for converting mutable state to immutable state
 * @param {Function} func Converts mutable state to immutable state [(state) => state]
 */
export function setToImmutableStateFunc(func) {
  immutableStateFunc = func;
}

/**
 * Sets the function to be used for converting immutable state to mutable state
 * @param {Function} func Converts immutable state to mutable state [(state) => state]
 */
export function setToMutableStateFunc(func) {
  mutableStateFunc = func;
}

/**
 * Call when needing to transform mutable data to immutable data using the preset function
 * @param {Object} state Mutable state thats converted to immutable state by user defined func
 */
export function getImmutableState(state) {
  return immutableStateFunc(state);
}

/**
 * Call when needing to transform immutable data to mutable data using the preset function
 * @param {Immutable} state Immutable state thats converted to mutable state by user defined func
 */
export function getMutableState(state) {
  return mutableStateFunc(state);
}

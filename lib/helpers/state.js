"use strict";

exports.__esModule = true;
exports.setToImmutableStateFunc = setToImmutableStateFunc;
exports.setToMutableStateFunc = setToMutableStateFunc;
// Global vars holding the custom state conversion methods. Default is just identity methods
var identity = function identity(arg) {
  return arg;
};

// default pass-through functions
var immutableStateFunc = identity;
var mutableStateFunc = identity;

/**
 * Sets the function to be used for converting mutable state to immutable state
 * @param {Function} func Converts mutable state to immutable state [(state) => state]
 */
function setToImmutableStateFunc(func) {
  immutableStateFunc = func;
}

/**
 * Sets the function to be used for converting immutable state to mutable state
 * @param {Function} func Converts immutable state to mutable state [(state) => state]
 */
function setToMutableStateFunc(func) {
  mutableStateFunc = func;
}

/**
 * Call when needing to transform mutable data to immutable data using the preset function
 * @param {Object} state Mutable state thats converted to immutable state by user defined func
 */
var getImmutableState = exports.getImmutableState = function getImmutableState(state) {
  return immutableStateFunc(state);
};

/**
 * Call when needing to transform immutable data to mutable data using the preset function
 * @param {Immutable} state Immutable state thats converted to mutable state by user defined func
 */
var getMutableState = exports.getMutableState = function getMutableState(state) {
  return mutableStateFunc(state);
};
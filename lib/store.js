'use strict';

exports.__esModule = true;
exports.immutableReducer = exports.reducer = exports.loadFail = exports.loadSuccess = exports.load = exports.endGlobalLoad = exports.beginGlobalLoad = exports.clearKey = undefined;

var _extends8 = require('babel-runtime/helpers/extends');

var _extends9 = _interopRequireDefault(_extends8);

var _handleActions;

var _reduxActions = require('redux-actions');

var _state = require('./helpers/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var clearKey = exports.clearKey = (0, _reduxActions.createAction)('@redux-conn/CLEAR');
var beginGlobalLoad = exports.beginGlobalLoad = (0, _reduxActions.createAction)('@redux-conn/BEGIN_GLOBAL_LOAD');
var endGlobalLoad = exports.endGlobalLoad = (0, _reduxActions.createAction)('@redux-conn/END_GLOBAL_LOAD');
var load = exports.load = (0, _reduxActions.createAction)('@redux-conn/LOAD', function (key) {
  return { key: key };
});
var loadSuccess = exports.loadSuccess = (0, _reduxActions.createAction)('@redux-conn/LOAD_SUCCESS', function (key, data) {
  return { key: key, data: data };
});
var loadFail = exports.loadFail = (0, _reduxActions.createAction)('@redux-conn/LOAD_FAIL', function (key, error) {
  return { key: key, error: error };
});

var initialState = {
  loaded: false,
  loadState: {}
};

var reducer = exports.reducer = (0, _reduxActions.handleActions)((_handleActions = {}, _handleActions[beginGlobalLoad] = function (state) {
  return (0, _extends9.default)({}, state, {
    loaded: false
  });
}, _handleActions[endGlobalLoad] = function (state) {
  return (0, _extends9.default)({}, state, {
    loaded: true
  });
}, _handleActions[load] = function (state, _ref) {
  var _extends2;

  var payload = _ref.payload;
  return (0, _extends9.default)({}, state, {
    loadState: (0, _extends9.default)({}, state.loadState, (_extends2 = {}, _extends2[payload.key] = {
      loading: true,
      loaded: false
    }, _extends2))
  });
}, _handleActions[loadSuccess] = function (state, _ref2) {
  var _extends3, _extends4;

  var _ref2$payload = _ref2.payload;
  var key = _ref2$payload.key;
  var data = _ref2$payload.data;
  return (0, _extends9.default)({}, state, (_extends4 = {
    loadState: (0, _extends9.default)({}, state.loadState, (_extends3 = {}, _extends3[key] = {
      loading: false,
      loaded: true,
      error: null
    }, _extends3))
  }, _extends4[key] = data, _extends4));
}, _handleActions[loadFail] = function (state, _ref3) {
  var _extends5;

  var _ref3$payload = _ref3.payload;
  var key = _ref3$payload.key;
  var error = _ref3$payload.error;
  return (0, _extends9.default)({}, state, {
    loadState: (0, _extends9.default)({}, state.loadState, (_extends5 = {}, _extends5[key] = {
      loading: false,
      loaded: false,
      error: error
    }, _extends5))
  });
}, _handleActions[clearKey] = function (state, _ref4) {
  var _extends6, _extends7;

  var payload = _ref4.payload;
  return (0, _extends9.default)({}, state, (_extends7 = {
    loadState: (0, _extends9.default)({}, state.loadState, (_extends6 = {}, _extends6[payload] = {
      loading: false,
      loaded: false,
      error: null
    }, _extends6))
  }, _extends7[payload] = null, _extends7));
}, _handleActions), initialState);

var immutableReducer = exports.immutableReducer = function wrapReducer(immutableState, action) {
  // We need to convert immutable state to mutable state before our reducer can act upon it
  var mutableState = void 0;
  if (immutableState === undefined) {
    // if state is undefined (no initial state yet) then we can't convert it, so let the
    // reducer set the initial state for us
    mutableState = immutableState;
  } else {
    // Convert immutable state to mutable state so our reducer will accept it
    mutableState = (0, _state.getMutableState)(immutableState);
  }

  // Run the reducer and then re-convert the mutable output state back to immutable state
  return (0, _state.getImmutableState)(reducer(mutableState, action));
};
'use strict';

exports.__esModule = true;

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

exports.asyncConnect = asyncConnect;

var _reactRedux = require('react-redux');

var _utils = require('../helpers/utils');

var _store = require('../store');

var _state = require('../helpers/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Wraps react components with data loaders
 * @param  {Array} asyncItems
 * @return {WrappedComponent}
 */
function wrapWithDispatch(asyncItems) {
  return asyncItems.map(function (item) {
    var key = item.key;
    if (!key) {
      return item;
    }

    return (0, _extends4.default)({}, item, {
      promise: function promise(options) {
        var dispatch = options.store.dispatch;

        var next = item.promise(options);

        if ((0, _utils.isPromise)(next)) {
          dispatch((0, _store.load)(key));
          // add action dispatchers
          next.then(function (data) {
            return dispatch((0, _store.loadSuccess)(key, data));
          }, function (err) {
            return dispatch((0, _store.loadFail)(key, err));
          });
        } else if (next) {
          dispatch((0, _store.loadSuccess)(key, next));
        }

        return next;
      }
    });
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
function asyncConnect(asyncItems, mapStateToProps, mapDispatchToProps, mergeProps, options) {
  return function (Component) {
    Component.reduxAsyncConnect = wrapWithDispatch(asyncItems);

    var finalMapStateToProps = function finalMapStateToProps(state, ownProps) {
      var mutableState = (0, _state.getMutableState)(state);
      var asyncStateToProps = asyncItems.reduce(function (result, _ref) {
        var _extends2;

        var key = _ref.key;

        if (!key) {
          return result;
        }

        return (0, _extends4.default)({}, result, (_extends2 = {}, _extends2[key] = mutableState.reduxAsyncConnect[key], _extends2));
      }, {});

      if (typeof mapStateToProps !== 'function') {
        return asyncStateToProps;
      }

      return (0, _extends4.default)({}, mapStateToProps((0, _state.getImmutableState)(mutableState), ownProps), asyncStateToProps);
    };

    return (0, _reactRedux.connect)(finalMapStateToProps, mapDispatchToProps, mergeProps, options)(Component);
  };
}

// convinience export
exports.default = asyncConnect;
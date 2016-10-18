'use strict';

exports.__esModule = true;
exports.AsyncConnect = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _RouterContext = require('react-router/lib/RouterContext');

var _RouterContext2 = _interopRequireDefault(_RouterContext);

var _utils = require('../helpers/utils');

var _state = require('../helpers/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AsyncConnect = exports.AsyncConnect = function (_Component) {
  (0, _inherits3.default)(AsyncConnect, _Component);

  function AsyncConnect(props, context) {
    (0, _classCallCheck3.default)(this, AsyncConnect);

    var _this = (0, _possibleConstructorReturn3.default)(this, _Component.call(this, props, context));

    _this.state = {
      propsToShow: _this.isLoaded() ? props : null
    };

    _this.mounted = false;
    _this.loadDataCounter = 0;
    return _this;
  }

  AsyncConnect.prototype.componentDidMount = function componentDidMount() {
    this.mounted = true;
    var dataLoaded = this.isLoaded();

    // we dont need it if we already made it on server-side
    if (!dataLoaded) {
      this.loadAsyncData(this.props);
    }
  };

  AsyncConnect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    // Allow a user supplied function to determine if an async reload is necessary
    if (this.props.reloadOnPropsChange(this.props, nextProps)) {
      this.loadAsyncData(nextProps);
    }
  };

  AsyncConnect.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState) {
    return this.state.propsToShow !== nextState.propsToShow;
  };

  AsyncConnect.prototype.componentWillUnmount = function componentWillUnmount() {
    this.mounted = false;
  };

  AsyncConnect.prototype.isLoaded = function isLoaded() {
    return (0, _state.getMutableState)(this.context.store.getState()).reduxAsyncConnect.loaded;
  };

  AsyncConnect.prototype.loadAsyncData = function loadAsyncData(props) {
    var _this2 = this;

    var store = this.context.store;
    var loadResult = (0, _utils.loadAsyncConnect)((0, _extends3.default)({}, props, { store: store }));

    // TODO: think of a better solution to a problem?
    this.loadDataCounter++;
    this.props.beginGlobalLoad();
    return function (loadDataCounterOriginal) {
      return loadResult.then(function () {
        // We need to change propsToShow only if loadAsyncData that called this promise
        // is the last invocation of loadAsyncData method. Otherwise we can face a situation
        // when user is changing route several times and we finally show him route that has
        // loaded props last time and not the last called route
        if (_this2.loadDataCounter === loadDataCounterOriginal && _this2.mounted !== false) {
          _this2.setState({ propsToShow: props });
        }

        // TODO: investigate race conditions
        // do we need to call this if it's not last invocation?
        _this2.props.endGlobalLoad();
      });
    }(this.loadDataCounter);
  };

  AsyncConnect.prototype.render = function render() {
    var propsToShow = this.state.propsToShow;

    if (!propsToShow) {
      return this.props.renderLoading && this.props.renderLoading(this.props);
    }

    return this.props.render(propsToShow);
  };

  return AsyncConnect;
}(_react.Component);

AsyncConnect.contextTypes = {
  store: _react.PropTypes.object.isRequired
};
AsyncConnect.defaultProps = {
  reloadOnPropsChange: function reloadOnPropsChange() {
    return true;
  },
  render: function render(props) {
    return _react2.default.createElement(_RouterContext2.default, props);
  }
};
exports.default = AsyncConnect;
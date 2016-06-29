'use strict';

exports.__esModule = true;

var _AsyncConnect = require('../components/AsyncConnect');

var _AsyncConnect2 = _interopRequireDefault(_AsyncConnect);

var _reactRedux = require('react-redux');

var _store = require('../store');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _reactRedux.connect)(null, { beginGlobalLoad: _store.beginGlobalLoad, endGlobalLoad: _store.endGlobalLoad })(_AsyncConnect2.default);
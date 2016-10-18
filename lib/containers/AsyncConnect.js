'use strict';

exports.__esModule = true;

var _reactRedux = require('react-redux');

var _AsyncConnect = require('../components/AsyncConnect');

var _store = require('../store');

exports.default = (0, _reactRedux.connect)(null, { beginGlobalLoad: _store.beginGlobalLoad, endGlobalLoad: _store.endGlobalLoad })(_AsyncConnect.AsyncConnect);
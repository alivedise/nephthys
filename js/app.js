define(function(require, exports, module) {
  'use strict';
  var jquery = require('lib/jquery-1.10.2.min');

  module.export = App;
  var App = function(config) {
    this.win = config.win;
    this.doc = config.doc;
    this.element = config.element;
  };
});
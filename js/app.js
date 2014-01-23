'use strict';

(function(exports) {
  var LayoutController = exports.LayoutController;

  var App = function() {
    this.init();
  };

  App.prototype = {
    init: function() {
      this.layoutController = new LayoutController();
      this.filter = new Filter();
    }
  };

  exports.App = App;
}(this));
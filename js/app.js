'use strict';

(function(exports) {
  var LayoutController = exports.LayoutController;

  var App = function() {
    this.init();
  };

  App.prototype = {
    init: function() {
      this.layoutController = new LayoutController();
      $(function() {
        
      });
    }
  };

  exports.App = App;
}(this));
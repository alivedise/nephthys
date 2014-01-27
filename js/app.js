'use strict';

(function(exports) {
  var App = function() {
    this.init();
  };

  App.prototype = {
    init: function() {
      this.layoutController = new LayoutController();
      this.filter = new Filter();
      this.colorManager = new ColorManager();
    }
  };

  exports.App = App;
}(this));
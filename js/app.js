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
      this.broadcaster = new EventEmitter();
    }
  };

  exports.App = App;
}(this));
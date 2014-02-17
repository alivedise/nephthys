'use strict';

(function(exports) {
  var ThreadManager = function(app) {
    this.app = app;
    window.broadcaster.on('profile-imported-stage-0', this.init.bind(this));
  };
  ThreadManager.prototype = new EventEmitter();
  ThreadManager.prototype.constructor = ThreadManager;
  ThreadManager.prototype.init = function() {
    this._threads = {};
  };

  exports.ThreadManager = ThreadManager;
}(this));
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
      this.broadcaster = window.broadcaster;
      this.timeline = new Timeline();
      this.tooltip = new Tooltip();
      this.taskManager = new TaskManager(this);
      this.processManager = new ProcessManager(this);
      this.register();
    },
    _threads: [],
    register: function() {
      window.broadcaster.on('profile-imported', this._on_profile_imported.bind(this));
      window.broadcaster.on('-thread-created', this._on_thread_created.bind(this));
    },
    _on_thread_created: function(thread) {
      this._threads.push(thread);
    },
    _on_profile_imported: function() {
      this._threads.forEach(function(thread) {
        thread.destroy();
      }, this);
    }
  };

  exports.App = App;
}(this));
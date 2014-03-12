'use strict';

(function(exports) {
  var App = function() {
    this.init();
  };

  App.prototype = {
    init: function() {
      this._start = new Date().getTime();
      this.layoutController = new LayoutController();
      this.filter = new Filter();
      this.colorManager = new ColorManager();
      this.broadcaster = window.broadcaster;
      this.timeline = new Timeline();
      this.tooltip = new Tooltip(this);
      this.taskManager = new TaskManager(this);
      this.threadManager = new ThreadManager(this);
      this.processManager = new ProcessManager(this);
      this.progress = new Progress(this);
      this.scaleToolBar = new ScaleToolBar();
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
    },
    debug: function() {
      console.log('[' + (new Date().getTime()) - this._start + ']' + arguments);
    },
    dump: function() {
      try {
        throw new Error('x');
      } catch (e) {
        console.log(e.stack);
      }
    }
  };

  exports.App = App;
}(this));
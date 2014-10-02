'use strict';

(function(exports) {
  var App = function() {
    this.init();
  };

  App.prototype = {
    VERSION: '0.7.3',
    REMOTE: 'https://popping-fire-7165.firebaseio.com/tasks',
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
      this.scaleToolBar = new ScaleToolBar(this);
      this.labelToolBar = new LabelToolBar(this);
      this.labelSelector = new LabelSelector(this);
      this.threadToggler = new ThreadToggler(this);
      this.setupDialog = new SetupDialog(this);
      this.uploadToolBar = new UploadToolBar(this);
      this.uploadDialog = new UploadDialog(this);
      this.register();

      Isis.init();
    },
    _threads: [],
    register: function() {
      window.broadcaster.on('profile-imported', this._on_profile_imported.bind(this));
      window.broadcaster.on('-thread-created', this._on_thread_created.bind(this));
      window.broadcaster.on('range-created', this._on_range_created.bind(this));
    },
    _on_thread_created: function(thread) {
      this._threads.push(thread);
    },
    _on_profile_imported: function() {
      this._threads.forEach(function(thread) {
        thread.destroy();
      }, this);
    },
    _on_range_created: function(start, interval) {
      this.start = start;
      this.interval = interval;
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
'use strict';

(function(exports) {
  var ThreadManager = function(app) {
    this.app = app;
    this.element = $(this.containerElement);
    window.broadcaster.on('profile-imported-stage-0', this.init.bind(this));
    window.broadcaster.on('timeline-range-changed', this._timeline_range_changed.bind(this));
    window.broadcaster.on('-thread-created', this._add_thread.bind(this));
  };
  ThreadManager.prototype = new EventEmitter();
  ThreadManager.prototype.constructor = ThreadManager;
  ThreadManager.prototype.init = function() {
    this._threads = [];
    this._renderedThreads = [];
    if (!this._canvas) {
      this.WIDTH = $(this.containerElement).width();
      this._canvas =
        Raphael(this.containerElement,
          this.WIDTH, this.HEIGHT);
    } else {
      this._canvas.clear();
    }
    this._registerEvents();
  };

  ThreadManager.prototype._registerEvents = function() {
    if (this._registered) {
      return;
    }
    this._registered = true;
    /** Trigger tooltip for tasks */
    this.element.mousemove(function(evt) {
      var x = evt.pageX;
      var y = evt.pageY;
      var ele = this._canvas.getElementByPoint(x, y);
      if (ele && ele.data('task')) {
        window.broadcaster.emit('-task-hovered', ele.data('task'), x, y);
      } else {
        window.broadcaster.emit('-task-out');
      }
    }.bind(this));
  };
  ThreadManager.prototype.containerElement = document.getElementById('map');
  ThreadManager.prototype.WIDTH = 500;
  ThreadManager.prototype.HEIGHT = 500;
  ThreadManager.prototype.getCanvas = function() {
    return this._canvas;
  };

  ThreadManager.prototype._add_thread = function(thread) {
    this._threads.push(thread);
  };

  ThreadManager.prototype._timeline_range_changed = function(x, w) {
    this._canvas.setViewBox(x, 0, w, this.HEIGHT, true);
  };

  exports.ThreadManager = ThreadManager;
}(this));
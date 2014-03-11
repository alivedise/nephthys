'use strict';

(function(exports) {
  var ThreadManager = function(app) {
    this.app = app;
    window.broadcaster.on('profile-imported-stage-0', this.init.bind(this));
    window.broadcaster.on('-thread-created', this.addThread.bind(this));
    /** Trigger tooltip for tasks */
    this.element.mousemove(function(evt) {
      if (!this._canvas) {
        return;
      }
      var x = evt.pageX;
      var y = evt.pageY;
      var ele = this._canvas.getElementByPoint(x, y);
      if (ele && ele.data('task')) {
        window.broadcaster.emit('-task-hovered', ele.data('task'), x, y);
      } else {
        window.broadcaster.emit('-task-out');
      }
    }.bind(this));

    /** Focus the element to show the connections */
    this.element.click(function(evt) {
      if (!this._canvas) {
        return;
      }
      window.broadcaster.emit('canvas-focused');
      var x = evt.pageX;
      var y = evt.pageY;
      var ele = this._canvas.getElementByPoint(x, y);
      if (ele && ele.data('task')) {
        window.broadcaster.emit('-task-focused', ele.data('task'), x, y);
      } else {
        window.broadcaster.emit('-task-out');
      }
    }.bind(this));

    /** Zoom in the canvas */
    this.element.dblclick(function(evt) {
      if (!this._canvas) {
        return;
      }
      var x = evt.pageX;
      var y = evt.pageY;
      var ele = this._canvas.getElementByPoint(x, y);
      console.log(x, y, evt, ele);
      if (!ele) {
        window.broadcaster.emit('-task-out');
        return;
      }
      if (ele.data('task')) {
        window.broadcaster.emit('-task-focused', ele.data('task'), x, y);
      } else if (ele.data('thread')) {
      }
    }.bind(this));
  };
  ThreadManager.prototype = new EventEmitter();
  ThreadManager.prototype.getCanvas = function() {
    if (!this.WIDTH) {
      this.WIDTH = this.element.width();
    }
    if (!this._canvas) {
      this._canvas =
        Raphael(document.getElementById('canvas'),
                this.WIDTH, this.HEIGHT); 
    }
    return this._canvas;
  };
  ThreadManager.prototype.addThread = function(thread) {
    this._threads[thread.threadId] = thread;
    this.HEIGHT += thread.HEIGHT;
    this._canvas.setSize(this.WIDTH, this.HEIGHT);
  };
  ThreadManager.prototype.HEIGHT = 0;
  ThreadManager.prototype.element = $('#canvas');
  ThreadManager.prototype.constructor = ThreadManager;
  ThreadManager.prototype.init = function() {
    this._threads = {};
    this.HEIGHT = 0;
  };

  exports.ThreadManager = ThreadManager;
}(this));
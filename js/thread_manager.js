'use strict';

(function(exports) {
  var ThreadManager = function(app) {
    this.app = app;
    window.broadcaster.on('profile-imported-stage-0', this.init.bind(this));
    window.broadcaster.on('-thread-created', this.addThread.bind(this));
    window.broadcaster.on('process-focused', this.focusThread.bind(this));
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
      window.broadcaster.emit('-thread-manager-zoom-in', x, y, this.WIDTH, this.HEIGHT);
    }.bind(this));

    $(document).keydown(function(evt) {
      if (!this._currentThreads) {
        return;
      }
      switch (evt.keyCode) {
        case 37:
          window.broadcaster.emit('-thread-manager-move-left');
          break;
        case 38:
          break;
        case 39:
          window.broadcaster.emit('-thread-manager-move-right');
          break;
        case 40:
          break;
      }
    }.bind(this));

    window.broadcaster.on('-thread-request-open', this.handleThreadOpen.bind(this));
    window.broadcaster.on('-thread-request-close', this.handleThreadClose.bind(this));
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
    this._threads[thread.threadId || thread.id] = thread;
    this._currentThreads.push(thread);
    this.HEIGHT += thread.HEIGHT;
    this._canvas.setSize(this.WIDTH, this.HEIGHT);
  };
  ThreadManager.prototype.HEIGHT = 0;
  ThreadManager.prototype.element = $('#canvas');
  ThreadManager.prototype.constructor = ThreadManager;
  ThreadManager.prototype.init = function() {
    this._threads = {};
    this._currentThreads = [];
    this.HEIGHT = 0;
  };
  ThreadManager.prototype.getThreadName = function(id) {
    var name = '';
    if (this._currentThreads) {
      this._currentThreads.some(function(thread) {
        if (Number(thread.threadId || thread.id) === Number(id)) {
          name = thread.threadName;
          return true;
        }
      }, this)
    }
    return name;
  };
  ThreadManager.prototype.focusThread = function(processId) {
    if (!this._currentThreads) {
      return;
    }
    for (var id in this._threads) {
      if (String(this._threads[id].config.tasks[0].processId) == String(processId)) {
        document.getElementById('canvas').scrollTop =
          this._threads[id].config.offsetY;
        return;
      }
    }
  };
  ThreadManager.prototype.updateUI = function() {
    var accumulatedHeight = 0;
    this._currentThreads.forEach(function(thread) {
      thread.updateOffset(accumulatedHeight);
      accumulatedHeight += thread.getHeight();
    }, this);
    this.HEIGHT = accumulatedHeight;
    this._canvas.setSize(this.WIDTH, this.HEIGHT);
    window.broadcaster.emit('-thread-manager-ui-updated');
  };
  ThreadManager.prototype.handleThreadClose = function() {
    this._update_layout();
  };
  ThreadManager.prototype.handleThreadOpen = function() {
    this._update_layout();
  };
  ThreadManager.prototype._update_layout = function() {
    if (!this._timer) {
      this._timer = setTimeout(function() {
        this.updateUI();
        this._timer = null;
      }.bind(this), this.TIMEOUT);
    }
  };
  ThreadManager.prototype.TIMEOUT = 100;
  exports.ThreadManager = ThreadManager;
}(this));
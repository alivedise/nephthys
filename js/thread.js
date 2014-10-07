/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2 -*- */
'use strict';

(function(exports) {
  var _id = 0;
  var Thread = function(config) {
    this.config = config;
    this.threadId = this.config.threadId || this.config.id || this.config.tasks[0].threadId;
    this.init();
    this.instanceID = this.CLASS_NAME + _id++;
    Thread[this.instanceID] = this;
    window.broadcaster.emit('-thread-created', this);
  };

  Thread.prototype = new EventEmitter();

  Thread.prototype.constructor = Thread;

  Thread.prototype.LISTENERS = {
    'open-all-threads': 'open',
    'close-all-threads': 'close',
    '-filter-source-event-ids': '_filter_source_event_ids',
    '-filter-source-event-id': '_filter_source_event_id',
    '-filter-label': '_filter_label',
    '-filter-cleared': 'showAllTasks',
    'timeline-range-changed': '_timeline_range_changed',
    '-filter-label-toggle': '_filter_label_toggle',
    '-task-id-toggle': '_task_id_toggle',
    '-thread-manager-zoom-in': '_thread_manager_zoom_in',
    '-thread-manager-move-right': '_thread_manager_move_right',
    '-thread-manager-move-left': '_thread_manager_move_left',
    '-scale-toolbar-zoom-in': '_scale_toolbar_zoom_in',
    '-scale-toolbar-zoom-out': '_scale_toolbar_zoom_out',
    '-scale-toolbar-reset': '_scale_toolbar_reset',
    '-thread-toggler-opened': 'open',
    '-thread-toggler-closed': 'close'
  };

  Thread.prototype.CLASS_NAME = 'thread-';

  Thread.prototype.createNestedLoopTree = function(tasks) {
    function _createNestedLoopTree(tasks) {
      var leveltasks = [];
      for (var i = 0; i < tasks.length;) {
        var cur;
        cur = tasks[i++];
        leveltasks.push(cur);
        var nested = [];
        while (i < tasks.length && cur.end > tasks[i].start) {
          nested.push(tasks[i++]);
        }
        if (nested.length) {
          cur.nested = _createNestedLoopTree(nested);
        }
      }

      return leveltasks;
    }

    tasks.sort(function order_outer_first(t1, t2) {
      return (t1.start - t2.start) || (t2.end - t1.end);
    });
    return _createNestedLoopTree(tasks);
  };

  Thread.prototype._getBags = function(level) {
    while (this.bagsStack.length <= level) {
      this.bagsStack.push([0]);
    }
    return this.bagsStack[level];
  };

  Thread.prototype.placeTasksNested = function(parent, level) {
    var self = this;
    function _pickbag(bags, taskdispatch) {
      var min = 0;
      for (var i = 0; i < bags.length; i++) {
        if (bags[min] > bags[i]) {
          min = i;
        }
        // Or first bag that could keep the task.
        if (bags[i] > (taskdispatch - 1000)) {
          continue;
        }
        return i;
      }
      return min;
    }

    var thread_first_y = 0;

    var leveltasks = parent.nested;
    var bags = this._getBags(level);
    leveltasks.sort(function(t1, t2) { return t1.dispatch - t2.dispatch; });
    leveltasks.forEach(function(task) {
      var bag_i = _pickbag(bags, task.dispatch);
      if (bags[bag_i] > task.dispatch) {
        bag_i = bags.length;
        bags.push(0);
      }
      task.place_y = bag_i;
      bags[bag_i] = task.end;

      task.level = level;
      if (task.nested) {
        self.placeTasksNested(task, level + 1);
      }
    });
  };

  Thread.prototype.computeLevelStarts = function() {
    var levelStarts = [0];
    this.bagsStack.forEach(function(bags) {
      var start = levelStarts[levelStarts.length - 1] + bags.length + 1;
      levelStarts.push(start);
    });
    levelStarts[levelStarts.length - 1]--;
    this.levelStarts = levelStarts;
  };

  Thread.prototype.adjustTasksByLevelStarts = function() {
    var self = this;
    this.config.tasks.forEach(function(task) {
      task.place_y = task.place_y + self.levelStarts[task.level];
    });
  };

  Thread.prototype.placeTasks = function() {
    var root = new Object();
    root.nested = this.createNestedLoopTree(this.config.tasks);
    this.bagsStack = [];        /* Bag lists for levels, every level
                                 * of nested event loops has a list of
                                 * bags for keep tasks ran on the
                                 * loops of the level. */
    this.placeTasksNested(root, 0);
    this.computeLevelStarts();
    this.adjustTasksByLevelStarts();
    this.config.tasks.sort(function order_dispatch_time(t1, t2) {
      return t1.dispatch - t2.dispatch;
    });
  };

  Thread.prototype.containerElement = $('#canvas');

  Thread.prototype.init = function() {
    if (this._inited) {
      return;
    }
    this._inited = true;
    this.config.translate = 0;
    this.config.scale = 1;

    this.placeTasks();

    this.WIDTH = this.containerElement.children().width();
    console.log(this.WIDTH);
    var num_bags = this.levelStarts[this.levelStarts.length - 1];
    this.MINIMAP_HEIGHT = Math.max(num_bags, 18);
    if (num_bags) {
      this.HEIGHT = (num_bags + 1) * (this._intervalH + this._taskHeight) + (num_bags);
    } else {
      this.HEIGHT = 500;
    }
    this._canvas = this.config.canvas;
    this.render();
    this.register();
    this._registerMouseEvents();
  };

  Thread.prototype.register = function() {
    if (this._registered) {
      return;
    }
    this._registered = true;

    // Reconstruct event handler to bind on this.
    for (var e in this.LISTENERS) {
      this[this.LISTENERS[e]] = this[this.LISTENERS[e]].bind(this);
    }

    for (var e in this.LISTENERS) {
      window.broadcaster.on(e, this[this.LISTENERS[e]]);
    }
  };

  Thread.prototype._timeline_range_changed = function(x, w, start, interval) {
    if (start < this.config.start) {
      this.config.translate = 0;
      this.config.scale = 1;
    } else {
      this.config.translate = start - this.config.start;
      this.config.scale = this.WIDTH / w;
    }
    this.repositionTasks();
  };

  Thread.prototype._thread_manager_zoom_in = function(x, y, w, h) {
    var s = 3;
    this.config.translate = this.config.translate + ((x - x / s) / this.config.scale) * this.config.interval / this.WIDTH;
    this.config.scale = this.config.scale * s;
    this.repositionTasks();
  };

  Thread.prototype._scale_toolbar_reset = function(s) {
    if (this.config.scale !== 1) {
      this.config.scale = 1;
      this.config.translate = 0;
      this.repositionTasks();
    }
  };

  Thread.prototype._scale_toolbar_zoom_in = function(s) {
    this.config.translate = this.config.translate;
    this.config.scale = this.config.scale * s;
    this.repositionTasks();
  };

  Thread.prototype._scale_toolbar_zoom_out = function(s) {
    var scale = this.config.scale / s;
    if (scale <= 1) {
      scale = 1;
    }
    var translate = this.config.translate;
    if (this.config.scale !== scale) {
      this.config.scale = scale;
      this.config.translate = translate;
      this.repositionTasks();
    }
  };

  Thread.prototype._thread_toggler_toggled = function() {
    this.toggle();
  };

  Thread.prototype._thread_manager_move_left = function() {
    var s = 5;
    var translate = this.config.translate - this.config.translate / ( s * this.config.scale );
    if (translate <= 0) {
      translate = 0;
    }
    if (translate !== this.config.translate) {
      this.config.translate = translate;
      this.repositionTasks();
    }
  };

  Thread.prototype._thread_manager_move_right = function() {
    var s = 5;
    var translate = this.config.translate + this.config.translate / ( s * this.config.scale );
        console.log(translate);
    if (translate + this.config.interval / this.config.scale >= this.config.interval) {
      translate = this.config.interval - this.config.interval / this.config.scale;
    }
    if (translate !== this.config.translate) {
      this.config.translate = translate;
      this.repositionTasks();
    }
  };

  Thread.prototype._filter_source_event_ids = function(ids) {
    if (!ids) {
      this.showAllTasks();
      return;
    }
    var found = false;
    this.config.tasks.forEach(function(task) {
      if (ids.indexOf(String(task.sourceEventId)) >= 0) {
        found = true;
        task.view.set.show();
      } else {
        task.view.set.hide();
      }
    }, this);
    if (!found) {
      this.close();
    }
  };

  Thread.prototype._filter_source_event_id = function(id) {
    if (!id) {
      this.showAllTasks();
      return;
    }
    var found = false;
    this.config.tasks.forEach(function(task) {
      if (id === task.sourceEventId) {
        found = true;
        task.view.set.show();
      } else {
        task.view.set.hide();
      }
    }, this);
    if (!found) {
      this.close();
    }
  };

  Thread.prototype._filter_label = function(labels) {
    if (!labels) {
      this.showAllTasks();
      return;
    }
    var found = false;
    this.config.tasks.forEach(function(task) {
      if (task.labels && task.labels.length &&
          task.labels.some(function(label) {
            return (labels.indexOf(label.label || label[1]) >= 0);
          })) {
        found = true;
        task.view.set.show()
      } else {
        task.view.set.hide();
      }
    }, this);
    if (!found) {
      this.close();
    }
  };

  Thread.prototype._filter_label_toggle = function(value) {
    if (value) {
      var found = false;
      this.config.tasks.forEach(function(task) {
        if (task.labels && task.labels.length > 0) {
          found = true;
          task.view.set.show();
        } else {
          task.view.set.hide();
        }
      }, this);
      if (!found) {
        this.close();
      }
    } else {
      this.open();
    }
  };

  Thread.prototype._task_id_toggle = function(value) {
    if (value) {
      this.config.tasks.forEach(function(task) {
        task.view.id.hide();
      }, this);
    } else {
      this.config.tasks.forEach(function(task) {
        task.view.id.show();
      }, this);
    }
  };

  Thread.prototype.showAllTasks = function() {
    this.config.tasks.forEach(function(task) {
      task.view.set.show();
    }, this);
    this.open();
  };

  Thread.prototype.resize = function(w, h) {
    this.WIDTH = w;
  };

  Thread.prototype.toggle = function() {
    if (this.folded) {
      this.open();
    } else {
      this.close();
    }
  };

  Thread.prototype.open = function() {
    if (!this.folded) {
      return;
    }

    this._background.show();
    this.config.tasks.forEach(function(task) {
      task.view.set.show();
    }, this);
    this.folded = false;
    window.broadcaster.emit('-thread-request-open', this);
  };

  Thread.prototype.close = function() {
    if (this.folded) {
      return;
    }
    this._background.hide();
    this.config.tasks.forEach(function(task) {
      task.view.set.hide();
    }, this);
    this.folded = true;
    window.broadcaster.emit('-thread-request-close', this);
  };

  Thread.prototype.update = function() {
  };

  Thread.prototype.destroy = function() {
    this.config = {};
    for (var e in this.LISTENERS) {
      window.broadcaster.off(e, this[this.LISTENERS[e]]);
    }
    window.broadcaster.emit('-thread-destroyed');
  };

  Thread.prototype.render = function() {
    if (this._rendered || !this.config.tasks) {
      return;
    }
    this._rendered = true;

    this._canvas.setStart();

    /* Render semitransparent overlay */
    this._overlay = this._canvas.rect(0, 0, this.WIDTH, this.HEIGHT)
      .toBack()
      .attr('opacity', 0.9)
      .attr('fill', 'white')
      .attr('stroke', 'none')
      .hide();

    this._minimap = this._canvas.rect(0, 0, this.WIDTH, this.MINIMAP_HEIGHT)
      .toBack()
      .attr('stroke', 'none')
      .attr('fill', '#eee');

    var processColor = window.app.colorManager.getColor(this.config.processId);

    this._background = this._canvas.rect(0, this.MINIMAP_HEIGHT, this.WIDTH, this.HEIGHT - this.MINIMAP_HEIGHT)
      .toBack()
      .attr('stroke', 'none')
      .attr('fill', processColor)
      .attr('opacity', 0.1);

    /* Render border */
    this._border = this._canvas.path('M0 ' + this.HEIGHT + 'L' + this.WIDTH + ' ' + this.HEIGHT)
      .toBack()
      .attr('opacity', 0.9)
      .attr('stroke-width', 0.1)
      .attr('stroke', 'silver');

    this._name = this._canvas.text(0, this.MINIMAP_HEIGHT / 2,
      '[' + window.app.processManager.getProcessName(this.config.processId) + ']' +
      (this.config.name || this.config.tasks[0].threadId));
    this._name.attr('font-size', '15')
              .attr('font-weight', 'bold')
              .attr('fill', processColor)
              .attr('x', this._name.getBBox().width / 2)
              .attr('y', this._name.getBBox().height / 2);

    this._set = this._canvas.setFinish();
    this._set.transform('t0,' + this.config.offsetY);

    this.renderTasks();

    /* Render separators of levels of nested event loops */
    if (this.levelStarts.length >= 3) {
      var separators = this.levelStarts.slice(1, -1);
      separators.forEach(function(separator) {
        var y = (separator - 1) * (this._taskHeight + this._intervalH) +
          this._taskHeight / 2;
        var g = this._canvas.path('M 0 ' + y + ' l ' + this.WIDTH + ' 0')
          .attr('fill', 'none')
          .attr('stroke-width', 0.1)
          .attr('stroke', 'green')
          .transform('t0,' + (this.config.offsetY + this.MINIMAP_HEIGHT));
      }, this);
    }
  };
  Thread.prototype.renderTasks = function() {
    /* Render tasks */
    var self = this;
    var tasks = this.config.tasks;
    var ColorManager = window.app.colorManager;
    function create_runner(tasks) {
      function _runner() {
        tasks.forEach(function(task) {
          self.render_task(task, ColorManager.getColor(task.sourceEventId));
        });
      }
      return _runner;
    }

    var run_size = 200;
    for (var i = 0; i < this.config.tasks.length; i += run_size) {
      var render_content = this.config.tasks.slice(i, i + run_size);
      window.broadcaster.emit('-friendly-runner',
                              create_runner(render_content));
    }
  };

  Thread.prototype._registerMouseEvents = function() {
    if (this._mouseEventRegistered) {
      return;
    }
    this._mouseEventRegistered = true;
  };

  Thread.prototype._taskHeight = 10;
  Thread.prototype._intervalH = 5;
  Thread.prototype._taskMinWidth = 1;
  Thread.prototype._minHeight = 25;

  Thread.prototype.render_task = function(task, sourceEventColor) {
    // No dispatch time!
    if (!task.start && task.begin) {
      task.start = task.begin;
    }
    if (task.dispatch === 0 && task.start !== 0) {
      task.dispatch = task.start;
    }
    this._canvas.setStart();
    var lx = this.WIDTH * (task.dispatch - this.config.start) / this.config.interval;
    var ex = this.WIDTH * (task.start - this.config.start) / this.config.interval;
    var y = task.place_y * (this._taskHeight + this._intervalH);
    var lw = (this.WIDTH) * (task.start - task.dispatch) / this.config.interval;
    var ew = (this.WIDTH) * (task.end - task.start) / this.config.interval;
    var h = this._taskHeight;
    var c = sourceEventColor;

    /** Render latency **/
    var width = (lw + ew) > this._taskMinWidth ? (lw + ew) : this._taskMinWidth;
    var latency = this._canvas.rect(lx, y + h / 4, lw, h / 2)
                              .attr('fill', c)
                              .attr('opacity', 0.5)
                              .attr('stroke-width', 0)
                              .data('task', task);

    /** Render execution **/
    var execution = this._canvas.rect(ex, y, ew, h)
                                .attr('fill', c)
                                .attr('stroke-width', 0)
                                .data('task', task);

    var circles = [];

    /** Render labels **/
    if (task.labels) {
      task.labels.forEach(function(label) {
        var x = this.WIDTH * ((label.timestamp || label[0]) - this.config.start) / this.config.interval;
        circles.push(this._canvas.circle(x, y + this._taskHeight / 2, 1)
                    .attr('fill', 'red')
                    .attr('stroke', 'transparent').data('timestamp', label.timestamp || label[0]));
      }, this);
      window.broadcaster.emit('-labels-rendered', task.labels);
    }

    var set = this._canvas.setFinish();
    set.transform('t0,' + (this.config.offsetY + this.MINIMAP_HEIGHT));
    task.y = y;
    task.x = lx;
    task.offsetY = this.config.offsetY + this.MINIMAP_HEIGHT;
    task.view = {
      latency: latency,
      execution: execution,
      circles: circles,
      set: set
    };
    task.rendered = true;

    /* Render MINIMAP */
    var pathString = 'M' + ex + ',' + task.place_y + 'L' + (ex + ew) + ',' + task.place_y;
    var mini_task = this._canvas.path(pathString)
                                .attr('stroke', c);
    mini_task.transform('t0,' + this.config.offsetY);
    this._set.push(mini_task);
    window.broadcaster.emit('-task-rendered', task, ex, ew, task.threadId);
  };

  Thread.prototype.repositionTasks = function() {
    var start = this.config.start + this.config.translate;
    var interval = this.config.interval / this.config.scale;
    this.config.tasks.forEach(function(task) {
      var currentX = task.view.latency.attr('x');
      var lx = this.WIDTH * (task.dispatch - start) / interval;
      var ex = this.WIDTH * (task.start - start) / interval;
      var lw = (this.WIDTH) * (task.start - task.dispatch) / interval;
      var ew = (this.WIDTH) * (task.end - task.start) / interval;
      task.view.latency.attr('x', lx).attr('width', lw);
      task.view.execution.attr('x', ex).attr('width', ew);
      task.view.circles.forEach(function(circle) {
        var x = this.WIDTH * (circle.data('timestamp') - start) / interval;
        circle.attr('cx', x);
      }, this);
      if (task.from) {
        task.from.transform('..t' + (lx - currentX) + ',0');
      }
      if (task.to) {
        task.to.transform('...t' + (lx - currentX) + ',0');
      }
    }, this);
    window.broadcaster.emit('-task-transformed', this.config.translate, this.config.scale);
  };

  Thread.prototype.getHeight = function() {
    if (this.folded) {
      return this.MINIMAP_HEIGHT;
    } else {
      return this.HEIGHT;
    }
  };

  Thread.prototype.updateOffset = function(offset) {
    if (this.config.offsetY === offset) {
      return;
    }
    this.config.offsetY = offset;
    this._set.transform('').transform('t0,' + offset);
    this.config.tasks.forEach(function(task) {
      task.offsetY = offset + this.MINIMAP_HEIGHT;
      task.view.set.transform('').transform('t0,' + task.offsetY);
      if (task.from) {
        // XXX: Reposition connections
      }
      if (task.to) {
        // XXX: Reposition connections
      }
    }, this);
  };

  exports.Thread = Thread;
}(this));
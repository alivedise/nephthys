/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2 -*- */
'use strict';

(function(exports) {
  var _id = 0;
  var Thread = function(config) {
    this.config = config;
    this.init();
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
    '-task-id-toggle': '_task_id_toggle'
  };

  Thread.prototype.containerElement = document.getElementById('timeline');

  Thread.prototype.CLASS_NAME = 'thread-';

  Thread.prototype.template = function() {
    var ColorManager = window.app.colorManager;
    var bgcolor = ColorManager.getColor(this.config.processId);
    this.instanceID = this.CLASS_NAME + _id;
    _id++;
    return '<div class="thread" id="' + this.instanceID + '">' +
            '<div class="name"><button class="btn-sm btn btn-default" style="background-color: ' + bgcolor + '; text-shadow: 0 0 3px #fff;">' + (this.config.tasks ? this.config.tasks[0].threadId : '') + ' <span class="glyphicon glyphicon-chevron-up"></span></button></div>' +
            '<div class="canvas" id="' + this.instanceID + '-canvas"></div>' +
            '</div>';
  };

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

  Thread.prototype.init = function() {
    this.containerElement.insertAdjacentHTML('beforeend', this.template());
    this.element = $('#' + this.instanceID);
    this.elements = {
      'name': this.element.find('.name > .btn'),
      'toggle': this.element.find('.name > .btn > span')
    };

    this.placeTasks();

    this.WIDTH = $('#timeline').width() - this._offsetX;
    var num_bags = this.levelStarts[this.levelStarts.length - 1];
    if (num_bags) {
      this.HEIGHT = (num_bags + 1) * (this._intervalH + this._taskHeight);
    } else {
      this.HEIGHT = 500;
    }
    this._canvas =
      Raphael(document.getElementById(this.instanceID + '-canvas'),
        this.WIDTH, this.HEIGHT);
    this.render();
    this.register();
  };

  Thread.prototype.register = function() {
    if (this._registered) {
      return;
    }
    this._registered = true;

    this.elements.name.click(this.toggle.bind(this));

    // Reconstruct event handler to bind on this.
    for (var e in this.LISTENERS) {
      this[this.LISTENERS[e]] = this[this.LISTENERS[e]].bind(this);
    }

    for (var e in this.LISTENERS) {
      window.broadcaster.on(e, this[this.LISTENERS[e]]);
    }
  };

  Thread.prototype._timeline_range_changed = function(x, w) {
    this._canvas.setViewBox(x, 0, w, this.HEIGHT, true);
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
            return (labels.indexOf(label.label) >= 0);
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
      if (!this._overlay.isVisible) {
        this._overlay.show().toFront();
      }
      var found = false;
      this.config.tasks.forEach(function(task) {
        if (task.labels && task.labels.length > 0) {
          found = true;
          this.highlight(task.view.set);
        } else {
        }
      }, this);
      if (!found) {
        this.close();
      }
    } else {
      this.open();
      this.unhighlight();
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
    this._overlay.hide();
    this.open();
  };

  Thread.prototype.resize = function(w, h) {
    this.WIDTH = w;
    this.HEIGHT = h;

    this._canvas.setSize(this.WIDTH, this.HEIGHT);
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
    this.elements.toggle.toggleClass('glyphicon-chevron-down');
    this.elements.toggle.toggleClass('glyphicon-chevron-up');
    this.config.tasks.forEach(function(task) {
      task.view.set.show();
      task.view.execution.attr('y', task.y);
    }, this);
    this._canvas.setSize(this.WIDTH, this.HEIGHT);
    this.folded = false;
  };

  Thread.prototype.close = function() {
    if (this.folded) {
      return;
    }
    this.elements.toggle.toggleClass('glyphicon-chevron-down');
    this.elements.toggle.toggleClass('glyphicon-chevron-up');
    this.config.tasks.forEach(function(task) {
      task.view.set.hide();
      task.view.execution.show().attr('y', 0);
    }, this);
    this._canvas.setSize(this.WIDTH, this._minHeight);
    this.folded = true;
  };

  Thread.prototype.update = function() {
  };

  Thread.prototype.destroy = function() {
    this.config = {};
    this._canvas.remove();
    this.element.remove();
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

    var self = this;
    var tasks = this.config.tasks;
    var ColorManager = window.app.colorManager;

    this._tooltip = this._canvas.rect(0, 0, 150, 30).attr('stroke', 'transparent').attr('fill', 'yellow').hide();

    /* Render border */
    // this._border = this._canvas.rect(0, 0, this.WIDTH, this.HEIGHT).toBack();

    /* Render semitransparent overlay */
    this._overlay = this._canvas.rect(0, 0, this.WIDTH, this.HEIGHT)
      .toBack()
      .attr('opacity', 0.9)
      .attr('fill', 'white')
      .hide();

    /* Render tasks */
    this.config.tasks.forEach(function(task) {
      (function(t) {
        setTimeout(function() {
          self.render_task(t, ColorManager.getColor(task.sourceEventId));
        }.bind(this));
      }(task));
    }, this);

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

    /** Focus the element to show the connections */
    this.element.click(function(evt) {
      var x = evt.pageX;
      var y = evt.pageY;
      var ele = this._canvas.getElementByPoint(x, y);
      if (ele && ele.data('task')) {
        window.broadcaster.emit('-task-focused', ele.data('task'), x, y);
      } else {
        window.broadcaster.emit('-task-out');
      }
    }.bind(this));

    /* Render separators of levels of nested event loops */
    if (this.levelStarts.length >= 3) {
      var separators = this.levelStarts.splice(1, this.levelStarts.length - 2);
      separators.forEach(function(separator) {
        var y = (separator - 1) * (self._taskHeight + self._intervalH) +
          self._taskHeight / 2;
        var g = self._canvas.path('M 0 ' + y + ' l ' + self.WIDTH + ' 0')
          .attr('fill', 'none')
          .attr('stroke-width', 0.1)
          .attr('stroke', 'green');
      });
    }
  };

  Thread.prototype._offsetX = 150;
  Thread.prototype._offsetY = 0;
  Thread.prototype._taskHeight = 10;
  Thread.prototype._intervalH = 5;
  Thread.prototype._taskMinWidth = 1;
  Thread.prototype._minHeight = 25;

  Thread.prototype.render_task = function(task, sourceEventColor) {
    // No dispatch time!
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
    var latency = this._canvas.rect(lx, y, lw, h)
                              .attr('fill', c)
                              .attr('opacity', 0.5)
                              .attr('stroke-width', 0)
                              .data('task', task);

    /** Render execution **/
    var execution = this._canvas.rect(ex, y, ew, h)
                                .attr('fill', c)
                                .attr('stroke-width', 0)
                                .data('task', task);

    /** Render life span **/
    var life = this._canvas.path("M" + lx + " " + (y + h / 2) + " l" + lw + " 0")
                           .attr('stroke-width', 1)
                           .attr('stroke', c)
                           .data('task', task);

    /** Render label **/
    /**
    var id;

    id = this._canvas.text(lx + 5, y + this._taskHeight / 2, (task.taskId))
                      .attr('text-anchor', 'start')
                      .attr('color', '#ffffff')
                      .attr('font-size', 15).attr('fill', sourceEventColor)
                      .hide(); // hide by default
    id.attr('x', id.getBBox().x - id.getBBox().width - 10);
    **/

    /** Render labels **/
    if (task.labels) {
      task.labels.forEach(function(label) {
        var x = this.WIDTH * (label.timestamp - this.config.start) / this.config.interval;
        this._canvas.circle(x, y + this._taskHeight / 2, 1)
                    .attr('fill', 'red')
                    .attr('stroke', 'transparent');
        window.broadcaster.emit('-label-rendered', label.label);
      }, this);
    }

    var set = this._canvas.setFinish();
    task.y = y;
    task.x = lx;
    task.view = {
      latency: latency,
      execution: execution,
      life: life,
      set: set
    };
    task.rendered = true;

    window.broadcaster.emit('-task-rendered', task, ex, ew, task.threadId);
  };

  Thread.prototype.highlight = function(element) {
    element.toFront();
  };

  Thread.prototype.unhighlight = function() {
    this._overlay.hide();
  };

  exports.Thread = Thread;
}(this));
'use strict';

(function(exports) {
  var _id = 0;
  var Thread = function(config) {
    this.config = config;
    this.init();
  };

  Thread.prototype = new EventEmitter();

  Thread.prototype.containerElement = document.getElementById('timeline');

  Thread.prototype.CLASS_NAME = 'thread-';

  Thread.prototype.template = function() {
    this.instanceID = this.CLASS_NAME + _id;
    _id++;
    return '<div class="thread" id="' + this.instanceID + '"></div>';
  };

  Thread.prototype.init = function() {
    this.element =
      this.containerElement.insertAdjacentHTML('beforeend', this.template());
    this.WIDTH = $('#timeline').width();
    this.HEIGHT = 100;
    this._canvas =
      Raphael(document.getElementById(this.instanceID),
        this.WIDTH, this.HEIGHT);


    this.render();
  };

  Thread.prototype.resize = function(w, h) {
    this.WIDTH = w;
    this.HEIGHT = h;

    this._canvas.setSize(this.WIDTH, this.HEIGHT);
  };

  Thread.prototype.open = function() {
    this.animationState = 'opening';
    // ...
    this.animationState = 'opened';
  };

  Thread.prototype.close = function() {
    this.animationState = 'closing';
    // ...
    this.animationState = 'closed';
  };

  Thread.prototype.update = function() {
  };

  Thread.prototype.render = function(task) {
    if (this._rendered || !this.config.tasks) {
      return;
    }

    this._rendered = true;

    var self = this;
    this.render_thread();
    console.log(this.config);
    var tasks = this.config.tasks;
    var ColorManager = window.app.colorManager;
    this.config.tasks.forEach(function(task) {
      (function(t) {
        setTimeout(function() {
          self.render_task(t, ColorManager.getColor(task.sourceEventId));
        });
      }(task));
    }, this);
  };

  Thread.prototype._offsetX = 0;
  Thread.prototype._offsetY = 20;
  Thread.prototype._taskHeight = 10;
  Thread.prototype._intervalH = 15;
  Thread.prototype._taskMinWidth = 1;

  Thread.prototype.render_thread = function() {
    var threadRect = this._canvas.rect(3, 5, 120, 20).attr('fill', 'white');
    //var thread = this._canvas.text(5, 5, 'Thread: ' + this.config.tasks[0].threadId).attr('text-anchor', 'start').attr('color', '#ffffff').attr('font-size', 15);
  };

  Thread.prototype.render_task = function(task, sourceEventColor) {
    // No dispatch time!
    if (task.dispatch === 0 && task.start !== 0) {
      task.dispatch = task.start;
    }
    console.log(task);
    var lx = this.WIDTH * (task.dispatch - this.config.start) / this.config.interval + this._offsetX;
    var ex = this.WIDTH * (task.start - this.config.start) / this.config.interval + this._offsetX;
    var y = task.place_y * (this._taskHeight + this._intervalH) + this._offsetY;
    var lw = this.WIDTH * (task.start - task.dispatch) / this.config.interval;
    var ew = this.WIDTH * (task.end - task.start) / this.config.interval;
    var h = this._taskHeight;
    var c = sourceEventColor;

    /** Render latency **/
    var width = (lw + ew) > this._taskMinWidth ? (lw + ew) : this._taskMinWidth;
    var latency = this._canvas.rect(lx, y, width, h);
    latency.attr('fill', c);
    latency.attr('opacity', 0.5);
    latency.attr('stroke', 'black');

    /** Render execution **/
    var execution = this._canvas.rect(ex, y, ew, h);
    execution.attr('fill', c);
    execution.attr('stroke', 'black');

    /** Render label **/
    var label;

    if (task.parentTaskId === task.sourceEventId) {
      label = this._canvas.text(lx + 5, y + this._taskHeight / 2, (task.sourceEventId)).attr('text-anchor', 'start').attr('color', '#ffffff').attr('font-size', 15).attr(
        'fill', sourceEventColor);
      label.attr('x', label.getBBox().x - label.getBBox().width - 10);
    }

    //var set = this._canvas.set();
    var show = function(){
      if (this.tooltipText) {
        this.tooltipText.remove();
      }
      this.tooltipText = this._canvas.text(this.WIDTH - 190, 40,
        'Dispatch: ' + task.dispatch + ' ' + 'Latency: ' + (task.start - task.dispatch) + '\n' +
        'Start: ' + task.start + ' ' + 'Execution: ' + (task.end - task.start) + '\n' +
        'End: ' + task.end).attr('text-anchor', 'start');
    }
    //latency.hover(show, function() { this.tooltipText.remove(); }, this, this);
    //execution.hover(show, function() { this.tooltipText.remove(); }, this, this);
  };

  exports.Thread = Thread;
}(this));
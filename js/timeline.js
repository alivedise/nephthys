(function(exports) {
  var Timeline = function(app) {
    this.app = app;
    this.init();
  };

  Timeline.prototype = new EventEmitter();
  Timeline.prototype.constructor = Timeline;
  Timeline.prototype.SELECTOR = 'timeContainer';
  Timeline.prototype.init = function() {
    this.element = $('#' + this.SELECTOR);
    this._canvas = Raphael(document.getElementById(this.SELECTOR), this.WIDTH, this.HEIGHT);
    this.register();
  };
  Timeline.prototype.ENABLED = false;
  Timeline.prototype.HEIGHT = 20;

  Timeline.prototype.render_range = function() {
    if (this._rendered) {
      return;
    }
    this._rendered = true;

    this.WIDTH = $('#canvas').width();
    this.range = this._canvas.rect(0, 0, this.WIDTH, this.HEIGHT)
                      .attr('stroke', 'transparent')
                      .attr('opacity', 0.33)
                      .attr('fill', '#0186d1').hide().toFront();
  };
  Timeline.prototype.register = function() {
    this.element.mousedown(this._on_mousedown.bind(this));
    this.element.mousemove(this._on_mousemove.bind(this));
    this.element.mouseup(this._on_mouseup.bind(this));

    window.broadcaster.on('profile-imported-stage-0', function() {
      this.ENABLED = true;
      this._canvas.clear();
      this.render_range();
    }.bind(this));

    window.broadcaster.on('range-created', function(start, interval) {
      this.start = start;
      this.interval = interval;
    }.bind(this));

    window.broadcaster.on('-task-transformed', function(translate, scale) {
      if (scale === 1) {
        this.range.hide();
      } else {
        this.range.show()
                .attr('x', this.WIDTH * (translate) / this.interval)
                .attr('width', this.WIDTH / scale);
      }
    }.bind(this));

    this._miniThreads = {};
    this._miniThreadsCount = 1;
    window.broadcaster.on('-task-rendered', function(task, x, w, tid) {
      if (!this._miniThreads[tid]) {
        this._miniThreads[tid] = this._miniThreadsCount++;
      }
      this._canvas.path('M' + x + ',' +
        (this._miniThreads[tid]) + 'L' +
        (x + w) + ',' +
        (this._miniThreads[tid]));
    }.bind(this));
  };
  Timeline.prototype._on_mousedown = function(evt) {
    if (typeof(evt.offsetX) == "undefined")
      evt.offsetX = evt.originalEvent.layerX;
    if (!this.ENABLED) {
      return;
    }
    var x = evt.offsetX;
    this._start = x;
  };
  Timeline.prototype._on_mousemove = function(evt) {
    if (typeof(evt.offsetX) == "undefined")
      evt.offsetX = evt.originalEvent.layerX;
    if (!this.ENABLED || !this._start) {
      return;
    }
    var x = evt.offsetX;
    this.range.attr('x', this._start).attr('width', x - this._start).show();
  };
  Timeline.prototype._on_mouseup = function(evt) {
    if (typeof(evt.offsetX) == "undefined")
      evt.offsetX = evt.originalEvent.layerX;
    if (!this.ENABLED) {
      return;
    }
    this._start = 0;
    var x = this.range.attr('x');
    var w = this.range.attr('width');
    self.window.broadcaster.emit('timeline-range-changed',
      x,
      w,
      this.start + this.interval * x / this.WIDTH,
      this.interval * w / this.WIDTH
      );
  };
  exports.Timeline = Timeline;
}(this));
(function(exports) {
  var Timeline = function() {
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

    this.WIDTH = $('#timeline').width() - 75;
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
      console.log('imported');
      this.ENABLED = true;
      this._canvas.clear();
      this.render_range();
    }.bind(this));

    this._miniThreads = {};
    this._miniThreadsCount = 1;
    window.broadcaster.on('-task-rendered', function(x, w, tid) {
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
    if (!this.ENABLED) {
      return;
    }
    var x = evt.offsetX;
    this._start = x;
  };
  Timeline.prototype._on_mousemove = function(evt) {
    if (!this.ENABLED || !this._start) {
      return;
    }
    var x = evt.offsetX;
    this.range.attr('x', this._start).attr('width', x - this._start).show();
  };
  Timeline.prototype._on_mouseup = function(evt) {
    if (!this.ENABLED) {
      return;
    }
    this._start = 0;
    self.window.broadcaster.emit('timeline-range-changed',
      this.range.attr('x'),
      this.range.attr('width'));
  };
  exports.Timeline = Timeline;
}(this));
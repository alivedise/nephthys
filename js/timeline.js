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
                      .attr('fill', 'black').hide().toFront();
    this._background = this._canvas.rect(0, 0, this.WIDTH, this.HEIGHT)
                      .attr('fill', 'silver')
                      .attr('opacity', 0.5);

  };
  Timeline.prototype.register = function() {
    this.element.mousedown(this._on_mousedown.bind(this));
    this.element.mousemove(this._on_mousemove.bind(this));
    this.element.mouseup(this._on_mouseup.bind(this));
    this.element.dblclick(function(evt) {
      if (!this.range.is_visible || this._start !== 0) {
        return;
      }
      var x = evt.pageX;
      this.range.attr('x', x - this.range.attr('width') / 2);
      if (this.range.attr('x') < 0) {
        this.range.attr('x', 0);
      }
      if (this.range.attr('x') + this.range.attr('width') > this.WIDTH) {
        this.range.attr('x', this.WIDTH - this.range.attr('width'));
      }
      this.publishRangeChange();
    }.bind(this));

    window.broadcaster.on('profile-imported-stage-0', function() {
      this.ENABLED = true;
      this._canvas.clear();
      this.render_range();
    }.bind(this));

    window.broadcaster.on('range-created', function(start, interval) {
      this.start = start;
      this.interval = interval;
      for (var i = 0; i < 10; i++) {
        var x = i * this.WIDTH / 10;
        this._canvas.text(x, 10, this.interval * i / 10);
        this._canvas.rect(x, 0, x + 100, this.HEIGHT)
                    .attr('fill', 'transparent')
                    .attr('stroke', 'none');
        this._canvas.path('M' + x + ',0L' + x + ',' + this.HEIGHT)
                    .attr('stroke', 'silver');
      }
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
    this.range.attr('x', this._start).attr('width', x - this._start).show().toFront();
  };
  Timeline.prototype._on_mouseup = function(evt) {
    if (typeof(evt.offsetX) == "undefined")
      evt.offsetX = evt.originalEvent.layerX;
    if (!this.ENABLED) {
      return;
    }
    this._start = 0;
    this.publishRangeChange();
  };
  Timeline.prototype.publishRangeChange = function(first_argument) {
    var x = this.range.attr('x');
    var w = this.range.attr('width');
    window.broadcaster.emit('timeline-range-changed',
      x,
      w,
      this.start + this.interval * x / this.WIDTH,
      this.interval * w / this.WIDTH
      );
  };
  exports.Timeline = Timeline;
}(this));
(function(exports) {
  var SourceEventID = function(config) {
    this.config = config;
    this.id = config.id;
    this.config.scale = 1;
    this.config.translate = 0;
    this.init();
    SourceEventID[this.id] = this;
    this.buildConnections = this.buildConnections.bind(this);

    var self = this;
    window.broadcaster.on('-source-event-id-filtered', function(sourceEventId) {
      window.broadcaster.on('-thread-manager-ui-updated', function on() {
        self.buildConnections(sourceEventId);
      });
    });
    window.broadcaster.emit('-source-event-id-created');
  };
  SourceEventID.prototype = new EventEmitter();
  SourceEventID.prototype.constructor = SourceEventID;
  SourceEventID.prototype.init = function() {
  };


  SourceEventID.prototype.buildConnections = function(sourceEventId) {
    if (!sourceEventId || String(sourceEventId) !== String(this.id)) {
      if (this._set) {
        this.destroyConnections();
      }
      return;
    }
    if (!this._canvas) {
      this._canvas = window.app.threadManager.getCanvas();
    }
    if (this._set) {
      this.destroyConnections();
    }
    var set = this._canvas.set();
    var tasks = window.app.taskManager.getTasks();
    this.config.tasks.forEach(function(t) {
      var task = tasks[t.taskId];
      var parent = tasks[t.parentTaskId];
      if (!task || !parent || String(parent.sourceEventId) !== String(this.id)) {
        return;
      }
      var source = task.view.latency;
      var target = tasks[t.parentTaskId].view.latency;
      var x1 = source.attrs['x'];
      var y1 = source.attrs['y'] + task.offsetY;
      var x2 = source.attrs['x'];
      var y2 = target.attrs['y'] + parent.offsetY;
      if (y1 < y2) {
        y1 = y1 + source.attr('height') / 2;
        y2 = y2 + target.attr('height') / 2;
      } else {
        y1 = y1 + source.attr('height') / 2;
        y2 = y2 - target.attr('height') / 2;
      }
      var arrow = this._canvas.arrow(x1, y1, x2, y2, 1,
                                     window.app.colorManager.getColor(this.id));
      set.push(arrow[0], arrow[1]);
      arrow[0].data('source', task);
      arrow[1].data('target', parent);
      task.to = arrow[0];
      parent.from = arrow[1];
    }, this);
    this._set = set;
  };

  SourceEventID.prototype.destroyConnections = function(first_argument) {
    if (this._set) {
      this._set.forEach(function(element) {
        if (element.data('source')) {
          element.data('source')['to'] = null;
          element.data('source', '');
        }
        if (element.data('target')) {
          element.data('target')['from'] = null;
          element.data('target', '');
        }
        element.remove();
      });
      this._set.clear();
      this._set = null;
    }
  };

  SourceEventID.prototype.destroy = function() {
    delete SourceEventID[this.id];
    window.broadcaster.off('-source-event-id-filtered', this.buildConnections);
    window.broadcaster.emit('-source-event-id-destoryed', this);
  };

  exports.SourceEventID = SourceEventID;
}(this));
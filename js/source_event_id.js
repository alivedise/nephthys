(function(exports) {
  var SourceEventId = function(config) {
    this.config = config;
    this.id = config.id;
    this._canvas = this.config.canvas;
    this.init();
    SourceEventId[this.id] = this;
    this.handleIdToggled = this.handleIdToggled.bind(this);
    window.broadcaster.on('-source-event-id-filtered', this.handleIdToggled);
    window.broadcaster.emit('-source-event-id-created');
  };
  SourceEventId.prototype = new EventEmitter();
  SourceEventId.prototype.constructor = SourceEventId;
  SourceEventId.prototype.init = function() {
  };

  SourceEventId.prototype.buildConnections = function() {
    this.config.tasks.forEach(function(task) {
      if (task.parentTask) {
      }
    }, this);
  };

  SourceEventId.prototype.handleIdToggled = function(id) {
    if (String(id) !== String(this.id)) {
      return;
    }
    this.config.tasks.forEach(function(task) {
      if (task.parentTask) {
        var parent = task.parentTask;
        var upper = true;
        if (task.y > parent.y) {
          upper = false;
        }
        this._canvas.arrow(task.x,
                            upper ? task.y : task.y + task.h,
                            task.x,
                            upper ? parent.y - task.h : parent.y,
                            1, 'black');
      }
    }, this);
  };

  SourceEventId.prototype.show = function() {
  };

  SourceEventId.prototype.hide = function() {
  };

  SourceEventId.prototype.destroy = function() {
    delete SourceEventId[this.id];
    window.broadcaster.off('-source-event-id-*-toggled', this.handleIdToggled)
    window.broadcaster.emit('-source-event-id-destoryed', this);
  };

  exports.SourceEventId = SourceEventId;
}(this));
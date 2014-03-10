(function(exports) {
  var SourceEventID = function(config) {
    this.config = config;
    this.id = config.id;
    this.init();
    SourceEventID[this.id] = this;
    this.buildConnections = this.buildConnections.bind(this);
    
    window.broadcaster.on('-source-event-id-filtered', this.buildConnections);
    window.broadcaster.emit('-source-event-id-created');
  };
  SourceEventID.prototype = new EventEmitter();
  SourceEventID.prototype.constructor = SourceEventID;
  SourceEventID.prototype.init = function() {
  };


  SourceEventID.prototype.buildConnections = function(sourceEventId) {
    if (!sourceEventId || String(sourceEventId) !== String(this.id)) {
      if (this._set) {
        this._set.remove();
        this._set = null;
      }
      return;
    }
    if (!this._canvas) {
      this._canvas = window.app.threadManager.getCanvas();
    }
    console.log(sourceEventId, this.id);
    var set = this._canvas.set();
    var tasks = window.app.taskManager.getTasks();
    this.config.tasks.forEach(function(t) {
      var task = tasks[t.taskId];
      if (!task || !tasks[t.parentTaskId]) {
        return;
      }
      var arrow = this._canvas.arrow(task.view.latency.attr('x'),
                                     tasks[t.parentTaskId].view.latency.attr('y') + task.offsetY,
                                     task.view.latency.attr('x'),
                                     task.view.latency.attr('y') + task.offsetY,
                                     1,
                                     'black');
      set.push(arrow);
    }, this);
    this._set = set;
  };

  SourceEventID.prototype.destroy = function() {
    delete SourceEventID[this.id];
    window.broadcaster.off('-source-event-id-*-toggled', this.buildConnections)
    window.broadcaster.emit('-source-event-id-destoryed', this);
  };

  exports.SourceEventID = SourceEventID;
}(this));
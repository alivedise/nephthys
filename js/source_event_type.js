(function(exports) {
  var SourceEventType = function(config) {
    this.config = config;
    this.type = config.type;
    this.init();
    window.broadcaster.emit('-source-event-type-created', this);
  };
  SourceEventType.prototype = new EventEmitter();
  SourceEventType.prototype.constructor = SourceEventType;
  SourceEventType.prototype.init = function() {
    this.sources = [];
    this.config.tasks.forEach(function(task) {
      if (task.parentTaskId === task.sourceEventId &&
          this.sources.indexOf(task.sourceEventId) < 0) {
        this.sources.push(task.sourceEventId);
      }
    }, this);
  };

  exports.SourceEventType = SourceEventType;
}(this));
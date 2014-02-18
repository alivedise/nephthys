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
  };

  exports.SourceEventType = SourceEventType;
}(this));
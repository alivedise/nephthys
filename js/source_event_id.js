(function(exports) {
  var SourceEventID = function(config) {
    this.config = config;
    this.type = config.type;
    this.id = config.id;
    this.init();
    SourceEventID[this.id] = this;
    this.handleIdToggled = this.handleIdToggled.bind(this);
    window.broadcaster.on('-source-event-id-*-toggled', this.handleIdToggled)
    window.broadcaster.emit('-source-event-id-created');
  };
  SourceEventID.prototype = new EventEmitter();
  SourceEventID.prototype.constructor = SourceEventID;
  SourceEventID.prototype.init = function() {
  };


  SourceEventID.prototype.buildConnections = function() {
    this.config.tasks.forEach(function(task) {
      if (task.parentTask) {
      }
    }, this);
  };

  SourceEventID.prototype.handleIdToggled = function() {
    console.log(arguments);
  };

  SourceEventID.prototype.show = function() {
  };

  SourceEventID.prototype.hide = function() {
  };

  SourceEventID.prototype.destroy = function() {
    delete SourceEventID[this.id];
    window.broadcaster.off('-source-event-id-*-toggled', this.handleIdToggled)
    window.broadcaster.emit('-source-event-id-destoryed', this);
  };

  exports.SourceEventType = SourceEventID;
}(this));
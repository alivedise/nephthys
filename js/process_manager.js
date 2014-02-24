'use strict';

(function(exports) {
  var ProcessManager = function(app) {
    this.app = app;
  };
  ProcessManager.prototype = new EventEmitter();
  ProcessManager.prototype.constructor = ThreadManager;
  ProcessManager.prototype.update = function(data) {
    this._processes = data.processes;
    this.containerElement.innerHTML = '';
    if (!this._processes) {
      return;
    }
    this._processes.forEach(function(process) {
      $(this.containerElement).append('<span><span style="color: ' +
        this.app.colorManager.getColor(process.processId) + '">█ </span><span>' +
        process.processName + '</span></span>');
    }, this);
  };
  ProcessManager.prototype._handle_process_created = function(process) {
  };
  ProcessManager.prototype.containerElement = document.getElementById('process-mapping');

  exports.ProcessManager = ProcessManager;
}(this));
'use strict';

(function(exports) {
  var ProcessManager = function(app) {
    this.app = app;
    $(this.containerElement).on('click', '.process', function(evt) {
      if ($(evt.currentTarget)[0].dataset.id) {
        window.broadcaster.emit('process-focused', $(evt.currentTarget)[0].dataset.id);
      }
    }.bind(this));
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
      var processElement = $('<div class="process" data-id="' + process.processId + '"><span style="color: ' +
        this.app.colorManager.getColor(process.processId) + '">█ </span><span>' +
        process.processName + '</span></div>');
      $(this.containerElement).append(processElement);
    }, this);
  };
  ProcessManager.prototype.getProcessName = function(id) {
    if (!this._processes) {
      return;
    }
    var name = '';
    this._processes.some(function(process) {
      if (Number(process.processId) === Number(id)) {
        name = process.processName || process.processId;
        return true;
      }
    }, this);
    return name;
  };
  ProcessManager.prototype._handle_process_created = function(process) {
  };
  ProcessManager.prototype.containerElement = document.getElementById('process-mapping');

  exports.ProcessManager = ProcessManager;
}(this));
'use strict';

(function(exports) {
  var TaskManager = function(app) {
    this.app = app;
    window.broadcaster.on('-task-rendered', this.addTask.bind(this));
    window.broadcaster.on('-source-event-id-filtered', this.buildConnections.bind(this));
    window.broadcaster.on('profile-imported-stage-0', this.init.bind(this));
  };
  TaskManager.prototype = new EventEmitter();
  TaskManager.prototype.constructor = TaskManager;
  TaskManager.prototype.init = function() {
    this._tasks = {};
  };

  TaskManager.prototype.addTask = function(task) {
    this._tasks[task.taskId] = task;
    if (task.parentTaskId && this._tasks[task.parentTaskId]) {
      task.parentTask = this._tasks[task.parentTaskId];
      this._tasks[task.parentTaskId].childTask = task;
    }
    for (var id in this._tasks) {
      var currentTask = this._tasks[id];
      if (currentTask.parentTaskId === task.taskId) {
        currentTask.parentTask = task;
        task.childTask = currentTask;
        break;
      }
    };
  };

  TaskManager.prototype.buildConnections = function(id) {
    if (!id in this._tasks) {
      return;
    }
  };

  exports.TaskManager = TaskManager;
}(this));
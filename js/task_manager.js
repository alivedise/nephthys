'use strict';

(function(exports) {
  var TaskManager = function(config) {
    window.broadcaster.on('-task-rendered', this.addTask.bind(this));
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

  exports.TaskManager = TaskManager;
}(this));
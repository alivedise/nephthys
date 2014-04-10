'use strict';

(function(exports) {
  var TaskManager = function(app) {
    this.app = app;
    window.broadcaster.on('-task-rendered', this.addTask.bind(this));
    window.broadcaster.on('profile-imported-stage-0', this.init.bind(this));
  };
  TaskManager.prototype = new EventEmitter();
  TaskManager.prototype.constructor = TaskManager;
  TaskManager.prototype.init = function() {
    this._tasks = {};
  };

  TaskManager.prototype.addTask = function(task) {
    this._tasks[task.taskId || task.id] = task;
  };

  TaskManager.prototype.getTasks = function() {
    return this._tasks;
  };

  TaskManager.prototype.getTask = function(id) {
    return this._tasks[id];
  };

  exports.TaskManager = TaskManager;
}(this));
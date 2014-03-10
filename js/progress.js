(function(exports) {
  var Progress = function(app) {
    this.app = app;
    $('#progress').hide();
    window.broadcaster.on('tasks-initing', this.init.bind(this));
    window.broadcaster.on('-task-rendered', this.update.bind(this));
  };
  Progress.prototype.init = function(tasks) {
    this.currentTasks = tasks;
    this.completed = 0;
    $('#progress').hide();
  };
  Progress.prototype.update = function() {
    $('#progress').show();
    this.completed++;
    $('#progress-bar').css({ width: 100 * this.completed / this.currentTasks.length + '%' });
  };
  exports.Progress = Progress;
}(window))
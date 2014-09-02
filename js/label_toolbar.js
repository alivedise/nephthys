'use strict';

(function(exports) {
  exports.LabelToolBar = function(app) {
    this.app = app;
    this.render();
    this.element.hide();
    window.broadcaster.on('profile-imported', this.init.bind(this));
    window.broadcaster.on('-labels-rendered', this.addLabels.bind(this));
    window.broadcaster.on('-task-rendered', this.addTask.bind(this));
    window.broadcaster.on('-task-render-complete', this.dumpLabels.bind(this));
  };
  LabelToolBar.prototype = new EventEmitter();
  LabelToolBar.prototype.containerElement = $('body');
  LabelToolBar.prototype.init = function() {
    this._labels = [];
    this._tasks = [];
    this.taskCountSelector.text(this._tasks.length);
    this.labelCountSelector.text(this._labels.length);
    this.element.show();
  };
  LabelToolBar.prototype.addLabels = function(labels) {
    labels.forEach(function(label) {
      label = label.label || label[1];
      if (this._labels.indexOf(label) < 0) {
        this._labels.push(label);
      }
    }, this);
  };
  LabelToolBar.prototype.dumpLabels = function() {
    this.labelCountSelector.text(this._labels.length);
  };
  LabelToolBar.prototype.addTask = function(task) {
    this._tasks.push(task);
    this.taskCountSelector.text(this._tasks.length);
  };
  LabelToolBar.prototype.render = function() {
    this.containerElement.append(this.template);
    this.element = $('#label-toolbar');
    this.labelCountSelector = $('#labelCount');
    this.taskCountSelector = $('#taskCount');
    var self = this;
    $('#not-label-only').click(function() {
      $('#not-label-only').addClass('active');
      $('#label-only').removeClass('active');
      window.broadcaster.emit('-filter-label-toggle', (this.id === 'label-only'));
    });
    $('#label-only').click(function() {
      $('#label-only').addClass('active');
      $('#not-label-only').removeClass('active');
      window.broadcaster.emit('-filter-label-toggle', (this.id === 'label-only'));
    });
    $('#clear-filter').click(function() {
      window.broadcaster.emit('-filter-cleared');
    });
    this.element.hover(function() {
      this.element.css({ opacity: 1.0 })
    }.bind(this), function() {
      this.element.css({ opacity: 0.5 })
    }.bind(this));
  };
  LabelToolBar.prototype.template = function() {
    return '<div class="btn-group" id="label-toolbar">' +
              '<button type="button" class="btn btn-info active btn-xs" id="not-label-only">All <span class="badge" id="taskCount"></span></button>' +
              '<button type="button" class="btn btn-info btn-xs" id="label-only">Labels only <span class="badge" id="labelCount"></span></button>' +
              '<button type="button" class="btn btn-warning btn-xs" id="clear-filter">Clear all filter</button>' +
            '</div>';
  };
  exports.LabelToolBar = LabelToolBar;
}(this));
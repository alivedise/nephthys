/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2 -*- */
(function(exports) {
  /**
   * Tooltip for task.
   * @requires Filter
   */
  var Tooltip = function(app) {
    this.app = app;
    this.init();
  };
  Tooltip.prototype = new EventEmitter();
  Tooltip.prototype.constructor = Tooltip;
  Tooltip.prototype.containerElement = $('body');
  Tooltip.prototype.template = function() {
    return '<div class="alert alert-info isis-tooltip" id="isis-tooltip">' +
              '<div><input type="checkbox" name="tooltip-source-event-id" value="" /></button><label>Show relavant tasks only.</label></div>' +
              '<div><span>Name</span><span class="name label label-default pull-right"></span></div>' +
              '<div><span>TaskID</span><span class="taskId label label-default pull-right"></span></div>' +
              '<div><span>SourceEventType</span><span class="sourceEventType label label-default pull-right"></span></div>' +
              '<div><span>SourceEventID</span><span class="label label-default pull-right"><span class="colorSample">█ </span><span class="sourceEventId"></span></span></div>' +
              '<div><span>Latency</span><span class="latency label label-info pull-right"></span></div>' +
              '<div><span>Execution</span><span class="execution label label-info pull-right"></span></div>' +
              '<div><span>Thread ID of parent task</span><span class="parent-task-thread-id label label-info pull-right"></span></div>' +
            '</div>';
  };

  Tooltip.prototype.init = function() {
    this.render();
    this.register();
  };

  Tooltip.prototype.render = function() {
    if (this._rendered) {
      return;
    }
    this._rendered = true;
    this.containerElement.append(this.template());
    this.element = $('#isis-tooltip');
    var element = this.element
    this.element.find('[name="tooltip-source-event-id"]').change(function(){
      if ($(this).is(':checked')) {
        window.broadcaster.emit('-source-event-id-filtered',
          element.data('task').sourceEventId);
      } else {
        window.broadcaster.emit('-source-event-id-filtered');
      }
    });
    this.element.hide();
  };

  Tooltip.prototype.register = function() {
    if (this._registered) {
      return;
    }
    this._registered = true;

    window.broadcaster.on('-task-hovered', function(task, x, y) {
      this.element.data('task', task);
      if (this.element.find('.taskId').text() === String(task.taskId)) {
        return;
      }
      if (window.app.filter && window.app.filter.activeSourceEventId == task.sourceEventId) {
        this.element.find('[name="tooltip-source-event-id"]').prop('checked', true);
      } else {
        this.element.find('[name="tooltip-source-event-id"]').prop('checked', false);
      }
      this.element.find('.labels').remove();
      this.element.find('.taskId').text(task.taskId);
      this.element.find('.name').text(task.name);
      this.element.find('.sourceEventId').text(task.sourceEventId);
      this.element.find('.sourceEventType').text(task.sourceEventType);
      this.element.find('.execution').text(task.end - task.start);
      this.element.find('.latency').text(task.start - task.dispatch);
      this.element.find('.colorSample').css({ color: window.app.colorManager.getColor(task.sourceEventId)});
      if (task.parentTask) {
        this.element.find('.parent-task-thread-id').text(task.parentTask.threadId).css({ backgroundColor: window.app.colorManager.getColor(task.parentTask.threadId)});
      } else {
        this.element.find('.parent-task-thread-id').text('');
      }
      if (task.labels && task.labels.length) {
        this.element.append('<div class="labels"><hr/></div>');
        task.labels.forEach(function(label) {
          this.element.find('.labels').append('<div><span class="label label-info">'+label.timestamp+'</span><span>'+label.label+'</span></div>')
        }, this);
      }
      this.element.width('auto').height('auto').show();
      var position = this.getProperLayout(x, y, this.element[0].clientWidth, this.element[0].clientHeight);
      this.element.show().css(position);
    }.bind(this));
    window.broadcaster.on('-task-out', function(task, x, y) {
      this.element.find('.taskId').text("");
      this.element.hide();
    }.bind(this));
  };

  Tooltip.prototype.MAX_WIDTH = 350;
  Tooltip.prototype.MAX_HEIGHT = 400;

  Tooltip.prototype.getProperLayout = function(x, y, w, h) {
    var MAX_W = Math.abs(window.innerWidth - x);
    var MAX_H = Math.abs(window.innerHeight - y);
    var W = Math.max(this.MAX_WIDTH, w);
    W = Math.min(MAX_W, W);
    var H = Math.max(this.MAX_HEIGHT, h);
    H = Math.min(MAX_H, H);
    if (window.innerWidth > x * 2 && window.innerHeight > y * 2) {
      return {
        left: x,
        top: y,
        width: W,
        height: H
      };
    } else if (window.innerWidth > x * 2 && window.innerHeight < y * 2) {
      return {
        left: x,
        top: y - H,
        width: W,
        height: H
      };
    } else if (window.innerWidth < x * 2 && window.innerHeight < y * 2) {
      return {
        left: x - W,
        top: y - H,
        width: W,
        height: H
      };
    } else {
      return {
        left: x - W,
        top: y,
        width: W,
        height: H
      };
    }
  };

  exports.Tooltip = Tooltip;
}(this));
/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2; -*- */
(function(window) {
  var _start = Date.now();

  function random(start, end) {
    return Math.round(((start) + Math.random() * (end - start)));
  }

  /**
   * Enhance Raphael to have arrow render
   * @param  {Number} x1   Start point of x
   * @param  {Number} y1   Start point of y
   * @param  {Number} x2   End point of x
   * @param  {Number} y2   End point of y
   * @param  {Number} size Size of arrow
   * @return {Array}      Array containing line and arrow
   */
  Raphael.fn.arrow = function (x1, y1, x2, y2, size, color) {
    var angle = Math.atan2(x1-x2,y2-y1);
    angle = (angle / (2 * Math.PI)) * 360;
    var arrowPath = this.path('M' + x2 + ' ' + y2 + ' L' + (x2 - size) + ' ' + (y2 - size) + ' L' + (x2 - size) + ' ' + (y2 + size) + ' L' + x2 + ' ' + y2 ).attr('stroke', color).attr('opacity', 0.5).rotate((90+angle),x2,y2);
    var linePath = this.path('M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2).attr('stroke', color).attr('opacity', 0.5);
    return [linePath, arrowPath];
  }

  var Isis = {
    random: document.getElementById('random'),
    TIME_FACTOR: 0.5,
    WIDTH: 700,
    HEIGHT: 800,
    LEFT: 150,
    TOP: 40,
    start: 0,
    end: 0,
    interval: 0,
    count: 0,
    parseButton: document.getElementById('parse'),
    chooseButton: document.getElementById('choose'),
    source: document.getElementById('source'),
    tooltip: null,
    mapContainer: document.getElementById('mapContainer'),
    slideContainer: $('#slideContainer'),
    init: function Isis_init() {
      source.addEventListener('change', this);
      this.random.addEventListener('click', this);
      var self = this;
      $(function() {
        $('input[type=file]').bootstrapFileInput();
        $('#choose').change(function(evt) {
          self.read(evt);
        });
      });
      window.addEventListener('ui-resize', this.resize.bind(this));
    },

    publish: function(event, detail) {
      window.dispatchEvent(new CustomEvent(event, { detail: detail }));
    },

    read: function(evt) {
      var files = evt.target.files;
      var self = this;
      for (var i = 0, f; f = files[i]; i++) {
        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function(theFile) {
          return function(e) {
            self.source.value = e.target.result;
            self.parse(self.source.value);
          };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsText(f);
      }
    },

    handleEvent: function Isis_handleEvIsist(evt) {
      console.log('handling ' + evt.type + ' on ' + evt.target);
      switch (evt.target) {
        case this.source:
        case this.parseButton:
          this.parse(evt.target.value);
          break;
        case this.random:
          var self = this;
          var done = function done(value) {
            self.source.value = JSON.stringify(TaskTracer.dump());
            self.parse(self.source.value);
          };
          TaskTracer.run(done);
          break;
      }
    },

    resize: function Isis_resize(event) {
      this.render();
    },

    clear: function Isis_clear(resetColor) {
      this.renderTooltip();
      this.count = 0;
      this.taskSets = {};
      if (resetColor) {
        this._colors = {};
      }
      this._threadRendered = {};
    },

    renderTooltip: function() {
    },

    parse: function Isis_parse(string) {
      window.broadcaster && window.broadcaster.emit('profile-imported');
      this.clear(true);
      var object = JSON.parse(string);
      this.start = object.start;
      // XXX: fix me
      this.end = object.end;
      this.interval = this.end - this.start;
      var self = this;
      if (Array.isArray(object.tasks)) {
        this.currentTasks = object.tasks;
      } else {
        this.currentTasks = [];
        for (var taskid in object.tasks) {
          this.currentTasks.push(object.tasks[taskid]);
        }
      }

      this.buildThreads();

      this.resize();
    },

    _intervalH: 15,
    _offsetX: 200,
    _offsetY: 20,
    _taskHeight: 10,
    _taskMinWidth: 1,

    buildThreads: function() {
      this.currentThreads = {};
      if (!this.currentTasks)
        return;
      if (Array.isArray) {
        this.currentTasks.forEach(function iterator(task) {
          if (!this.currentThreads[task.threadId]) {
            this.currentThreads[task.threadId] = [];
          }
          if (task.sourceEventId === null) {
            return;
          }
          this.currentThreads[task.threadId].push(task);
        }, this);
      }
    },

    render: function Isis_render() {
      this._colors = {};
      this._threadRendered = {};
      var self = this;
      for (var id in this.currentThreads) {
        var thread = new Thread({
          id: id,
          tasks: this.currentThreads[id],
          name: '',
          start: this.start,
          end: this.end,
          interval: this.interval
        });
      }
    },

    buildSourceEvents: function() {
      this.currentSourceEvents = {};
      this.currentSourceEventTypes = {};
      if (!this.currentTasks)
        return;

      if (Array.isArray(this.currentTasks)) {
        this.currentTasks.forEach(function iterator(task) {
          if (!this.currentSourceEvents[task.sourceEventId]) {
            this.currentSourceEvents[task.sourceEventId] = [];
          }
          this.currentSourceEvents[task.sourceEventId].push(task);

          if (!this.currentSourceEventTypes[task.sourceEventType]) {
            this.currentSourceEventTypes[task.sourceEventType] = [];
          }
          this.currentSourceEventTypes[task.sourceEventType].push(task.sourceEventId);
        }, this);
      }

      this.publish('source-event-type-updated', this.currentSourceEventTypes);
    },

    buildConnections: function Isis_buildConnections(sourceEvents) {
      this.buildSourceEvents();
      for (var id in this.currentSourceEvents) {
        var mission = this.currentSourceEvents[id];
        if (!mission)
          return;
        mission.forEach(function(task, index) {
          var taskId = task.taskId || task.id;
          var previousTaskId = task.parentTaskId || task.parent;
          if (!previousTaskId)
            return;
          var previousTaskSet = this.taskSets[previousTaskId];
          var currentTaskSet = this.taskSets[taskId];

          if (previousTaskSet) {
            var x1 = currentTaskSet.position.x;
            var y1 = previousTaskSet.position.y;
            var x2 = currentTaskSet.position.x;
            var y2 = currentTaskSet.position.y;
            if ((previousTaskSet.model.threadId > currentTaskSet.model.threadId) ||
                (previousTaskSet.model.threadId == currentTaskSet.model.threadId &&
                 previousTaskSet.model.id > currentTaskSet.model.id)) {
              y2 = y2 + this._taskHeight;
            } else {
              y1 = y1 + this._taskHeight;
            }

            //this.map.arrow(x1, y1, x2, y2, 2, this._colors[task.sourceEventId]);
          }
        }, this);
      }
    }
  };
  Isis.init();

  var done = function done(value) {
    Isis.source.value = JSON.stringify(TaskTracer.dump());
    Isis.parse(Isis.source.value);
  };
  TaskTracer.run(done);
  window.Isis = Isis;
}(this));
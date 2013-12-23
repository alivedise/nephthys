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
  Raphael.fn.arrow = function (x1, y1, x2, y2, size) {
    var angle = Math.atan2(x1-x2,y2-y1);
    angle = (angle / (2 * Math.PI)) * 360;
    var arrowPath = this.path('M' + x2 + ' ' + y2 + ' L' + (x2 - size) + ' ' + (y2 - size) + ' L' + (x2 - size) + ' ' + (y2 + size) + ' L' + x2 + ' ' + y2 ).attr('fill','black').rotate((90+angle),x2,y2);
    var linePath = this.path('M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2);
    return [linePath,arrowPath];
  }

  /**
   * Generate random color hash
   * @return {String}     Color hash
   */
  function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[ Math.round(Math.random() * 15) ];
    }
    return color;
  }

  var Isis = {
    random: document.getElementById('random'),
    TIME_FACTOR: 0.5,
    WIDTH: 700,
    HEIGHT: 800,
    start: 0,
    end: 0,
    interval: 0,
    count: 0,
    parseButton: document.getElementById('parse'),
    source: document.getElementById('source'),
    init: function Isis_init() {
      this.map = Raphael(document.getElementById('timeline'), this.WIDTH, this.HEIGHT);
      source.addEventListener('change', this);
      this.random.addEventListener('click', this);
    },

    handleEvent: function Isis_handleEvIsist(evt) {
      switch (evt.target) {
        case this.source:
        case this.parseButton:
          this.parse(evt.target.value);
          break;
        case this.random:
          var self = this;
          var done = function done() {
            self.source.value = JSON.stringify(TaskTracer.dump());
            self.parse(self.source.value);
          };
          TaskTracer.run(done);
          break;
      }
    },

    resize: function Isis_resize() {
      if (this._tasks && this._tasks.length) {
        this.HEIGHT = (this._tasks.length + 1) * (this._intervalH + this._taskHeight);
      } else {
        this.HEIGHT = 500;
      }
      this.map.setSize(this.WIDTH, this.HEIGHT);
    },

    clear: function Isis_clear() {
      this.map.clear();
      this.renderTimeline();
      this.count = 0;
      this.taskSets = {};
      this._colors = {};
    },

    parse: function Isis_parse(string) {
      this.clear();
      var object = JSON.parse(string);
      this.start = object.start;
      this.end = object.end;
      this.interval = this.end - this.start;
      if (Array.isArray(object.tasks)) {
        this.currentTasks = object.tasks;
      }

      this.buildThreads();
      this.render();
      this.buildConnections();

      this.resize();
    },

    _intervalH: 15,
    _offsetX: 200,
    _offsetY: 20,
    _taskHeight: 10,

    renderTimeline: function Isis_renderTimeline() {
      this.map.text(5, 5, 'Time').attr('text-anchor', 'start').attr('color', '#ffffff');
      this.map.arrow(100, 5, this.WIDTH, 5, 2);
    },

    renderTask: function Isis_renderTask(task, sourceEventColor) {
      var lx = this.WIDTH * (task.dispatch - this.start) / this.interval + this._offsetX;
      var ex = this.WIDTH * (task.start - this.start) / this.interval + this._offsetX;
      var y = (this.count++) * (this._taskHeight + this._intervalH) + this._offsetY;
      var lw = this.WIDTH * (task.start - task.dispatch) / this.interval;
      var ew = this.WIDTH * (task.end - task.start) / this.interval;
      var h = this._taskHeight;
      var c = sourceEventColor;

      /** Render latency **/
      var latency = this.map.rect(lx, y, lw, h);
      latency.attr('fill', c);
      latency.attr('opacity', 0.5);
      latency.attr('stroke', 'transparent');

      /** Render execution **/
      var execution = this.map.rect(ex, y, ew, h);
      execution.attr('fill', c);
      execution.attr('stroke', 'transparent');

      console.log(lx, ex, lw, ew);

      /** Render label **/
      var label = this.map.text(lx + 5, y + this._taskHeight / 2, 'TaskID: ' + task.id).attr('text-anchor', 'start').attr('color', '#ffffff').attr('font-size', 15).attr(
        'fill', sourceEventColor);
      label.attr('x', label.getBBox().x - label.getBBox().width - 10);

      var thread = this.map.text(5, y, 'ThreadID: ' + task.threadId).attr('text-anchor', 'start').attr('color', '#ffffff').attr('font-size', 15);

      var set = this.map.set();

      set.push(latency, execution, label);
      this.taskSets[task.id] = {
        model: task,
        view: set,
        position: {
          x: lx,
          y: y
        }
      };
    },

    buildThreads: function() {
      this.currentThreads = {};
      if (!this.currentTasks)
        return;
      this.currentTasks.forEach(function iterator(task) {
        if (!this.currentThreads[task.threadId]) {
          this.currentThreads[task.threadId] = [];
        }
        this.currentThreads[task.threadId].push(task);
      }, this);
    },

    render: function() {
      this._colors = {};
      for (var id in this.currentThreads) {
        var tasks = this.currentThreads[id];
        tasks.forEach(function(task) {
          if (!this._colors[task.sourceEventType]) {
            this._colors[task.sourceEventType] = get_random_color();
          }

          this.renderTask(task, this._colors[task.sourceEventType]);
        }, this);
      }
    },

    buildSourceEvents: function() {
      this.currentSourceEvents = {};
      if (!this.currentTasks)
        return;
      this.currentTasks.forEach(function iterator(task) {
        if (!this.currentSourceEvents[task.sourceEventType]) {
          this.currentSourceEvents[task.sourceEventType] = [];
        }
        this.currentSourceEvents[task.sourceEventType].push(task);
      }, this);
    },

    buildConnections: function Isis_buildConnections(sourceEvents) {
      this.buildSourceEvents();
      for (var id in this.currentSourceEvents) {
        var mission = this.currentSourceEvents[id];
        if (!mission)
          return;
        mission.forEach(function(task, index) {
          var taskId = task.id;
          var previousTaskId = task.parent;
          if (previousTaskId >= 0) {
            var previousTaskSet = this.taskSets[previousTaskId];
            var currentTaskSet = this.taskSets[taskId];
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

            this.map.arrow(x1, y1, x2, y2, 2);
          }
        }, this);
      }
    }
  };
  Isis.init();
  Isis.parse(Isis.source.value);
  window.Isis = Isis;
}(this));
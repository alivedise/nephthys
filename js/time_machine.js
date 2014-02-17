(function(window) {
  var MIN_EXECUTION_TIME = 900000;
  var MAX_EXECUTION_TIME = 100000000;
  var TIME_FACTOR = 1;
  var DEBUG = false;
  var MISSION_COUNT = 20;
  function getRandomElementFromArray(a) {
    return a[Math.floor(Math.random() * a.length)];
  }
  function randomCount(length) {
    return Math.round(Math.random() * length);
  }
  function random(start, end) {
    return Math.round(((start) + Math.random() * (end - start)));
  }
  var threadNames = ['UI', 'worker', 'BT', 'NFC', 'Telephony', 'Main', 'IO'];
  var Mission = function Mission() {
    this.tasks = [];
    this.id = this.constructor.id++;
    var count = randomCount(MISSION_COUNT);
    var sourceEventId = null;
    for (var i = 0; i < count + 1; i++) {
      var previousTask = null;
      if (i !== 0) {
        previousTask = getRandomElementFromArray(this.tasks);
      }
      var offset = (i === 0) ? randomCount(100000000) :
                   randomCount(previousTask.executionTime);
      var newTask = new Task(
        offset,
        random(MIN_EXECUTION_TIME, MAX_EXECUTION_TIME),
        this.id,
        getRandomElementFromArray(threadNames),
        previousTask,
        sourceEventId
      );
      if (previousTask) {
        previousTask.appendSubTask(newTask);
      }
      this.tasks.push(newTask);
      if (i === 0) {
        sourceEventId = newTask.id || newTask.taskId;
      }
    }
    this.start = randomCount(100000);
    this.debug('created tasks');
    if (this.tasks[0]) {
      window.setTimeout(this.tasks[0].dispatch.bind(this.tasks[0]), this.tasks[0].offset / TIME_FACTOR);
    }
    this.publish('created');
  };
  Mission.id = 0;

  Mission.prototype.EVENT_PREFIX = 'mission';

  Mission.prototype.publish = function(evtName) {
    this.debug('publish ' + evtName);
    window.dispatchEvent(new CustomEvent(this.EVENT_PREFIX + evtName, {
      detail: this
    }));
  };

  Mission.prototype.CLASS_NAME = 'MISSION';

  Mission.prototype.debug = function m_debug(msg) {
    if (DEBUG || this._DEBUG) {
      console.log('[' + this.CLASS_NAME + ']' +
        '[' + (this.name || this.id) + ']' +
        '[' + TimeMachine.now() + ']' +
        msg);
    }
  };

  var Task = function Task(offset, executionTime, sourceEventType, threadName, previousTask, sourceEventId) {
    this.element = document.createElement('div');
    this.offset = offset;
    this.subTasks = [];
    this.executionTime = executionTime;
    this.sourceEventType = sourceEventType;
    this.sourceEventId = sourceEventId;
    this.id = this.constructor.id++;
    this.threadId = ThreadManager.getThreadId(threadName);
    this.previousTask = previousTask;
    this.parent = this.previousTask ? this.previousTask.id : -1;
    this.isFirstTask = (this.previousTask === null);
    this.publish('created');
    this.debug(' on ' + this.threadId + '; ' + this.toString());
  };

  Task.prototype.dispatch = function() {
    this.dispatchTime = TimeMachine.now();
    this.publish('dispatched');
    this.debug(' on ' + this.threadId + '; ' + this.toString());
  };

  Task.prototype.appendSubTask = function(task) {
    task.previousTask = this;
    if (!this.subTasks) {
      this.subTasks = [];
    }

    this.subTasks.push(task);
  };

  Task.prototype.EVENT_PREFIX = 'task';

  Task.prototype.publish = function(evtName) {
    this.debug('publish ' + evtName);
    this.element.dispatchEvent(new CustomEvent(evtName, {
      detail: this
    }));
    window.dispatchEvent(new CustomEvent(this.EVENT_PREFIX + evtName, {
      detail: this
    }));
  };

  Task.prototype.CLASS_NAME = 'TASK';

  Task.prototype.debug = function m_debug(msg) {
    if (DEBUG || this._DEBUG) {
      console.log('[' + this.CLASS_NAME + ']' +
        '[' + (this.name || this.id) + ']' +
        '[' + TimeMachine.now() + ']' +
        msg);
    }
  };

  Task.prototype.execute = function() {
    this.startTime = TimeMachine.now();
    this.subTasks.forEach(function(subTask) {
      window.setTimeout(subTask.dispatch.bind(subTask), subTask.offset / TIME_FACTOR);
    }, this);
    window.setTimeout(this.done.bind(this), this.executionTime / TIME_FACTOR);
    this.publish('started');
    this.debug(' on ' + this.threadId + '; ' + this.toString());
  };

  Task.prototype.done = function() {
    this.endTime = TimeMachine.now();
    this.publish('completed');
    this.debug(' on ' + this.threadId + '; ' + this.toString());
  }

  Task.prototype.toString = function() {
    var object = {};
    for (var k in this) {
      if (typeof(this[k]) == 'number' || typeof(this[k]) == 'string') {
        object[k] = this[k];
      }
    }

    return JSON.stringify(object) + '; parent task: ' + (this.previousTask ? this.previousTask.toString() : 'NONE');
  }

  Task.id = 0;

  var Thread = function Thread(config) {
    this.currentTimestamp = 0;
    this.id = this.constructor.id++;
    this._tasks = [];
    this._pools = [];
    for (var key in config) {
      this[key] = config[key];
    }

    window.addEventListener('taskdispatched', this);
    this.publish('created');
  }

  Thread.id = 0;

  /**
   * Main thread or not.
   * @type {Boolean}
   */

  Thread.prototype._tasks = null;

  Thread.prototype.currentTask = null;

  Thread.prototype.isBusy = function() {
    var busy = this._tasks.some(function(task) {
      if (typeof(task.startTime) !== 'undefined' && typeof(task.endTime) == 'undefined') {
        this.currentTask = task;
        return true;
      }
    }, this);
    return !!busy;
  };

  Thread.prototype.scheduling = function(task) {
    if (this.isBusy()) {
      this._pools.push(task);
    } else {
      this.currentTask = task;
      task.element.addEventListener('completed', this);
      task.execute();
      this._tasks.push(task);
    }
  };

  Thread.prototype.handleEvent = function(evt) {
    var task = evt.detail;
    switch (evt.type) {
      case 'taskdispatched':
        if (task.threadId === this.id) {
          this.scheduling(task);
        }
        break;
      case 'completed':
        task.element.removeEventListener('completed', this);
        if (this._pools.length) {
          var next = this._pools.splice(0, 1)[0];
          this.scheduling(next);
        }
        break;
    }
  };

  Thread.prototype.EVENT_PREFIX = 'thread';

  Thread.prototype.publish = function(evtName) {
    this.debug('publish ' + evtName);
    window.dispatchEvent(new CustomEvent(this.EVENT_PREFIX + evtName, {
      detail: this
    }));
  };

  Thread.prototype.CLASS_NAME = 'THREAD';

  Thread.prototype.debug = function m_debug(msg) {
    if (DEBUG || this._DEBUG) {
      console.log('[' + this.CLASS_NAME + ']' +
        '[' + (this.name || this.id) + ']' +
        '[' + TimeMachine.now() + ']' +
        msg);
    }
  };

  // Start point of the thread.
  Thread.prototype.offset = 0;

  var ThreadManager = {
    init: function() {
      if (this._inited) {
        return;
      }
      this._inited = true;
      window.addEventListener('threadcreated', this);
      threadNames.forEach(function(name) {
        new Thread({name: name});
      });
    },

    _threads: {},

    handleEvent: function(evt) {
      switch (evt.type) {
        case 'threadcreated':
          this._threads[evt.detail.name] = evt.detail;
          break;
      }
    },

    getThreadId: function(name) {
      return this._threads[name].id;
    },

    getThreadName: function(id) {
      for (var name in this._threads) {
        if (this._threads[name].id === id) {
          return name;
        }
      }
      return '';
    }
  };

  var TimeMachine = {
    TIME: 10000000000000,
    init: function() {
      this.start = Date.now();
    },
    startSimulation: function(done) {
      var clock = sinon.useFakeTimers(0, 'setTimeout', 'clearTimeout',
                                      'setInterval', 'clearInterval', 'Date');
      for (var i = 0; i < randomCount(10) + 1; i++) {
        var mission = new Mission();
      }

      clock.tick(this.TIME);

      clock.restore();
      if (typeof(done) == 'function') {
        setTimeout(done);
      }
    },
    now: function() {
      return (Date.now());
    }
  };

  var TaskTracer = {
    start: 0,
    end: 0,
    _tasks: [],
    dump: function() {
      return {
        start: this.start,
        end: this.end,
        tasks: this._tasks
      };
    },
    run: function(done) {
      this._tasks = [];
      ThreadManager.init();
      TimeMachine.init();
      TimeMachine.startSimulation(done);
      if (this._inited) {
        return;
      }
      this._inited = true;
      window.addEventListener('taskdispatched', this);
      window.addEventListener('taskcompleted', this);
      window.addEventListener('taskstarted', this);
    },
    handleEvent: function(evt) {
      var task = evt.detail;
      switch (evt.type) {
        case 'taskdispatched':
          var _task = {
            'dispatch': task.dispatchTime,
            'id': task.id,
            'threadId': task.threadId,
            'sourceEventType': task.sourceEventType,
            'sourceEventId': task.sourceEventId
          };
          this._tasks.push(_task);
          break;
        case 'taskstarted':
          this._tasks.some(function(t) {
            if (t.id === task.id) {
              t.start = task.startTime;
              t.parent = task.parent;
              return true;
            }
          }, this);
          if (this.start > task.startTime) {
            this.start = task.startTime;
            t.parent = task.parent;
          }
          break;
        case 'taskcompleted':
          this._tasks.some(function(t) {
            if (t.id === task.id) {
              t.end = task.endTime;
              t.start = task.startTime;
              t.parent = task.parent;
              return true;
            }
          }, this);
          if (this.end < task.endTime) {
            this.end = task.endTime;
          }
          break;
      }
    }
  };

  window.TimeMachine = TimeMachine;
  window.TaskTracer = TaskTracer;
}(this));
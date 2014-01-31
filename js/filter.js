'use strict';

(function(exports) {
  function Filter(config) {
    this.config = config;
    this.init();
  };
  Filter.prototype = new EventEmitter();
  Filter.prototype.constructor = Filter;

  var proto = Filter.prototype;

  proto.typeSelector = $('#bySourceEventType');
  proto.idSelector = $('#bySourceEventId');
  proto.labelSelector = $('#byLabel');
  proto.labelCountSelector = $('#labelCount');
  proto.taskCountSelector = $('#taskCount');
  
  proto.init = function() {
    this.typeSelector.change(this.renderIdSelector.bind(this));
    this.idSelector.change(this.emitId.bind(this));
    this.labelSelector.change(this.emitLabel.bind(this));
    $('#clear-filter').click(function() {
      window.broadcaster.emit('-filter-cleared');
    });
    $('select').selectpicker({
      liveSearch: true
    });
    window.broadcaster.on('-source-event-type-created', this.addToTypeSelector.bind(this));
    window.broadcaster.on('profile-imported-stage-0', this.clear.bind(this));
    window.broadcaster.on('-label-rendered', this.addLabel.bind(this));
    window.broadcaster.on('-task-rendered', this.addTask.bind(this));
    $('#label-filter button').click(function() {
      $('#label-filter button').addClass('active').not(this).removeClass('active');
      window.broadcaster.emit('-filter-label-toggle', (this.id === 'label-only'));
    });
    $('#thread-filter button').click(function() {
      $('#thread-filter button').addClass('active').not(this).removeClass('active');
      window.broadcaster.emit(this.id);
    });
  };

  proto.addLabel = function(label) {
    if (this._labels.indexOf(label) < 0) {
      this._labels.push(label);
    } else {
      return;
    }
    this.labelCountSelector.text(this._labels.length);
    this.labelSelector.append('<option value="' + label + '">' + label + '</option>');
    $('select').selectpicker('refresh');
  };

  proto.addTask = function(task) {
    this._tasks.push(task);
    this.taskCountSelector.text(this._tasks.length);
  };

  proto.clear = function() {
    this.typeSelector.html('');
    this.idSelector.html('');
    this.labelSelector.html('');
    this._sourceEventTypes = [];
    this._labels = [];
    this._tasks = [];
    this.taskCountSelector.text(this._tasks.length);
    this.labelCountSelector.text(this._labels.length);
  };

  proto.addToTypeSelector = function addToTypeSelector(sourceEventType) {
    var type = sourceEventType.type;
    this._sourceEventTypes[type] = sourceEventType;
    this.typeSelector.append('<option value="' + type + '">' + type + '</option>');
    $('select').selectpicker('refresh');
  };

  proto.renderIdSelector = function renderIdSelector(evt) {
    this.idSelector.html('');
    var value = $(evt.target).val();
    if (!value) {
      window.broadcaster.emit('-filter-cleared');
      this.idSelector.html('');
      $('select').selectpicker('refresh');
      return;
    }
    value.forEach(function iterator(type) {
      this._sourceEventTypes[type].sources.forEach(function iterator2(id) {
        this.idSelector.append('<option value="' + id + '" style="color: ' + window.app.colorManager.getColor(id) + ';">█ ' + id + '</option>')
      }, this);
    }, this);
    $('select').selectpicker('refresh');
  };

  proto.emitId = function(evt) {
    window.broadcaster.emit('-filter-source-event-id', $(evt.target).val());
  };

  proto.emitLabel = function(evt) {
    window.broadcaster.emit('-filter-label', $(evt.target).val());
  };

  exports.Filter = Filter;
}(this));
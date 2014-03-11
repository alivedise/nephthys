'use strict';

(function(exports) {
  function Filter(config) {
    this.config = config;
    this.init();
  };
  Filter.prototype = new EventEmitter();
  Filter.prototype.constructor = Filter;

  var proto = Filter.prototype;
  proto.containerElement = $('body');

  proto.render = function() {
    if (this.element) {
      return;
    }
    this.containerElement.append(this.template());
    this.filterToggleButton = $('#filterIcon');
    this.filterToolbar = $('#filterToolbar').hide();
    this.filterUI = $('#filter').hide();
    this.typeSelector = $('#bySourceEventType');
    this.idSelector = $('#bySourceEventId');
    this.labelSelector = $('#byLabel');
    this.labelCountSelector = $('#labelCount');
    this.taskCountSelector = $('#taskCount');
  };

  proto.init = function() {
    this.render();
    this.typeSelector.change(this.renderIdSelector.bind(this));
    this.idSelector.change(this.emitId.bind(this));
    this.labelSelector.change(this.emitLabel.bind(this));
    this.filterToggleButton.click(function() {
      this.filterUI.toggle();
    }.bind(this));
    $('#clear-filter').click(function() {
      window.broadcaster.emit('-filter-cleared');
    });
    $('select').selectpicker({
      liveSearch: true
    });
    window.broadcaster.on('canvas-focused', function() {
      this.filterUI.hide();
    }.bind(this));
    window.broadcaster.on('-source-event-type-created', this.addToTypeSelector.bind(this));
    window.broadcaster.on('profile-imported-stage-0', this.clear.bind(this));
    window.broadcaster.on('-label-rendered', this.addLabel.bind(this));
    window.broadcaster.on('-task-rendered', this.addTask.bind(this));
    window.broadcaster.on('-source-event-id-filtered', this.filterBySourceEventId.bind(this));
    $('#label-filter button').click(function() {
      $('#label-filter button').addClass('active').not(this).removeClass('active');
      window.broadcaster.emit('-filter-label-toggle', (this.id === 'label-only'));
    });
    $('#thread-filter button').click(function() {
      $('#thread-filter button').addClass('active').not(this).removeClass('active');
      window.broadcaster.emit(this.id);
    });
  };

  proto.filterBySourceEventId = function(id) {
    this.clear();
    window.broadcaster.emit('-filter-source-event-id', id); 
    this.activeSourceEventId = id;
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
    this.activeSourceEventId = null;
    this.typeSelector.html('');
    this.idSelector.html('');
    this.labelSelector.html('');
    this._sourceEventTypes = [];
    this._labels = [];
    this._tasks = [];
    this.taskCountSelector.text(this._tasks.length);
    this.labelCountSelector.text(this._labels.length);
    this.filterToolbar.show();
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
    window.broadcaster.emit('-filter-source-event-ids', $(evt.target).val());
  };

  proto.emitLabel = function(evt) {
    window.broadcaster.emit('-filter-label', $(evt.target).val());
  };

  proto.template = function() {
    return '<div id="filterToolbar">' +
        '<button id="filterIcon" class="btn btn-default"><span class="glyphicon glyphicon-filter"></span>filter</button></div>' +
        '<div class="well" id="filter">' +
        '<fieldset>' +
          '<!-- Form Name -->' +
          '<legend><small>Filter label</small></legend>' +

          '<!-- Select Multiple -->' +
          '<div class="input-group">' +
            '<label class="control-label" for="bySourceEventId">By labels</label>' +
            '<div class="controls">' +
              '<select id="byLabel" name="byLabel" class="input-xlarge" multiple="multiple" class="selectpicker">' +
              '</select>' +
            '</div>' +
          '</div>' +

          '<legend><small>Toggles</small></legend>' +

          '<div class="input-group">' +
            '<div class="btn-group" id="label-filter">' +
              '<button type="button" class="btn btn-info active" id="not-label-only">All <span class="badge" id="taskCount"></span></button>' +
              '<button type="button" class="btn btn-info" id="label-only">Labels only <span class="badge" id="labelCount"></span></button>' +
            '</div>' +
          '</div>' +

          '<div class="input-group">' +
            '<button type="button" class="btn btn-warning" id="clear-filter">Clear all filter</button>' +
          '</div>' +

          '<div class="input-group">' +
            '<div class="btn-group" id="thread-filter">' +
              '<button type="button" class="btn btn-sample active" id="open-all-threads">Open /</button>' +
              '<button type="button" class="btn btn-sample" id="close-all-threads">Close all threads</button>' +
            '</div>' +
          '</div>' +

          '<legend><small>Filter id</small></legend>' +

          '<!-- Select Multiple -->' +
          '<div class="input-group">' +
            '<label class="control-label" for="bySourceEventType">By source event type</label>' +
            '<div class="controls">' +
              '<select id="bySourceEventType" name="bySourceEventType" class="input-xlarge" multiple="multiple" class="selectpicker">' +
              '</select>' +
            '</div>' +
          '</div>' +

          '<!-- Select Multiple -->' +
          '<div class="input-group">' +
            '<label class="control-label" for="bySourceEventId">By source event ID</label>' +
            '<div class="controls">' +
              '<select id="bySourceEventId" name="bySourceEventId" class="input-xlarge" multiple="multiple" class="selectpicker">' +
              '</select>' +
            '</div>' +
          '</div>' +
        '</fieldset>' +
      '</div>';
  };

  exports.Filter = Filter;
}(this));
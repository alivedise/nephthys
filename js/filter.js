'use strict';

(function(exports) {
  function Filter(config) {
    this.config = config;
    this.init();
  };
  Filter.prototype = new EventEmitter();
  Filter.prototype.constructor = Filter;

  var proto = Filter.prototype;
  proto.containerElement = $('.layout-north');

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
  };

  proto.init = function() {
    this.render();
    this.typeSelector.change(this.renderIdSelector.bind(this));
    this.idSelector.change(this.emitId.bind(this));
    this.filterToggleButton.click(function() {
      this.filterUI.toggle();
    }.bind(this));
    this.typeSelector.selectpicker({
      liveSearch: true
    });
    this.idSelector.selectpicker({
      liveSearch: true
    });
    window.broadcaster.on('canvas-focused', function() {
      this.filterUI.hide();
    }.bind(this));
    window.broadcaster.on('-source-event-type-created', this.addToTypeSelector.bind(this));
    window.broadcaster.on('profile-imported-stage-0', this.clear.bind(this));
    window.broadcaster.on('-source-event-id-filtered', this.filterBySourceEventId.bind(this));

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

  proto.clear = function() {
    this.activeSourceEventId = null;
    this.typeSelector.html('');
    this.idSelector.html('');
    this._sourceEventTypes = [];
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

  proto.template = function() {
    return '<div id="filterToolbar">' +
        '<button id="filterIcon" class="btn btn-default"><span class="glyphicon glyphicon-filter"></span></button></div>' +
        '<div class="well" id="filter">' +
        '<fieldset>' +
          '<!-- Form Name -->' +

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
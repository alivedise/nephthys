'use strict';

(function(exports) {
  function Filter(config) {
    this.config = config;
    this.init();
  };

  var proto = Filter.prototype;

  proto.typeSelector = $('#bySourceEventType');
  proto.idSelector = $('#bySourceEventId');
  
  proto.init = function() {
    this.typeSelector.change(this.renderIdSelector.bind(this));
    this.idSelector.change(this.renderBySourceEventId.bind(this));
    $('select').selectpicker();
    window.addEventListener('source-event-type-updated', this);
  };

  proto.handleEvent = function(evt) {
    switch (evt.type) {
      case 'source-event-type-updated':
        this.renderTypeSelector(evt.detail);
        break;
    }
  };

  proto.renderTypeSelector = function renderTypeSelector(sourceEventTypes) {
    this.currentSourceEventTypes = sourceEventTypes;
    this.typeSelector.html('');
    for (var type in sourceEventTypes) {
      this.typeSelector.append('<option value="' + type + '">' + type + '</option>');
    }
    $('select').selectpicker('refresh');
  };

  proto.renderBySourceEventId = function renderByTaskId(evt) {
    this.currentFilter = {
      'sourceEventId': $(evt.target).val()
    };
    this.currentFilter = null;
  };

  proto.renderIdSelector = function renderIdSelector(evt) {
    this.idSelector.html('');
    $(evt.target).val().forEach(function iterator(type) {
      this.currentSourceEventTypes[type].forEach(function iterator2(id) {
        this.idSelector.append('<option value="' + id + '">' + id + '</option>')
      }, this);
    }, this);
    $('select').selectpicker('refresh');
  };

  proto.publish = function(event, detail) {
    window.dispatchEvent(new CustomEvent(event, { detail: detail }));
  };

  exports.Filter = Filter;
}(this));
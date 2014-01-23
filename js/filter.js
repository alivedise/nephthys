'use strict';

(function(exports) {
  function Filter(config) {
    this.config = config;
    this.init();
  };

  Filter.prototype = Object.create(EventEmitter.prototype);

  var proto = Filter.prototype;

  proto.typeSelector = $('#bySourceEventType');
  proto.idSelector = $('#bySourceEventId');
  
  proto.init = function() {
    this.typeSelector.change(this.renderIdSelector.bind(this));
    this.idSelector.change(this.renderBySourceEventId.bind(this));
    $('.selectpicker').selectpicker();
    window.addEventListener('profile-imported', this);
  };

  proto.handleEvent = function(evt) {
    switch (evt.type) {
      case 'profile-imported':
        this.render
        break;
    }
  };

  proto.renderTypeSelector = function renderTypeSelector() {
    this.typeSelector.html('');
    for (var type in this.currentSourceEventTypes) {
      this.typeSelector.append('<option value="' + type + '">' + type + '</option>');
    }
    $('.selectpicker').selectpicker('refresh');
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
    $('.selectpicker').selectpicker('refresh');
  };

  exports.Filter = Filter;
}(this));
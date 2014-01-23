 require(['../lib/jquery-1.10.2.min',
          '../lib/bootstrap-select/bootstrap-select.min'], function() {
  define(function(require, exports, module) {
    var events = require('../lib/evt').mix;

    function Filter(config) {
      this.config = config;
      this.init();
    };

    module.exports = Filter;

    var proto = events(Filter.prototype);
    console.log(filter);

    proto.typeSelector = $('#bySourceEventType');
    proto.idSelector = $('#bySourceEventId');
    
    proto.init = function() {
      this.typeSelector.change(this.renderIdSelector.bind(this));
      this.idSelector.change(this.renderBySourceEventId.bind(this));
      $('.selectpicker').selectpicker();
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
      console.log(this.currentFilter);
      this._render();
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

    console.log(Filter);
  });
});
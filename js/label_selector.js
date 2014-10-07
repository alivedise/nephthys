'use strict';

(function(exports) {
  exports.LabelSelector = function(app) {
    this.app = app;
    this.render();
    this.element.selectpicker('hide');
    this.element.selectpicker('setStyle', 'label-selector', 'add');
    window.broadcaster.on('profile-imported', this.init.bind(this));
    window.broadcaster.on('-labels-rendered', this.addLabels.bind(this));
    window.broadcaster.on('-task-render-complete', this.dumpLabels.bind(this));
  };
  LabelSelector.prototype = new EventEmitter();
  LabelSelector.prototype.containerElement = $('.layout-north');
  LabelSelector.prototype.init = function() {
    this._labels = [];
    this._labelOptionsString = '';
    this.element.html('');
  };

  LabelSelector.prototype.addLabels = function(labels) {
    labels.forEach(function(label) {
      label = label.label || label[1];
      if (this._labels.indexOf(label) < 0) {
        this._labels.push(label);
        this._labelOptionsString += '<option value="' + label + '">' + label + '</option>';
      }
    }, this);
  };
  LabelSelector.prototype.dumpLabels = function() {
    this.element.append(this._labelOptionsString);
    this.element.selectpicker('show').selectpicker('refresh');
  };
  LabelSelector.prototype.render = function() {
    this.containerElement.append(this.template);
    this.element = $('#label-selector');
    this.element.selectpicker({
      liveSearch: true,
      noneSelectedText: 'Search labels..'
    });
    this.element.change(this.emitLabel.bind(this));
  };
  LabelSelector.prototype.emitLabel = function(evt) {
    window.broadcaster.emit('-filter-label', $(evt.target).val());
  };
  LabelSelector.prototype.template = function() {
    return '<select id="label-selector" name="byLabel" class="input-xlarge" multiple="multiple" class="selectpicker">' +
           '</select>';
  };
  exports.LabelSelector = LabelSelector;
}(this));
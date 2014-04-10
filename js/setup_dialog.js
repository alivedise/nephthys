'use strict';
(function(exports) {
  exports.SetupDialog = function(app) {
    this.app = app;
    this.render();
    window.broadcaster.on('profile-imported', function() {
      this.closeButton.show();
      this.element.modal('hide');
    }.bind(this));
  };
  SetupDialog.prototype = new EventEmitter();
  SetupDialog.prototype.containerElement = $('body');
  SetupDialog.prototype.init = function() {
    this._labels = [];
    this.element.html('');
  };
  SetupDialog.prototype.render = function() {
    this.containerElement.append(this.template());
    this.element = $('#setup-dialog');
    this.element.modal({
      keyboard: false
    });
    this.closeButton = this.element.find('.close').hide();
    this.sampleSelector = $('#sample-selector').selectpicker().selectpicker('hide');
    this.sampleSelector.change(function(evt) {
      var value = $(evt.target).val();
    }.bind(this))
  };
  SetupDialog.prototype.template = function() {
    return '<div class="modal fade" id="setup-dialog" tabindex="-1" role="dialog" aria-labelledby="setupDialog" aria-hidden="true">' +
              '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                  '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title" id="myModalLabel">Isis ' + this.app.VERSION + ' TaskTracer GUI</h4>' +
                  '</div>' +
                  '<div class="modal-footer">' +
                    '<input class="btn-warning" id="choose" type="file" title="Import profile" />' +
                    '<select id="sample-selector" style="display: none;">' +
                      '<option value="1">Sample 1</option>' +
                      '<option value="2">Sample 2</option>' +
                      '<option value="3">Sample 3</option>' +
                      '<option value="4">Sample 4</option>' +
                    '</select>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
  };
  exports.SetupDialog = SetupDialog;
}(this));
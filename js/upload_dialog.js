'use strict';
(function(exports) {
  exports.UploadDialog = function(app) {
    this.app = app;
    window.broadcaster.on('upload-start', function(uuid) {
      window.location.hash = uuid;
      this.url = window.location.href;
      this.render();
      this.element.modal('show');
    }.bind(this));

    window.broadcaster.on('upload-done', function() {
      if (this.title) {
        this.title.text('Upload done.');
      }
    }.bind(this));
  };
  UploadDialog.prototype = new EventEmitter();
  UploadDialog.prototype.containerElement = $('body');
  UploadDialog.prototype.render = function() {
    if (this.element) {
      return;
    }
    this.containerElement.append(this.template());
    this.element = $('#upload-dialog');
    this.element.modal({
      keyboard: false
    });
    this.title = $('#upload-dialog-title');
  };
  UploadDialog.prototype.template = function() {
    return '<div class="modal fade" id="upload-dialog" tabindex="-1" role="dialog" aria-labelledby="setupDialog" aria-hidden="true">' +
              '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                  '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title" id="upload-dialog-title">Uploading...</h4>' +
                  '</div>' +
                  '<div class="modal-body">' +
                    '<input type="text" readonly value="' + this.url +'" />' +
                  '</div>' +
                  '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
  };
  exports.UploadDialog = UploadDialog;
}(window));
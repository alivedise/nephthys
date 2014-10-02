'use strict';
(function(exports) {
  exports.SetupDialog = function(app) {
    this.app = app;
    this.downloader = new Downloader(this.app);
    this.render();
    window.broadcaster.on('profile-imported', function() {
      this.closeButton.show();
      this.element.modal('hide');
    }.bind(this));
    window.broadcaster.on('profile-downloaded', function() {
      this.context.text('Profile downloaded, parsing..');
    }.bind(this));
    window.broadcaster.on('profile-download-failed', function() {
      this.context.text('Profile download failed, please try to import from a file.');
      this.choose.parent().removeClass('disabled');
    }.bind(this));
  };
  SetupDialog.prototype = new EventEmitter();
  SetupDialog.prototype.containerElement = $('body');
  SetupDialog.prototype.init = function() {
    this.element.html('');
  };
  SetupDialog.prototype.render = function() {
    if (this.element) {
      return;
    }
    this.containerElement.append(this.template());
    this.element = $('#setup-dialog');
    this.element.modal({
      keyboard: false
    });
    this.choose = $('#choose');
    // We should launch the input here but we cannot.
    // this.choose.bootstrapFileInput();
    this.context = this.element.find('.modal-body');
    if (this.downloader.state === 'downloading') {
      this.context.text('Downloading profile...');
      this.choose.parent().addClass('disabled');
    }
    this.closeButton = this.element.find('.close').hide();
  };
  SetupDialog.prototype.template = function() {
    return '<div class="modal fade" id="setup-dialog" tabindex="-1" role="dialog" aria-labelledby="setupDialog" aria-hidden="true">' +
              '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                  '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title" id="myModalLabel">Isis ' + this.app.VERSION + ' TaskTracer GUI</h4>' +
                  '</div>' +
                  '<div class="modal-body">' +
                  '<span>About TaskTracer: <a target="blank" href="http://wiki.mozilla.org/TaskTracer">http://wiki.mozilla.org/TaskTracer</a></span>' +
                  '</div>' +
                  '<div class="modal-footer">' +
                    '<input class="btn-warning" id="choose" type="file" title="Import profile" />' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
  };
  exports.SetupDialog = SetupDialog;
}(this));
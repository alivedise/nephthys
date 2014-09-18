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
      this.statusElement.text('Profile downloaded, parsing..');
    }.bind(this));
    window.broadcaster.on('profile-download-failed', function() {
      this.statusElement.text('Profile download failed, please try to import from a file.');
      this.chooseWrapper && this.chooseWrapper.removeClass('disabled');
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
    if (window.prettyPrint) {
      prettyPrint();
    }
    this.element = $('#setup-dialog');
    this.element.modal({
      keyboard: false
    });
    this.choose = $('#choose');
    this.statusElement = this.element.find('#setup-status');
    if (this.downloader.state === 'downloading') {
      this.statusElement.text('Downloading profile...');
    }
    this.closeButton = this.element.find('.close').hide();
    var self = this;
    $(function() {
      $('input[type=file]').bootstrapFileInput();
      self.chooseWrapper = self.choose.parent();
      if (self.downloader.state == 'downloading') {
        self.chooseWrapper.addClass('disabled');
      }
    });
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
                    '<h5>How to enable task tracer?</h5>' +
                    '<ol>' +
                      '<li>in your <code>.userconfig</code>' +
                        '<pre class="prettyprint">export MOZ_TASK_TRACER=1</pre>' +
                      '</li>' +
                      '<li>Add your own label if necessary.' +
                        '<pre class="prettyprint">dump("ttd: my label");</pre>' +
                      '</li>' +
                      '<li>Get the profile</li>' +
                    '</ol>' +
                  '</div>' +
                  '<div class="modal-footer">' +
                    '<span class="pull-left" id="setup-status"></span>' +
                    '<input class="btn-warning" id="choose" type="file" title="Import profile" />' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>';
  };
  exports.SetupDialog = SetupDialog;
}(this));
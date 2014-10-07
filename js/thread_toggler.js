'use strict';

(function(exports) {
  exports.ThreadToggler = function(app) {
    this.app = app;
    this.render();
    this.element.hide();
    window.broadcaster.on('profile-imported', this.init.bind(this));
  };
  ThreadToggler.prototype = new EventEmitter();
  ThreadToggler.prototype.containerElement = $('.layout-north');
  ThreadToggler.prototype.init = function() {
    this.element.show();
  };
  ThreadToggler.prototype.render = function() {
    this.containerElement.append(this.template);
    this.element = $('#toggler');
    this.element.click(function() {
      if (this.ALL_THREADS_CLOSED) {
        window.broadcaster.emit('-thread-toggler-opened');
      } else {
        window.broadcaster.emit('-thread-toggler-closed');
      }
      this.ALL_THREADS_CLOSED = !this.ALL_THREADS_CLOSED;
    }.bind(this));
  };
  ThreadToggler.prototype.ALL_THREADS_CLOSED = false;
  ThreadToggler.prototype.template = function() {
    return '<button type="button" id="toggler" class="btn btn-default">' +
            '<span class="glyphicon glyphicon-tasks"></span>' +
            '</button>';
  };
  exports.ThreadToggler = ThreadToggler;
}(this));
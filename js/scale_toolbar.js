'use strict';

(function(exports) {
  exports.ScaleToolBar = function(app) {
    this.app = app;
    this.render();
    this.element.hide();
    window.broadcaster.on('profile-imported', this.init.bind(this));
    window.broadcaster.on('-task-transformed', function(translate, scale) {
      this.scaleText.text(Math.floor(scale * 100) + '%');
    }.bind(this))
  };
  ScaleToolBar.prototype = new EventEmitter();
  ScaleToolBar.prototype.containerElement = $('body');
  ScaleToolBar.prototype.SCALE = 2;
  ScaleToolBar.prototype.init = function() {
    this.element.show();
  };
  ScaleToolBar.prototype.render = function() {
    this.containerElement.append(this.template);
    this.element = $('#scaleToolbar');
    this.zoomInButton = $('#zoomInButton');
    this.zoomOutButton = $('#zoomOutButton');
    this.scaler = $('#scaler');
    this.scaleText = $('#scaleText');
    this.resetScaleButton = $('#resetScaleButton');
    this.zoomInButton.click(function() {
      window.broadcaster.emit('-scale-toolbar-zoom-in', this.SCALE);
    }.bind(this));

    this.zoomOutButton.click(function() {
      window.broadcaster.emit('-scale-toolbar-zoom-out', this.SCALE);
    }.bind(this));

    this.scaler.click(function() {
      window.broadcaster.emit('-scale-toolbar-reset');
    }.bind(this));
  };
  ScaleToolBar.prototype.template = function() {
    return '<div class="btn-group" id="scaleToolbar">' +
              '<button type="button" id="scaler" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-off" id="reset-scale"></span> <span id="scaleText">100%</span></button>' +
              '<button type="button" id="zoomInButton" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-plus"></span></button>' +
              '<button type="button" id="zoomOutButton" class="btn btn-default btn-xs"><span class="glyphicon glyphicon-minus"></span></button>' +
            '</div>';
  };
  exports.ScaleToolBar = ScaleToolBar;
}(this));
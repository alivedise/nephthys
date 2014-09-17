'use strict';

(function(exports) {
  var guid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return function() {
      return s4() + s4() + s4() + s4() +
             s4() + s4() + s4() + s4();
    };
  })();

  exports.UploadToolBar = function(app) {
    this.app = app;
    this.render();
    this.element.hide();
    window.broadcaster.on('profile-imported', this.init.bind(this));
  };
  UploadToolBar.prototype = new EventEmitter();
  UploadToolBar.prototype.containerElement = $('body');
  UploadToolBar.prototype.SCALE = 2;
  UploadToolBar.prototype.init = function(profile) {
    this.profile = profile;
    this.element.show();
  };

  UploadToolBar.prototype.render = function() {
    this.containerElement.append(this.template);
    this.element = $('#uploadToolBar');
    this.uploadButton = $('#uploadButton');

    this.uploadButton.click(function() {
      this.upload();
    }.bind(this));
  };
  UploadToolBar.prototype.upload = function() {
    if (this.uploadRef) {
      console.warn('profile already uploaded!');
      return;
    }
    var uuid = guid();
    var dataRef = new Firebase(this.app.REMOTE);
    var uploadRef = dataRef.child(uuid);
    uploadRef.once('value', function(snapshot) {
      var exists = (snapshot.val() !== null);
      if (exists) {
        console.log(uuid, ' had been registered by someone else. finding another..');
        this.upload();
      } else {
        this.uploadRef = uploadRef;
        this.uuid = uuid;
        this._upload(uuid);
      }
    }.bind(this));
  };
  UploadToolBar.prototype._upload = function(uuid) {
    window.broadcaster.emit('upload-start', uuid);
    this.uploadRef.set(this.profile);
    this.uploadRef.on('value', function onchange(snapshot) {
      if (snapshot.val()) {
        this.uploadRef.off('value', onchange, this);
        window.broadcaster.emit('upload-done');
      }
    }, this);
  };
  UploadToolBar.prototype.template = function() {
    return '<div id="uploadToolBar">' +
              '<button type="button" id="uploadButton" class="btn btn-default"><span class="glyphicon glyphicon-upload"></span></button>' +
            '</div>';
  };
  exports.UploadToolBar = UploadToolBar;
}(this));
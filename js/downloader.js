'use strict';

(function(exports) {
  exports.Downloader = function(app) {
    this.state = 'inited';
    this.app = app;
    this.download();
  };
  Downloader.prototype = new EventEmitter();
  Downloader.prototype.constructor = Downloader;
  Downloader.prototype.download = function() {
    var uuid = window.location.hash;
    if (!uuid) {
      return;
    }
    this.state = 'downloading';
    uuid = uuid.replace('#', '');
    this.dataRef = new Firebase(this.app.REMOTE);
    this.profileRef = this.dataRef.child(uuid);
    this.profileRef.once('value', function(snapshot) {
      this.state = 'downloaded';
      var exists = (snapshot.val() !== null);
      if (exists) {
        window.broadcaster.emit('profile-downloaded', snapshot.val());
      } else {
        console.warn('data does not exist');
        window.broadcaster.emit('profile-download-failed');
      }
    }.bind(this));
  };
  exports.Downloader = Downloader;
}(window));
'use strict';

(function(exports) {
  self.broadcaster = new EventEmitter();
  self.friendly_runner = new FriendlyRunner();
  self.app = new self.App();
}(this));
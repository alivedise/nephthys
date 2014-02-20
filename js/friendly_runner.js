/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode: nil; js-indent-level: 2 -*- */
'use strict';

(function(exports) {
  function FriendlyRunner() {
    this.init();
  }

  FriendlyRunner.prototype = {
    schedule_runners: function () {
      var self = this;

      if (this.runners.length == 0 || this.is_running) {
        return;
      }

      this.is_running = true;

      function _run_runner() {
        if (self.runners.length == 0) {
          self.is_running = false;
          return;
        }
        window.setTimeout(function() {
          var runner = self.runners[0];
          self.runners.splice(0, 1);
          runner();
          _run_runner();
        });
      }
      _run_runner();
    },

    dispatch_runner: function(runner) {
      this.runners.push(runner);
      this.schedule_runners();
    },

    init: function() {
      this.runners = [];
      this.is_running = false;
      window.broadcaster.on('-friendly-runner',
                            this.dispatch_runner.bind(this));
    }
  };

  exports.FriendlyRunner = FriendlyRunner;
})(this);

'use strict';

(function(exports) {
  var LayoutController = function() {
    this.init();
  };

  LayoutController.prototype = {
    publish: function(event, detail) {
      console.log('publishing ' + event);
      window.dispatchEvent(new CustomEvent(event, { detail: detail }));
    },
    layout: {
      filter: 250,
      header: 50,
      timeline: 40,
      info: 40
    },
    getHeight: function() {
      return window.innerHeight - this.layout.header - this.layout.timeline - this.layout.info;
    },
    getWidth: function() {
      return window.innerWidth - this.layout.filter
    },
    init: function() {
      var self = this;
      this._layout = $('body').layout({
        center__paneSelector: ".layout-center"
        , west__paneSelector:   ".layout-west"
        , north__paneSelector:   ".layout-north"
        , west__size:       this.layout.filter
        , north__size:       this.layout.header
        , spacing_open:     1  // ALL panes
        , spacing_closed:     1 // ALL panes
        // MIDDLE-LAYOUT (child of outer-center-pane)
        , center__childOptions: {
            center__paneSelector: "#timeline"
          , center__onresize: function() {
              self.publish('ui-resize');
            }
          , north__paneSelector:   "#ui-top"
          , north__size:      this.layout.timeline
          , south__paneSelector:   "#ui-bottom"
          , south__size:      this.layout.info
          , spacing_open:     0  // ALL panes
          , spacing_closed:     0 // ALL panes
        }
      });
    }
  };

  exports.LayoutController = LayoutController;
}(this));
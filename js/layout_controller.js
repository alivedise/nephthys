'use strict';

(function(exports) {
  var LayoutController = function() {
    this.init();
  };

  LayoutController.prototype = {
    init: function() {
      this._layout = $('body').layout({
          center__paneSelector: ".layout-center"
        , west__paneSelector:   ".layout-west"
        , north__paneSelector:   ".layout-north"
        , west__size:       250
        , north__size:       50
        , spacing_open:     0  // ALL panes
        , spacing_closed:     0 // ALL panes
          // MIDDLE-LAYOUT (child of outer-center-pane)
        , center__childOptions: {
            center__paneSelector: "#timeline"
          , north__paneSelector:   "#ui-top"
          , north__size:      50
          , spacing_open:     0  // ALL panes
          , spacing_closed:     0 // ALL panes

          /*
            // INNER-LAYOUT (child of middle-center-pane)
          , center__childOptions: {
              center__paneSelector: ".inner-center"
            , west__paneSelector:   ".inner-west"
            , east__paneSelector:   ".inner-east"
            , west__size:       75
            , east__size:       75
            , spacing_open:     8  // ALL panes
            , spacing_closed:     8  // ALL panes
            , west__spacing_closed: 12
            , east__spacing_closed: 12
            }
          } */
        }
      });
    }
  };

  exports.LayoutController = LayoutController;
}(this));
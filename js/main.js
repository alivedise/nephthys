require([
  '../lib/jquery-1.10.2.min',
  '../lib/jquery-layout-latest'
], function () {
  $(document).ready(function () {
    // OUTER-LAYOUT
    $('#layout').layout({
      center__paneSelector: ".outer-center"
    , west__paneSelector:   ".outer-west"
    , west__size:       200
    , spacing_open:     0  // ALL panes
    , spacing_closed:     0 // ALL panes

      // MIDDLE-LAYOUT (child of outer-center-pane)
    , center__childOptions: {
        center__paneSelector: ".middle-center"
      , west__paneSelector:   ".middle-west"
      , east__paneSelector:   ".middle-east"
      , west__size:       100
      , east__size:       100
      , spacing_open:     8  // ALL panes
      , spacing_closed:     12 // ALL panes

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
      }
    });
  });
});
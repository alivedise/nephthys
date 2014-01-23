require([
  '../lib/jquery-1.10.2.min',
  '../lib/jquery.layout-latest',
  'map'
], function () {
  $(document).ready(function () {
    // OUTER-LAYOUT
    $('body').layout({
      north__paneSelector: '#content',
      center__paneSelector: "#container"
    , north__size:       100
    , spacing_open:     0  // ALL panes
    , spacing_closed:     0 // ALL panes

      // MIDDLE-LAYOUT (child of outer-center-pane)
    , center__childOptions: {
        center__paneSelector: '#mapContainer'
      , west__paneSelector:   '#menuContainer'
      , west__size:       250
      , spacing_open:     0  // ALL panes
      , spacing_closed:     0 // ALL panes
      }
    });
  });
});
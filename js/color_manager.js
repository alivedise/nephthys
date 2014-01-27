(function(exports) {
  var ColorManager = function() {
    this.init();
  };

  ColorManager.prototype = new EventEmitter();
  ColorManager.prototype.init = function() {
    this._colors = {};
  };

  ColorManager.prototype.getColor = function getColor(id) {
    if (!this._colors[id]) {
      var color = this.getRandomColor();
      this._colors[id] = color;
    }

    return this._colors[id];
  };

  /**
   * Generate random color hash
   * @return {String}     Color hash
   */
  ColorManager.prototype.getRandomColor = function get_random_color() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[ Math.round(Math.random() * 15) ];
    }
    return color;
  }
  exports.ColorManager = ColorManager;
}(this));
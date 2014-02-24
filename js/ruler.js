(function(exports) {
  var Ruler = function(container) {
    this.container = container;
    container.dblclick(function(evt) {
      this.render();
      this.show(evt);
    }.bind(this));
  };
  Ruler.prototype.__proto__ = EventEmitter.prototype;
  Ruler.prototype.show = function(evt) {
    console.log(evt.pageX);
    this._line.css({ left: evt.pageX -  this.getAbsoluteX(evt.target)});
  };
  Ruler.prototype.render = function() {
    if (this._line) {
      this._line.remove();
    }
    this.container.append('<div class="ruler"></div>');
    this._line = this.container.find('.ruler');
  };
  Ruler.prototype.getAbsoluteX = function(element) {
    var curleft = 0;
    if (element.offsetParent) {
      do {
        curleft += element.offsetLeft;
      } while (element = element.offsetParent);
    }
    console.log(curleft);
    return curleft;
  };
  exports.Ruler = Ruler;
}(this));
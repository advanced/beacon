jade.templates = jade.templates || {};
jade.templates['index'] = (function(){
  return function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
// iterate data 
;(function(){
  if ('number' == typeof data .length) {

    for (var $index = 0, $$l = data .length; $index < $$l; $index++) {
      var d = data [$index];

buf.push('<h1>');
var __val__ = d
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</h1>');
    }

  } else {
    var $$l = 0;
    for (var $index in data ) {
      $$l++;      var d = data [$index];

buf.push('<h1>');
var __val__ = d
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</h1>');
    }

  }
}).call(this);

}
return buf.join("");
};
})();
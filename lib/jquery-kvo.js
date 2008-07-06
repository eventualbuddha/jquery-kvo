(function($) {
  function makeExpando() {
    var o = {}, expando, id;
    $(o).data('expando');
    for (var k in o) {
      if (/^jQuery/.test(k)) {
        expando = k;
        id = o[expando];
        break;
      }
    }
    return {expando: expando, id: id};
  }
  
  $.kvo.build = function(properties) {
    var object = $.accessors.build(function() {
      // steal someone else's expando
      var e = makeExpando();
      this.getter(e.expando, function(){ return e.id });
      
      // create the getters and setters
      for (var key in properties) {
        var value = properties[key];
        
        if ($.isFunction(value)) {
          this.define(key, value);
        } else {
          $.kvo.defineGetter(this, key);
          $.kvo.defineSetter(this, key);
        }
      }
    });
    
    // set the default values
    for (var key in properties) {
      $(object).data('kvo.'+key+'.value', properties[key]);
    }
    
    return object;
  };
  
  $.kvo.defineGetter = function(object, key) {
    object.getter(key, function(){ return $(this).data('kvo.'+key+'.value') });
  };
  
  $.kvo.defineSetter = function(object, key) {
    object.setter(key, function(newvalue) {
      var oldvalue = $(this).data('kvo.'+key+'.value');
      $(this).data('kvo.'+key+'.value', newvalue);
      $(this).trigger('kvo.'+key+'.set', [newvalue, oldvalue]);
    });
  };
})(jQuery);

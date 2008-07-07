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
  
  $.fn.observable = function(observable) {
    return this.data('kvo', observable);
  };
  
  $.fn.kvo = function(property, value) {
    if (value === undefined) {
      return this.data('kvo-'+property+'-value');
    } else {
      var oldvalue = this.kvo(property);
      return this
        .data('kvo-'+property+'-value', value)
        .trigger('kvo-'+property+'-set', [value, oldvalue]);
    }
  };
  
  $.kvo = {
    build: function(properties) {
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
        $(object).data('kvo-'+key+'-value', properties[key]);
      }
      
      // mark it as observable
      $(object).observable(true);
      
      return object;
    }, 
  
    defineGetter: function(object, key) {
      object.getter(key, function(){ return $(this).kvo(key) });
    }, 
  
    defineSetter: function(object, key) {
      object.setter(key, function(value){ $(this).kvo(key, value) });
    }, 
    
    find: function(path, scope) {
      if (!scope) scope = window;
      var observable, valuepath = [];
      
      $.each(path.split('.'), function() {
        if ($(scope).observable()) {
          valuepath = [];
          observable = scope;
        }
        valuepath.push(this);
        scope = scope[this];
      });
      
      return {observable: observable, valuepath: valuepath};
    }, 
    
    getValue: function(valuepath, value) {
      $.each(valuepath, function(){ value = value[this] });
      return value;
    }, 
    
    onSet: function(event, newvalue, oldvalue, kvo) {
      var observable = kvo.observable;
      var value = $.kvo.getValue(kvo.valuepath, kvo.observable);
      
      var target = $(event.target);
      if (target.is(':text')) {
        target.val(value);
      } else if (target.is(':checkbox') || target.is(':radio')) {
        target.val(value ? '1' : '0').attr('checked', value);
      } else {
        target.html(value);
      }
    }, 
  
    main: function(scope) {
      scope = scope || document.body;
      $('[bind]', scope).each(function() {
        var target = $(this);
        var kvo = $.kvo.find(target.attr('bind'));
        var name = 'kvo-'+kvo.valuepath[0]+'-set';
        
        $(kvo.observable).bind(name, function(event, newvalue, oldvalue) {
          event.target = target.get(0);
          $.kvo.onSet(event, newvalue, oldvalue, kvo);
        });
        
        // do the initial value
        $.kvo.onSet(
          /* event = */ {target: target.get(0)},
          /* newvalue = */ $.kvo.getValue(kvo.valuepath, kvo.observable), 
          /* oldvalue = */ null, 
          /* kvo = */ kvo);
      });
    }
  };
  
  $(function(){ $.kvo.main() });
})(jQuery);

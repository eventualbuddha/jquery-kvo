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
  
  $.fn.kvobservable = function(observable) {
    return this.data('kvo', observable);
  };
  
  $.fn.kvobserve = function(property, fn) {
    return this.bind('kvo-'+property+'-set', fn).kvobservable(true);
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
  
  $.fn.kvobind = function(observable, valuepath, options) {
    if (typeof observable == 'string') {
      options = valuepath;
      var kvo = $.kvo.find(observable);
      observable = kvo.observable;
      valuepath  = kvo.valuepath;
    }
    
    options = options || {};
    $(observable).kvobservable(true);
    var self = this;
    
    valuepath = $.makeArray(valuepath);
    $(observable).bind('kvo-'+valuepath[0]+'-set', function(event, newvalue, oldvalue) {
      $.kvo.change(self, newvalue, oldvalue, valuepath, options.property);
    });
    
    $.kvo.change(this, $.kvo.getValue(valuepath, observable), null, valuepath, options.property);
  };
  
  $.kvo = {
    setters: {
      html: function(e,v){ e.html(v.toString()) }, 
      value: function(e,v){ e.val(v) }, 
      checked: function(e,v){ e.val(v ? '1' : '0').attr('checked', v) }, 
      visible: function(e,v){ v ? e.show() : e.hide() }
    }, 
    
    setterFor: function(element, property) {
      if (property) return property
      if (element.is(':text')) return 'value';
      if (element.is(':checkbox')) return 'checked';
      if (element.is(':radio')) return 'checked';
      return 'html'
    }, 
    
    set: function(element, property, value) {
      $.kvo.setters[$.kvo.setterFor(element, property)].call($.kvo, element, value);
    }, 
    
    change: function(elements, newvalue, oldvalue, valuepath, property) {
      var value = $.kvo.getValue(valuepath.slice(1), newvalue);
      $(elements).each(function() {
        $.kvo.set($(this), property, value);
      });
    }, 
    
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
      $(object).kvobservable(true);
      
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
        if ($(scope).kvobservable()) {
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
    
    main: function(scope) {
      $('[bind]', scope).each(function() {
        $(this).kvobind($(this).attr('bind'), {property: $(this).attr('bind-to')});
      });
    }
  };
  
  $(function(){ $.kvo.main() });
})(jQuery);

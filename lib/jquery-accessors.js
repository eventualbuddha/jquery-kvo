(function($) {
  function JavaScriptAccessorBuilder() {
    this.getter = function(name, fn) {
      this.object.__defineGetter__(name, fn);
    };
    
    this.setter = function(name, fn) {
      this.object.__defineSetter__(name, fn);
    };
    
    this.define = function(name, fn) {
      this.object[name] = fn;
    };
    
    this.build = function(fn) {
      this.object = {};
      fn.call(this, this.object);
      return this.object;
    };
  }
  
  var JavaScriptAccessorBuilderInstance = new JavaScriptAccessorBuilder();
  
  function VBScriptAccessorBuilderWrapper() {
    this.getter = function(name, fn) {
      this.builder.getter(name, fn);
    };
    
    this.setter = function(name, fn) {
      this.builder.setter(name, fn);
    };
    
    this.define = function(name, fn, argc) {
      if (argc === null || argc === undefined) {
        var match = fn.toString().match(/^function\s*\(([^\)]+)/);
        if (!match) {
          argc = 0;
        } else {
          argc = match[1].split(',').length;
        }
      }
      this.builder.define(name, fn, argc);
    };
    
    this.build = function(fn) {
      var self = this;
      return VBScriptAccessorBuilderInstance.build(function() {
        self.builder = this;
        fn.call(self);
      });
    };
  }
  
  var VBScriptAccessorBuilderWrapperInstance = new VBScriptAccessorBuilderWrapper();
  
  $.accessors = {
    hasJavaScriptAccessors: function() {
      return $.isFunction(Object.prototype.__defineGetter__);
    }, 
    
    buildJavaScript: function(fn) {
      return JavaScriptAccessorBuilderInstance.build(fn);
    }, 
    
    hasVBScriptAccessors: function() {
      return !!window.VBScriptAccessorBuilderInstance;
    }, 
    
    buildVBScript: function(fn) {
      return VBScriptAccessorBuilderWrapperInstance.build(fn);
    }, 
    
    build: function(fn) {
      if ($.accessors.hasJavaScriptAccessors())
        return $.accessors.buildJavaScript(fn);
      else if ($.accessors.hasVBScriptAccessors())
        return $.accessors.buildVBScript(fn);
      else
        throw new Error("This browser does not support accessors");
    }
  };
})(jQuery);

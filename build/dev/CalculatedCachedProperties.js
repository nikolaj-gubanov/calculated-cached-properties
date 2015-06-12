/**
* calculated-cached-properties https://github.com/anodynos/calculated-cached-properties
*
* CalculatedCachedProperties allows properties to have values calculated by a function, and then cached. You can then manually invalidate the cache for one or more (or all) properties, forcing the function to invoked and recalculate next time the property is accessed. You can also set the value of property manually. Undefined / null etc are all valid property values. Works with POJSOs, JS constructors and CoffeeScript classes (i.e `MyClass extends CalculatedCachedProperties`). A spinoff from uBerscore library. Docs will follow, see the specs till then :-)
* Version 0.1.1 - Compiled on 2015-06-12 11:01:51
* Repository git://github.com/anodynos/calculated-cached-properties
* Copyright(c) 2015 Angelos Pikoulas <agelos.pikoulas@gmail.com>
* License MIT http://www.opensource.org/licenses/mit-license.php
*/

// Generated by uRequire v0.7.0-beta.16 target: 'dev' template: 'UMDplain'
(function () {
  
var __isAMD = !!(typeof define === 'function' && define.amd),
    __isNode = (typeof exports === 'object'),
    __isWeb = !__isNode;
(function (factory) {
  var rootExport = function (root, __umodule__) {
  if (!__isAMD && !__isNode) {root['CalculatedCachedProperties'] = __umodule__;

}return __umodule__;
};
if (typeof exports === 'object') {
    module.exports = rootExport(global, factory(require, exports, module));
} else if (typeof define === 'function' && define.amd) { define(['require', 'exports', 'module'], function (require, exports, module) {
  return rootExport(window, factory(require, exports, module));
}); } else {
var _require = function(modyle){
  throw new Error("uRequire: Loading UMD module as <script>, failed to `require('" + modyle + "')`: reason unexpected !");
}, _exports = {}, _module = {exports: _exports};
rootExport(window, factory(_require, _exports, _module));;
}
}).call(this, function (require, exports, module) {
  

var l = console; l.deb = l.log

var CalculatedCachedProperties, _, __slice = [].slice;
_ = {
  extend: function (target, source) {
    var key;
    for (key in source) {
      target[key] = source[key];
    }
  },
  keys: function (obj) {
    var key, _results;
    _results = [];
    for (key in obj) {
      _results.push(key);
    }
    return _results;
  },
  isFunction: function (funct) {
    return typeof funct === "function";
  }
};
CalculatedCachedProperties = function () {
  var cUndefined, cacheKey, prefix;
  prefix = function (prop) {
    return "__$$" + prop + "__$$";
  };
  cacheKey = prefix("cache");
  cUndefined = { "cUndefined": true };
  CalculatedCachedProperties.register = function (pojsoOrConstructor, calcProperties, isOverwrite) {
    var classConstructor, ctor, pojso;
    if (_.isFunction(pojsoOrConstructor)) {
      classConstructor = pojsoOrConstructor;
      _.extend(classConstructor.prototype, CalculatedCachedProperties.prototype);
      _.extend(classConstructor.calcProperties || (classConstructor.calcProperties = {}), calcProperties);
      classConstructor.prototype.defineCalcProperties();
    } else {
      pojso = pojsoOrConstructor;
      _.extend(pojso.__proto__ = {}, CalculatedCachedProperties.prototype);
      pojso.constructor = ctor = function () {
      };
      ctor.prototype = pojso.__proto__;
      _.extend(ctor.prototype, CalculatedCachedProperties.prototype);
      _.extend(ctor.calcProperties || (ctor.calcProperties = {}), calcProperties);
      pojso.defineCalcProperties(isOverwrite);
    }
    return pojsoOrConstructor;
  };
  CalculatedCachedProperties.prototype.getClasses = function (instOrClass, _classes) {
    if (_classes == null) {
      _classes = [];
    }
    if (!instOrClass) {
      instOrClass = this;
    }
    if (!_.isFunction(instOrClass)) {
      instOrClass = instOrClass.constructor;
    }
    _classes.unshift(instOrClass);
    if (instOrClass.__super__) {
      return this.getClasses(instOrClass.__super__.constructor, _classes);
    } else {
      return _classes;
    }
  };
  CalculatedCachedProperties.getClasses = CalculatedCachedProperties.prototype.getClasses;
  CalculatedCachedProperties.prototype.getAllCalcProperties = function (instOrClass) {
    var aClass, cFunct, cProp, calcProps, _i, _len, _ref, _ref1;
    if (instOrClass == null) {
      instOrClass = this;
    }
    calcProps = {};
    _ref = this.getClasses(instOrClass);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      aClass = _ref[_i];
      _ref1 = aClass.calcProperties;
      for (cProp in _ref1) {
        cFunct = _ref1[cProp];
        calcProps[cProp] = cFunct;
      }
    }
    return calcProps;
  };
  CalculatedCachedProperties.getAllCalcProperties = CalculatedCachedProperties.prototype.getAllCalcProperties;
  Object.defineProperties(CalculatedCachedProperties.prototype, {
    allCalcProperties: {
      get: function () {
        if (!this.constructor.prototype.hasOwnProperty("_allCalcProperties")) {
          Object.defineProperty(this.constructor.prototype, "_allCalcProperties", {
            value: this.getAllCalcProperties(),
            enumerable: false
          });
        }
        return this.constructor.prototype._allCalcProperties;
      }
    },
    classes: {
      get: function () {
        if (!this.constructor.prototype.hasOwnProperty("_classes")) {
          Object.defineProperty(this.constructor.prototype, "_classes", {
            value: this.getClasses(),
            enumerable: false
          });
        }
        return this.constructor.prototype._classes;
      }
    }
  });
  function CalculatedCachedProperties() {
    this.defineCalcProperties();
  }
  CalculatedCachedProperties.prototype.initCache = function () {
    var cPropFn, cPropName, _ref;
    l.deb("CalculatedCachedProperties: Initializing cache for calculated properties of constructor named `" + this.constructor.name + "`");
    Object.defineProperty(this, cacheKey, {
      value: {},
      enumerable: true,
      configurable: false,
      writeable: false
    });
    _ref = this.allCalcProperties || this.getAllCalcProperties();
    for (cPropName in _ref) {
      cPropFn = _ref[cPropName];
      this[cacheKey][cPropName] = cUndefined;
    }
  };
  CalculatedCachedProperties.prototype.defineCalcProperties = function (isOverwrite) {
    var cPropFn, cPropName, _ref;
    _ref = this.allCalcProperties || this.getAllCalcProperties();
    for (cPropName in _ref) {
      cPropFn = _ref[cPropName];
      if (!this.constructor.prototype.hasOwnProperty(cPropName) || isOverwrite) {
        (function (_this) {
          return function (cPropName, cPropFn) {
            l.deb("CalculatedCachedProperties: DEFINE calculated property " + _this.constructor.name + "." + cPropName);
            return Object.defineProperty(_this.constructor.prototype, cPropName, {
              enumerable: true,
              configurable: true,
              get: function () {
                if (!this[cacheKey]) {
                  this.initCache();
                }
                l.deb("CalculatedCachedProperties: GET value of calculated property " + this.constructor.name + "." + cPropName);
                if (this[cacheKey][cPropName] === cUndefined) {
                  l.deb("CalculatedCachedProperties: CALCULATING & CACHING property " + this.constructor.name + "." + cPropName);
                  this[cacheKey][cPropName] = cPropFn.call(this);
                }
                return this[cacheKey][cPropName];
              },
              set: function (v) {
                if (!this[cacheKey]) {
                  this.initCache();
                }
                l.deb("CalculatedCachedProperties: SET value of property " + this.constructor.name + "." + cPropName);
                return this[cacheKey][cPropName] = v;
              }
            });
          };
        }(this)(cPropName, cPropFn));
      }
    }
    return null;
  };
  CalculatedCachedProperties.prototype.cleanProps = function () {
    var ca, cleanArgs, cleaned, p, propKeys, _i, _j, _len, _len1;
    cleanArgs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (cleanArgs.length === 0) {
      cleanArgs = _.keys(this.allCalcProperties || this.getAllCalcProperties());
    }
    cleaned = [];
    for (_i = 0, _len = cleanArgs.length; _i < _len; _i++) {
      ca = cleanArgs[_i];
      if (ca) {
        if (_.isFunction(ca)) {
          if (!propKeys) {
            propKeys = _.keys(this.allCalcProperties || this.getAllCalcProperties());
          }
          for (_j = 0, _len1 = propKeys.length; _j < _len1; _j++) {
            p = propKeys[_j];
            if (ca(p)) {
              if (this[cacheKey][p] !== cUndefined) {
                l.deb("CalculatedCachedProperties: CLEAR (via function) value of property " + this.constructor.name + "." + p);
                this[cacheKey][p] = cUndefined;
                cleaned.push(p);
              }
            }
          }
        } else {
          if (this[cacheKey][ca] !== cUndefined) {
            l.deb("CalculatedCachedProperties: CLEAR value of property " + this.constructor.name + "." + ca);
            this[cacheKey][ca] = cUndefined;
            cleaned.push(ca);
          }
        }
      }
    }
    return cleaned;
  };
  return CalculatedCachedProperties;
}();
module.exports = CalculatedCachedProperties;

return module.exports;

});
}).call(this);
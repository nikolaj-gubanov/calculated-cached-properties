(urequire: rootExports: 'CCP')

define ->

  # Instances have calculated *cached* properties.
  # Properties are calculated on 1st use, use the cache thereafter.
  # Properties can be cleaned with cleanProp (String|Function)...
  class CalculatedCachedProperties

    prefix = (prop)-> '__$$' + prop + '__$$'
    cacheKey = prefix 'cache'
    cUndefined = {'cUndefined':true} # allow undefined as a valid cached value - store this instead of deleting key


    # Gets all coffeescript classes (i.e constructors linked via __super__) of given obj, constructor or target instance.
    # If called on an instance without params, it gets all inherited classes for this instance (including its own class).
    #
    # @param instOrClass {Object|class} optional
    #   If an object instance is passed, we get all the classes that its constructor is extending (including its own class)
    #   If a constructor Function (i.e coffeeScript class) is passed, we again get all classes it is extending.
    #
    #   It can be called without `instOrClass` param, in which case it is initialized to `this`, which means:
    #     * the instance if the target is an instance (i.e `myinstance.getClasses()`
    #     * the class if its called statically on the class (i.e `MyClass.getClasses()`)
    #
    # @return Array<Function> of coffeescript classes (i.e `constructor`s) of given object or class/constuctor.
    #    Order is descending i.e Base class is first, followed by all subclasses, the last one being the given constructor / current instance's class.
    getClasses: (instOrClass, _classes=[])->
      instOrClass = @ if not instOrClass

      if (typeof instOrClass) isnt 'function'
        instOrClass = instOrClass.constructor

      _classes.unshift instOrClass
      if instOrClass.__super__
        @getClasses instOrClass.__super__.constructor, _classes
      else
        _classes

    @getClasses: @::getClasses


    # @return Object with {calcPropertyName:calcPropertyFunction} of all (inherited) calcProperties.
    # Properties in subclasses override (overwrite) those os super classes.
    getAllCalcProperties: (instOrClass=@)->
      calcProps = {}
      for aClass in @getClasses(instOrClass)
        for cProp, cFunct of aClass.calcProperties
          calcProps[cProp] = cFunct # overwrite inherited properties with subclass's properties
      calcProps

    @getAllCalcProperties: @::getAllCalcProperties

    Object.defineProperties @::,
      allCalcProperties: get:->
        if not @constructor::hasOwnProperty '_allCalcProperties' # use cached result, shared by all instances
          Object.defineProperty @constructor::, '_allCalcProperties', value: @getAllCalcProperties(), enumerable: false
        @constructor::_allCalcProperties

      classes: get:->
        if not @constructor::hasOwnProperty '_classes' # use cached result, shared by all instances
          Object.defineProperty @constructor::, '_classes', value: @getClasses(), enumerable: false
        @constructor::_classes

    constructor: -> @defineCalcProperties()

    defineCalcProperties: (isOverwrite)->
      Object.defineProperty @, cacheKey, value: {}, enumerable: false, configurable: false, writeable: false
      for cPropName, cPropFn of @allCalcProperties
        @[cacheKey][cPropName] = cUndefined
        if not @constructor::hasOwnProperty(cPropName) or isOverwrite
          do (cPropName, cPropFn)=>
            l.deb "...defining calculated property #{@constructor.name}.#{cPropName}"
            Object.defineProperty @constructor::, cPropName, # @todo: allow instance properties to be added dynamically
              enumerable: true
              configurable: true # @todo: check if its not same class and redefine ?
              get:->
                l.deb "...requesting calculated property #{@constructor.name}.#{cPropName}"
                if @[cacheKey][cPropName] is cUndefined
                  l.deb "...refreshing calculated property #{@constructor.name}.#{cPropName}" # and cPropName isnt 'dstFilenames'
                  @[cacheKey][cPropName] = cPropFn.call @
                @[cacheKey][cPropName]

              set: (v)-> @[cacheKey][cPropName] = v
      null

    # use as cleanProps 'propName1', ((p)-> p is 'propName2'), undefined, 'propName3'
    # or cleanProps() to clear them all
    # undefined args are ignored
    cleanProps: (cleanArgs...)->
      cleanArgs = _.keys(@allCalcProperties) if _.isEmpty cleanArgs
      cleaned = []
      for ca in cleanArgs when ca
        if _.isFunction ca
          propKeys = _.keys @allCalcProperties if not propKeys # `propKeys or=` can't be assigned with ||= because it has not been declared before
          for p in propKeys when ca(p)
            if @[cacheKey][p] isnt cUndefined
              l.deb "...delete (via fn) value of property #{@constructor.name}.#{p}"
              @[cacheKey][p] = cUndefined
              cleaned.push p
        else # should be string-able
          if @[cacheKey][ca] isnt cUndefined
            l.deb "...delete value of property #{@constructor.name}.#{ca}"
            @[cacheKey][ca] = cUndefined
            cleaned.push ca
      cleaned
module.exports = (grunt)->
  gruntConfig =
    urequire:
      _all:
        dependencies:
          imports: lodash: ['_']
          paths: bower: true
          shim: true
        template: banner: true
        clean: true
#        debugLevel: 10

      _defaults: # for lib
        main: 'CalculatedCachedProperties'
        path: 'source/code'
        resources: [ 'inject-version' ]
        runtimeInfo: false
        noLoaderUMD: true
        warnNoLoaderUMD: false
        template: name: 'UMDplain'

      dev:
        dstPath: 'build/dev'
        resources: [[ '+add:Logger', [/./], (m)-> m.beforeBody = "var l = console; l.deb = l.log" ]]

      min:
        dstPath: 'build/min'
        optimize: true # 'uglify2'
        resources: [
          [ '+remove:debug', [/./]
            (m)-> m.replaceCode c for c in ['l.deb()', 'if (l.deb()){}' ]]

          ['%save with different name', ['CalculatedCachedProperties.js'],
           (m)->
              m.dstFilename = 'CalculatedCachedProperties-min.js' # save under this name
              m.converted # return m.converted, leaving file content to be saved as is
          ]
        ]

      spec:
        derive: [] # from none
        path: 'source/spec'
        dstPath: 'build/spec'
        dependencies: imports:
          'calculated-cached-properties': ['CCP']
          chai: 'chai'
          'uberscore': ['_B']
          specHelpers: 'spH'
        resources: [
          ['import-keys',
            specHelpers: """
              equal, notEqual, ok, notOk, tru, fals, deepEqual, notDeepEqual, exact, notExact, iqual,
              notIqual, ixact, notIxact, like, notLike, likeBA, notLikeBA, equalSet, notEqualSet"""
            chai: 'expect' ]

          [ '+inject-_B.logger', ['**/*.js'],
            (m)-> m.beforeBody = "var l = new _B.Logger('#{m.dstFilename}');"]
        ]
        afterBuild: require('urequire-ab-specrunner').options
          injectCode: testNoConflict = "window._B = 'Old global `_B`'; //test `noConflict()`"

      specDev:
        derive: ['spec']
        dstPath: 'build/spec_combied/index-combined.js'
        template: name: 'combined'

      specWatch:
        derive: ['spec']
        afterBuild: [[null], require('urequire-ab-specrunner').options
          injectCode: testNoConflict
          mochaOptions: '-R dot'
          specRunners: ['mocha-cli']
          watch: 1439
        ]

  splitTasks = (tasks)-> if (tasks instanceof Array) then tasks else tasks.split(/\s/).filter((f)->!!f)
  grunt.registerTask shortCut, "urequire:#{shortCut}" for shortCut of gruntConfig.urequire
  grunt.registerTask shortCut, splitTasks tasks for shortCut, tasks of {
    default: 'dev spec' # always in pairs of `lib spec`
    release: 'dev specDev min specDev'
    develop: 'dev specWatch'
  }
  grunt.loadNpmTasks task for task of grunt.file.readJSON('package.json').devDependencies when task.lastIndexOf('grunt-', 0) is 0
  grunt.initConfig gruntConfig
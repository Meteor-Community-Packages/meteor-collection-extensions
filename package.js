/* eslint-env meteor */
const VERSION_NUMBER = '1.0.0-rc.0'

Package.describe({
  name: 'lai:collection-extensions',
  version: VERSION_NUMBER,
  // Brief, one-line summary of the package.
  summary: 'Safely and easily extend the Mongo.Collection constructor with custom functionality.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/rclai/meteor-collection-extensions.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse = Package.onUse || Package.on_use // backwards-compat
Package.onTest = Package.onTest || Package.on_test // backwards-compat

Package.onUse(function (api) {
  api.addFiles = api.addFiles || api.add_files // backwards-compat

  if (api.versionsFrom) { // 0.9.3+ litmus test
    api.versionsFrom(['2.8', '3.0.0-alpha.19'])

    api.use([
      'ecmascript',
      'mongo',
      'tracker'
    ])
  } else {
    api.use([
      'mongo-livedata',
      'deps'
    ])
  }

  api.use([
    'minimongo'
  ])

  api.use(['accounts-base'], ['client', 'server'], { weak: true })

  api.addFiles([
    'collection-extensions.js'
  ])

  api.export('CollectionExtensions')
})

Package.onTest(function (api) {
  api.use([
    'ecmascript',
    'accounts-base',
    'meteortesting:mocha',
    'tracker',
    'mongo',
    'underscore',
    'matb33:collection-hooks@1.1.0',
    'aldeed:collection2@3.0.0',
    'ongoworks:security@1.0.1',
    'cfs:standard-packages@0.5.3',
    'dburles:mongo-collection-instances@0.3.5',
    'lai:document-methods@0.1.4',
    'cfs:gridfs@0.0.34',
    'coffeescript',
    'lai:collection-extensions'
  ])
  api.use('lai:document-methods')
  api.addFiles([
    'tests/functions.js',
    'tests/tests.js',
    'tests/tests.coffee'
  ])
})

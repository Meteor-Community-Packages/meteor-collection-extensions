/* eslint-env meteor */

Package.describe({
  name: 'lai:collection-extensions',
  version: '1.0.0-beta300.0',
  // Brief, one-line summary of the package.
  summary: 'Safely and easily extend the Mongo.Collection constructor with custom functionality.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/rclai/meteor-collection-extensions.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.addFiles = api.addFiles || api.add_files // backwards-compat
  api.versionsFrom(['2.3', '3.0-beta.0'])

  api.use([
    'ecmascript@0.16.8-beta300.0',
    'mongo@2.0.0-beta300.0',
    'tracker',
    'minimongo'
  ])

  api.use(['accounts-base'], ['client', 'server'], { weak: true })

  api.addFiles([
    'collection-extensions.js'
  ])

  api.export('CollectionExtensions')
})

Package.onTest(function (api) {
  api.use('aldeed:collection2')
  api.use([
    'ecmascript',
    'accounts-base',
    'meteortesting:mocha@3.0.0-beta300.0',
    'tracker',
    'mongo',
    'underscore',
    'matb33:collection-hooks@1.1.0',
    // 'ongoworks:security@1.0.1',
    'cfs:standard-packages',
    'dburles:mongo-collection-instances@1.0.0-beta300.0',
    'cfs:gridfs',
    'coffeescript',
    'lai:collection-extensions@1.0.0-beta300.0'
  ])
  api.addFiles([
    'tests/functions.js',
    'tests/tests.js',
    'tests/tests.coffee'
  ])
})

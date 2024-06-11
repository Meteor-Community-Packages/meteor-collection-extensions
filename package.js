/* eslint-env meteor */

Package.describe({
  name: 'lai:collection-extensions',
  version: '1.0.0-rc300.0',
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
  api.versionsFrom(['2.8.0', '3.0-rc.2'])

  api.use([
    'ecmascript',
    'mongo'
  ])

  api.use(['accounts-base'], ['client', 'server'], { weak: true })

  api.mainModule('collection-extensions.js')
})

Package.onTest(function (api) {
  api.use([
    'ecmascript',
    'coffeescript',
    'accounts-base',
    'tracker',
    'mongo',
    'underscore',
    'aldeed:collection2@3.0.0 || 4.0.0',
    'aldeed:simple-schema@2.0.0-rc300.0 || 1.13.1',
    'meteortesting:mocha@3.1.0-rc.0',
    'meteortesting:browser-tests@1.6.0-rc300.0',
    // 'matb33:collection-hooks@1.4.0-beta300.0',
    // 'ongoworks:security@1.0.1',
    // 'cfs:standard-packages',
    // 'cfs:gridfs',
    'dburles:mongo-collection-instances@1.0.0-rc300.0',
    'lai:collection-extensions@1.0.0-beta300.2'
  ])
  api.addFiles([
    'tests/functions.js',
    'tests/tests.js',
    'tests/tests.coffee'
  ])
})

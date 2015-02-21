Package.describe({
  name: 'lai:collection-extensions',
  version: '0.0.7',
  // Brief, one-line summary of the package.
  summary: 'Safely and easily extend the Mongo.Collection constructor with custom functionality.',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/rclai/meteor-collection-extensions.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse = Package.onUse || Package.on_use;    // backwards-compat
Package.onTest = Package.onTest || Package.on_test; // backwards-compat

Package.onUse(function (api) {
  api.addFiles = api.addFiles || api.add_files;     // backwards-compat
  
  if (api.versionsFrom) { // 0.9.3+ litmus test
    api.versionsFrom('0.9.3');

    api.use([
      'mongo',
      'tracker'
    ]);
  } else {
    api.use([
      'mongo-livedata',
      'deps'
    ]);
  }

  api.use([
    'check',
    'minimongo'
  ]);

  api.use(['accounts-base'], ['client', 'server'], { weak: true });
  
  api.addFiles('collection-extensions.js');
});

/*
Package.onTest(function (api) {
  api.use('tinytest');
  api.use('lai:mongo-constructor-wrapper');
  api.addFiles('lai:mongo-constructor-wrapper-tests.js');
});
*/
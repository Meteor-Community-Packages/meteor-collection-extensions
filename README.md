## Meteor Collection Extensions

[![Meteor Community Package](https://img.shields.io/badge/Meteor-Package-green?logo=meteor&logoColor=white)](https://meteor.com)
[![Test suite](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/testsuite.yml/badge.svg)](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/testsuite.yml)
[![CodeQL](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/github-code-scanning/codeql)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


This package gives you utility functions to extend your `Mongo.Collection` instances in (hopefully) the safest, 
easiest and coolest way. If you want to create a package that monkey-patches the `Mongo.Collection` constructor, you'll need this package. I am striving for this package to be a third-party official way of monkey-patching `Mongo.Collection` until, well, Meteor decides to create a core functionality to properly extend it.

If you'd like to contribute check out the [Hackpad](https://hackpad.com/rdqGCTPoZ8F) discussion.

## Installation

```
meteor add lai:collection-extensions
```

## Why

Meteor gives you no easy way to extend the `Mongo.Collection` object, and therefore 
package publishers who want to extend its functionality resort 
to monkey-patching the `Mongo.Collection` constructor, and sometimes it's not done right. This package seeks to centralize one well-done monkey-patch with the ability to hook into the constructor as many times as possible. See my code.

I am hoping for all collection-extending package authors to to use this to end the package compatibility issues. In order for this to happen, I will fork major packages like `matb33:collection-hooks`, `sewdn:collection-behaviours` and refactor the code to use this utility package, and run their test suites. If you want to help, that would be awesome.

## API

#### CollectionExtensions.addExtension(fn ([name, options]) {})

Pass in a function where the arguments are the same as that of when instantiating `Mongo.Collection`. In addition, you may access the collection instance by using `this`. __Very Important:__ You need to make sure your extensions are added before you instantiate your `Mongo.Collection`s or your extensions will not work. Most likely you will only use this when building a custom package.

#### CollectionExtensions.addPrototype(name, fn (...) {})

Pass in the name of the prototype function as well as the function. Yes, I know you can simply just do `Mongo.Collection.prototype.myPrototypeFunction = function (...) {}`, which is fine. One of the things that this function does differently is to check whether you're in an older version of Meteor, in which `Mongo.Collection` doesn't exist but rather `Meteor.Collection` does. __Note:__ If you are a package author that adds/modifies prototypes on the `Mongo.Collection`, this is not so critical for you to use unless you really want backwards-compatibility.

## Usage

The following code recreates [this section of code](https://github.com/dburles/mongo-collection-instances/blob/master/mongo-instances.js#L2-L17) of the `dburles:mongo-collection-instances` using `CollectionExtensions.addExtension(fn)` thereby eliminating the need to monkey-patch the `Mongo.Collection` constructor:

```js
const instances = [];

CollectionExtensions.addExtension((name, options) => {
  instances.push({
    name: name,
    instance: inst,
    options: options
  });
});
```

The following code recreates the entire [`dburles:collection-helpers`](https://github.com/dburles/meteor-collection-helpers/blob/master/collection-helpers.js) package using `CollectionExtensions.addPrototype(name, fn)`:

```js
const Document = {};

CollectionExtensions.addPrototype('helpers', (helpers) => {
  const self = this;

  if (self._transform && ! self._hasCollectionHelpers)
    throw new Meteor.Error(`Can't apply helpers to '${self._name}', a transform function already exists!`);

  if (! self._hasCollectionHelpers) {
    Document[self._name] = doc => Object.assign(this, doc);
    self._transform = doc => new Document[self._name](doc);
    self._hasCollectionHelpers = true;
  }
  
  Object.entries(helper).forEach(([key, helper]) => {
    Document[self._name].prototype[key] = helper;
  });
});
```

## Todo

Integrate this package into the following packages and test them:

* [x] [`matb33:collection-hooks`](https://github.com/matb33/meteor-collection-hooks/) ([Refactored and tested with 100% success](https://github.com/rclai/meteor-collection-hooks/tree/collection-extensions))
* [x] [`dburles:mongo-collection-instances`](https://github.com/dburles/mongo-collection-instances) ([Refactored and tested with 100% success](https://github.com/rclai/mongo-collection-instances/tree/collection-extensions)) ([Now merged into master!](https://github.com/dburles/mongo-collection-instances/commit/7f90911b6a7117cfc62e40b200a0437ea9fb5961))
* [ ] [`sewdn:collection-behaviours`](https://github.com/Sewdn/meteor-collection-behaviours/) (He didn't write tests but [here's the forked refactor](https://github.com/rclai/meteor-collection-behaviours/tree/collection-extensions) anyway in case you wanted to test)

Create tests.

## Contributing

If you are interested in using this package in your package, or if you want me to test (or if YOU want to test it yourself) integrating this into your package let me know and I will add it to the Todo list.

Feedback is welcome.

## Future

Add control over the execution order of each collection extension somehow.
Track collection instances that were prematurely instantiated and apply extensions on demand.
Get Travis CI installed.

## License

MIT, See [license file](./LICENSE)

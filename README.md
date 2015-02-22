## Meteor Collection Extensions

This package gives you utility functions to extend your `Mongo.Collection` instances in (hopefully) the safest, 
easiest and coolest way. If you want to create a package that extends `Mongo.Collection`, you'll need this package. I am striving for this package to be a third-party official way of extending `Mongo.Collection` until, well, Meteor decides to create a core functionality to extend it.

__This is currently alpha!__

## Installation

```
meteor add lai:collection-extensions
```

## Why

Meteor gives you no easy way to extend the `Mongo.Collection` object, and therefore 
package publishers who want to extend its functionality resort 
to monkey-patching the `Mongo.Collection` constructor, and sometimes it's not done right. This package seeks to centralize one well-done monkey-patch with the ability to hook into the constructor as many times as possible. See my code.

I am hoping for all collection-extending package authors to to use this to end the package compatibility issues. In order for this to happen, I will fork major packages like `matb33:collection-hooks`, `ongoworks:security`, `dburles:collection-instances`,
 refactor the code to use this utility package, and run their test suites. If you want to help, that would be awesome.

## API

#### Meteor.addCollectionExtension(fn (instance [, instantiationArguments]) {})

Pass in a function that takes 1 required argument and an optional second that holds the `Mongo.Collection` instantiation arguments.__Very Important:__ You need to make sure your extensions are added before you instantiate your `Mongo.Collection`s or your extensions will not work.

#### Meteor.addCollectionPrototype(name, fn (...) {})

Pass in the name of the prototype function as well as the function. Yes, I know you can simply just do `Mongo.Collection.prototype.myPrototypeFunction = function (...) {}`, which is fine. One of the things that this function does differently is to check whether you're in an older version of Meteor, in which `Mongo.Collection` doesn't exist but rather `Meteor.Collection` does.

## Usage

The following code recreates [this section of code](https://github.com/dburles/mongo-collection-instances/blob/master/mongo-instances.js#L4-L12) of the `dburles:collection-instances` using `Meteor.addCollectionExtension(fn)` thereby eliminating the need to monkey-patch the `Mongo.Collection` constructor:

```js
var instances = [];

Meteor.addCollectionExtension(function (inst, args) {
  instances.push({
    name: inst._name,
    instance: inst,
    options: args[1]
  });
});
```

The following code recreates the entire [`dburles:collection-helpers`](https://github.com/dburles/meteor-collection-helpers/blob/master/collection-helpers.js) package using `Meteor.addCollectionPrototype(name, fn)`:

```js
var Document = {};

Meteor.addCollectionPrototype('helpers', function (helpers) {
  var self = this;

  if (self._transform && ! self._hasCollectionHelpers)
    throw new Meteor.Error("Can't apply helpers to '" +
      self._name + "' a transform function already exists!");

  if (! self._hasCollectionHelpers) {
    Document[self._name] = function(doc) { return _.extend(this, doc); };
    self._transform = function(doc) { return new Document[self._name](doc); };
    self._hasCollectionHelpers = true;
  }
  
  _.each(helpers, function(helper, key) {
    Document[self._name].prototype[key] = helper;
  });
});
```

## Todo

Integrate this package into the following packages and test them:

* [ ] [`matb33:collection-hooks`](https://github.com/matb33/meteor-collection-hooks/)
* [ ] [`dburles:collection-instances`](https://github.com/dburles/mongo-collection-instances)
* [ ] [`ongoworks:security`](https://github.com/ongoworks/meteor-security)
* [ ] [`sewdn:collection-behaviours`](https://github.com/Sewdn/meteor-collection-behaviours/)

Create tests.

## Contributing

If you are interested in using this package in your package, or if you want me to test (or if YOU want to test it yourself) integrating this into your package let me know and I will add it to the Todo list.

Feedback is welcome.

## Future

Add control over the execution order of each collection extension somehow.

## License

MIT
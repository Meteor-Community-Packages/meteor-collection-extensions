## Meteor Collection Extensions

[![Meteor Community Package](https://img.shields.io/badge/Meteor-Package-green?logo=meteor&logoColor=white)](https://meteor.com)
[![Test suite](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/testsuite.yml/badge.svg)](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/testsuite.yml)
[![CodeQL](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/Meteor-Community-Packages/meteor-collection-extensions/actions/workflows/github-code-scanning/codeql)
[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


This package gives you utility functions to extend your `Mongo.Collection` instances in (hopefully) the safest, 
easiest and coolest way.
If you want to create a package that monkey-patches the `Mongo.Collection` constructor, you'll need this package. I am striving for this package to be a third-party official way of monkey-patching `Mongo.Collection` until, 
well, Meteor decides to create a core functionality to properly extend it.

## Breaking changes in 1.0.0, please keep reading!

- Starting with v. 1.0.0, this package requires Meteor >= 3.0!
- The module needs to be imported **explicitly**, it's not a global anymore!
- All extensions will have to use `collection` as first param, instead of `this`:

```js
import { CollectionExtensions } from './collection-extensions'

CollectionExtensions.addExtension(async (collection, name, options) => {
  // ... your extension code
})
```

> This implies extensions have to be updated accordingly

Furthermore, **extensions may not be applied immediately**.
This is, since extensions are applied during the call of the `Mongo.Collection`
constructor. However, constructors [cannot be async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor#syntax).
We can't therefore be sure, when (async) extensions have been applied, without using a callback:

```js
const extensions = {
  onComplete: () => {},
  onError: e => console.error(e)
}
// exentsions options will not be passed to
// the original collection constructor!
const MyDocs = new Mongo.Collection('myDocs', { extensions })
```

This is unfortunate, but a tradeoff between determinism and
compatibility.

- `addProperty` now uses `Object.definedProperty` under the hood
  and allows to pass in property descriptors as third argument, while
  the function is always required

### Background info

With the changes of Meteor 3.0 moving to full async,
we now have to resolve the Promises, returned by
Mongo.Collection methods (`insertAsync` etc.).


## Installation

```
meteor add lai:collection-extensions
```

## Why

Meteor gives you no easy way to extend the `Mongo.Collection` object, and therefore 
package publishers who want to extend its functionality resort 
to monkey-patching the `Mongo.Collection` constructor, and sometimes it's not done right. This package seeks to centralize one well-done monkey-patch with the ability to hook into the constructor as many times as possible. See my code.

I am hoping for all collection-extending package authors to to use this to end the package compatibility issues. In order for this to happen, I will fork major packages like `matb33:collection-hooks`, `sewdn:collection-behaviours` and refactor the code to use this utility package, and run their test suites.
If you want to help, that would be awesome.

## API

#### CollectionExtensions.addExtension(async fn ([collection, name, options]) {})

Pass in a (async or standard) function where the arguments are the same as that of when instantiating `Mongo.Collection`. 
In addition, you may access the collection instance by using `this`.

__Very Important:__ You need to make sure your extensions are added before you instantiate your `Mongo.Collection`s or your extensions will not work. Most likely you will only use this when building a custom package.

#### CollectionExtensions.addPrototype(name, fn (...) {})

Pass in the name of the prototype function as well as the function. Yes, I know you can simply just do `Mongo.Collection.prototype.myPrototypeFunction = function (...) {}`, which is fine. One of the things that this function does differently is to check whether you're in an older version of Meteor, in which `Mongo.Collection` doesn't exist but rather `Meteor.Collection` does. __Note:__ If you are a package author that adds/modifies prototypes on the `Mongo.Collection`, this is not so critical for you to use unless you really want backwards-compatibility.

## Examples

The following code recreates [this section of code](https://github.com/dburles/mongo-collection-instances/blob/master/mongo-instances.js#L2-L17) of the `dburles:mongo-collection-instances` using `CollectionExtensions.addExtension(fn)` thereby eliminating the need to monkey-patch the `Mongo.Collection` constructor:

```js
import {CollectionExtensions } from 'meteor/lai:collection-extensions'

const instances = [];

CollectionExtensions.addExtension((collection, name, options) => {
  instances.push({
    name: name,
    instance: collection,
    options: options
  });
});
```

The following code overrides `ìnsert` to use `insertAsync` under the hood.

```js
import {CollectionExtensions } from 'meteor/lai:collection-extensions'

CollectionExtensions.addPrototype('insert', async function (doc) {
  return this.insertAsync(doc)
})
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

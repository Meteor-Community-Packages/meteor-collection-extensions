/* global CollectionExtensions */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

// The collection extensions namespace
CollectionExtensions = {} // eslint-disable-line no-global-assign

// Stores all the collection extensions
CollectionExtensions._extensions = []

// This is where you would add custom functionality to
// Mongo.Collection/Meteor.Collection
CollectionExtensions.addExtension = function (customFunction) {
  if (typeof customFunction !== 'function') {
    throw new Meteor.Error(
      'collection-extension-wrong-argument',
      'You must pass a function into CollectionExtensions.addExtension().')
  }
  CollectionExtensions._extensions.push(customFunction)
  // If Meteor.users exists, apply the extension right away
  if (typeof Meteor.users !== 'undefined') {
    customFunction.apply(Meteor.users, ['users'])
  }
}

// Backwards compatibility
Meteor.addCollectionExtension = function () {
  console.warn('`Meteor.addCollectionExtension` is deprecated, please use `CollectionExtensions.addExtension`')
  CollectionExtensions.addExtension.apply(null, arguments)
}

// Utility function to add a prototype function to your
// Meteor/Mongo.Collection object
CollectionExtensions.addPrototype = function (name, customFunction) {
  if (typeof name !== 'string') {
    throw new Meteor.Error(
      'collection-extension-wrong-argument',
      'You must pass a string as the first argument into CollectionExtensions.addPrototype().')
  }
  if (typeof customFunction !== 'function') {
    throw new Meteor.Error(
      'collection-extension-wrong-argument',
      'You must pass a function as the second argument into CollectionExtensions.addPrototype().')
  }
  (typeof Mongo !== 'undefined'
    ? Mongo.Collection
    : Meteor.Collection).prototype[name] = customFunction
}

// Backwards compatibility
Meteor.addCollectionPrototype = function () {
  console.warn('`Meteor.addCollectionPrototype` is deprecated, please use `CollectionExtensions.addPrototype`')
  CollectionExtensions.addPrototype.apply(null, arguments)
}

// This is used to reassign the prototype of unfortunately
// and unstoppably already instantiated Mongo instances
// i.e. Meteor.users
function reassignCollectionPrototype (instance, constr) {
  const hasSetPrototypeOf = typeof Object.setPrototypeOf === 'function'

  if (!constr) constr = typeof Mongo !== 'undefined' ? Mongo.Collection : Meteor.Collection

  // __proto__ is not available in < IE11
  // Note: Assigning a prototype dynamically has performance implications
  if (hasSetPrototypeOf) {
    Object.setPrototypeOf(instance, constr.prototype)
  } else if (instance.__proto__) { // eslint-disable-line no-proto
  // eslint-disable-next-line no-proto
    instance.__proto__ = constr.prototype
  }
}

// This monkey-patches the Collection constructor
// This code is the same monkey-patching code
// that matb33:collection-hooks uses, which works pretty nicely
function wrapCollection(ns, as) {
  var constructor = as.Collection;
  var proto = ns.Collection.prototype;

  ns.Collection = function () {
    const ret = constructor.apply(this, arguments)
    // This is where all the collection extensions get processed
    processCollectionExtensions(this, arguments)
    return ret
  }

  ns.Collection.prototype = proto
  ns.Collection.prototype.constructor = ns.Collection

  for (const prop in constructor) {
    if (Object.prototype.hasOwnProperty.call(constructor, prop)) {
      ns.Collection[prop] = constructor[prop]
    }
  }
}

function processCollectionExtensions (self, args) {
  // Using old-school operations for better performance
  // Please don't judge me ;P
  const applyArgs = args ? [].slice.call(args, 0) : undefined
  const extensions = CollectionExtensions._extensions
  for (let i = 0, len = extensions.length; i < len; i++) {
    extensions[i].apply(self, applyArgs)
  }
}

if (typeof Mongo !== 'undefined') {
  wrapCollection(Mongo, Mongo);
  Meteor.Collection = Mongo.Collection;
} else {
  wrapCollection(Meteor, Meteor)
}

if (typeof Meteor.users !== 'undefined') {
  // Ensures that Meteor.users instanceof Mongo.Collection
  reassignCollectionPrototype(Meteor.users)
}

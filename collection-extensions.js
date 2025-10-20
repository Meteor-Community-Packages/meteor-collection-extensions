import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

// The collection extensions namespace
export const CollectionExtensions = {} // eslint-disable-line no-global-assign

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
    applyExtension(Meteor.users, customFunction, ['users'])
      .catch(e => console.error(e))
  }
}

// Utility function to add a prototype function to your
// Meteor/Mongo.Collection object
CollectionExtensions.addPrototype = function (name, customFunction, options = {}) {
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

  const target =
    typeof Mongo !== 'undefined'
      ? Mongo.Collection
      : Meteor.Collection
  const descriptor = {
    value: customFunction,
    configurable: !!options.configurable,
    enumerable: !!options.enumerable,
    writable: !!options.writable
  }
  Object.defineProperty(target.prototype, name, descriptor)
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
function wrapCollection (ns, as) {
  const constructor = as.Collection
  const proto = ns.Collection.prototype

  ns.Collection = function (...args) {
    const collection = this
    const extensions = {
      onError: e => console.error(e),
      onComplete: () => {}
    }

    const extIndex = args.findIndex(entry => entry && typeof entry === 'object' && hasProp(entry, 'extensions'))
    if (extIndex > -1) {
      const options = args[extIndex]
      extensions.onError = options.extensions.onError ?? extensions.onError
      extensions.onComplete = options.extensions.onComplete ?? extensions.onComplete
      delete options.extensions
    }

    const ret = constructor.apply(collection, args)
    // This is where all the collection extensions get processed
    // We can only catch the Promise, since there is no async constructor
    // so we can't await here
    processCollectionExtensions(collection, args)
      .then(() => extensions.onComplete(collection))
      .catch(e => extensions.onError(e, collection))
    return ret
  }

  ns.Collection.prototype = proto
  ns.Collection.prototype.constructor = ns.Collection

  for (const prop in constructor) {
    if (hasProp(constructor, prop)) {
      ns.Collection[prop] = constructor[prop]
    }
  }
}

const hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)

/**
 * Applies every registered extension to the given collection.
 * @param collection
 * @param args
 * @returns {Promise<void>}
 */
async function processCollectionExtensions (collection, args = []) {
  for (const ext of CollectionExtensions._extensions) {
    await applyExtension(collection, ext, args)
  }
}

/**
 * Applies a single extension to a collection
 * @param collection
 * @param fn
 * @param args
 * @returns {Promise<void>}
 */
async function applyExtension (collection, fn, args = []) {
  // eslint-disable-next-line no-useless-call
  await fn.call(null, collection, ...args)
}

if (typeof Mongo !== 'undefined') {
  wrapCollection(Mongo, Mongo)
  Meteor.Collection = Mongo.Collection
} else {
  wrapCollection(Meteor, Meteor)
}

if (typeof Meteor.users !== 'undefined') {
  // Ensures that Meteor.users instanceof Mongo.Collection
  reassignCollectionPrototype(Meteor.users)
}

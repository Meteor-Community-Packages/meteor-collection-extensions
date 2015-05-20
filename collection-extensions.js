// The collection extensions namespace
CollectionExtensions = {};

// Stores all the collection extensions
CollectionExtensions._extensions = [];

// This is where you would add custom functionality to
// Mongo.Collection/Meteor.Collection
Meteor.addCollectionExtension = function (customFunction) {
  if (typeof customFunction !== 'function') {
    throw new Meteor.Error(
      'collection-extension-wrong-argument', 
      'You must pass a function \
       into Meteor.addCollectionExtension().');
  }
  CollectionExtensions._extensions.push(customFunction);
  // If Meteor.users exists, apply the extension right away
  if (typeof Meteor.users !== 'undefined') {
    customFunction.apply(Meteor.users, ['users']);
  }
};

// Utility function to add a prototype function to your
// Meteor/Mongo.Collection object
Meteor.addCollectionPrototype = function (name, customFunction) {
  if (typeof name !== 'string') {
    throw new Meteor.Error(
      'collection-extension-wrong-argument', 
      'You must pass a string as the first argument \
       into Meteor.addCollectionPrototype().');
  }
  if (typeof customFunction !== 'function') {
    throw new Meteor.Error(
      'collection-extension-wrong-argument', 
      'You must pass a function as the second argument \
       into Meteor.addCollectionPrototype().');
  }
  (typeof Mongo !== 'undefined' ? 
    Mongo.Collection : 
    Meteor.Collection).prototype[name] = customFunction;
};

// This is used to reassign the prototype of unfortunately 
// and unstoppably already instantiated Mongo instances
// i.e. Meteor.users
CollectionExtensions._reassignCollectionPrototype = function (instance, constr) {
  if (!constr) constr = typeof Mongo !== 'undefined' ? Mongo.Collection : Meteor.Collection;
  
  // __proto__ is not available in < IE11
  // Note: Assigning a prototype dynamically has performance implications
  for (var prop in constr.prototype) {
    instance.constructor.prototype[prop] = constr.prototype[prop];
  }
};

// This monkey-patches the Collection constructor
// This code is the same monkey-patching code 
// that matb33:collection-hooks uses, which works pretty nicely
CollectionExtensions._wrapCollection = function (ns, as) {
  // Save the original prototype
  if (!as._CollectionPrototype) as._CollectionPrototype = new as.Collection(null);

  var constructor = as.Collection;
  var proto = as._CollectionPrototype;

  ns.Collection = function () {
    var ret = constructor.apply(this, arguments);
    // This is where all the collection extensions get processed
    CollectionExtensions._processCollectionExtensions(this, arguments);
    return ret;
  };

  ns.Collection.prototype = proto;

  for (var prop in constructor) {
    if (constructor.hasOwnProperty(prop)) {
      ns.Collection[prop] = constructor[prop];
    }
  }
};

CollectionExtensions._processCollectionExtensions = function (self, args) {
  // Using old-school operations for better performance
  // Please don't judge me ;P
  var args = args ? [].slice.call(args, 0) : undefined;
  var extensions = CollectionExtensions._extensions;
  for (var i = 0, len = extensions.length; i < len; i++) {
    extensions[i].apply(self, args);
  }
};

if (typeof Mongo !== 'undefined') {
  CollectionExtensions._wrapCollection(Meteor, Mongo);
  CollectionExtensions._wrapCollection(Mongo, Mongo);
} else {
  CollectionExtensions._wrapCollection(Meteor, Meteor);
}

if (typeof Meteor.users !== 'undefined') {
  // Ensures that Meteor.users instanceof Mongo.Collection
  CollectionExtensions._reassignCollectionPrototype(Meteor.users);
}
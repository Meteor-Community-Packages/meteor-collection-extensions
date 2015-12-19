Tinytest.add("works alongside dburles:mongo-collection-instances", function(test) {
  Todos = new Mongo.Collection('todos' + test.id);
  
  var todosInstance = Mongo.Collection.get('todos' + test.id);

  test.instanceOf(todosInstance, Mongo.Collection);
  test.instanceOf(todosInstance, Meteor.Collection);

  insert(Todos);

  var todo = inst(Todos);
  todo.$update({
    $set: {
      title: 'Pick up more stuff'
    }
  });

  todo = inst(Todos);
  test.equal(todo.title, 'Pick up more stuff');
});

Tinytest.add("works alongside ongoworks:security", function(test) {
  Todos = new Mongo.Collection('todos' + test.id);
  if (Meteor.isServer) {
    Todos.permit(['insert', 'update', 'remove']).apply();

    insert(Todos);
    
    var todo = inst(Todos);
    todo.$update({
      $set: {
        title: 'Pick up more stuff'
      }
    });

    todo = inst(Todos);
    test.equal(todo.title, 'Pick up more stuff');
  } else {
    test.equal(Todos.permit, undefined);
  }
});

Tinytest.add("works alongside aldeed:collection2", function(test) {
  Todos = new Mongo.Collection('todos' + test.id);

  Todos.attachSchema(new SimpleSchema({
    title: {
      type: String
    }
  }));
  
  insert(Todos);

  var todo = inst(Todos);
  todo.$update({
    $set: {
      title: 'Pick up more stuff'
    }
  });

  todo = inst(Todos);
  test.equal(todo.title, 'Pick up more stuff');
});

Tinytest.add("works alongside matb33:collection-hooks", function(test) {
  Todos = new Mongo.Collection('todos' + test.id);
  
  Todos.after.update(function() {
    test.equal(true, true);
  });

  insert(Todos);

  var todo = inst(Todos);
  todo.$update({
    $set: {
      title: 'Pick up more stuff'
    }
  });

  todo = inst(Todos);
  test.equal(todo.title, 'Pick up more stuff');
});

Tinytest.add("works alongside cfs:standard-packages + cfs:gridfs", function(test) {
  Todos = new Mongo.Collection('todos' + test.id);
  
  Images = new FS.Collection("images" + test.id, {
    stores: [new FS.Store.GridFS("images" + test.id)]
  });

  insert(Todos);

  var todo = inst(Todos);
  todo.$update({
    $set: {
      title: 'Pick up more stuff'
    }
  });

  todo = inst(Todos);
  test.equal(todo.title, 'Pick up more stuff');
});

Tinytest.add('instanceof - matches Mongo.Collection', function(test) {
  var collectionName = 'foo' + test.id;
  var Test = new Mongo.Collection(collectionName);
  test.instanceOf(Test, Mongo.Collection);
});

Tinytest.add('instanceof - Meteor.Collection matches Mongo.Collection', function(test) {
  var collectionName = 'foo' + test.id;
  var Test = new Meteor.Collection(collectionName);
  test.instanceOf(Test, Mongo.Collection);
});

Tinytest.add('instanceof - Meteor.users matches (Mongo/Meteor).Collection', function(test) {
  test.instanceOf(Meteor.users, Mongo.Collection);
  test.instanceOf(Meteor.users, Meteor.Collection);
});

Tinytest.add('instanceof - Mongo.Collection === Mongo.Collection.prototype.constructor', function(test) {
  test.equal(Mongo.Collection, Mongo.Collection.prototype.constructor);
  test.equal(Meteor.Collection, Mongo.Collection.prototype.constructor);
  test.equal(Meteor.Collection, Meteor.Collection.prototype.constructor);
});

Tinytest.add('functionality - Add a collection extension', function(test) {
  var arr = [];
  var extension = function() {
    arr.push(1);
  };
  CollectionExtensions.addCollectionExtension(extension);
  new Mongo.Collection(null);
  test.equal(arr[0], 1);
  clearExtension(extension);
});

Tinytest.add('functionality - Add a collection extension that adds initial documents', function(test) {
  var arr = [];
  var INITIAL_DOCUMENTS = 3;
  var extension = function() {
    for (var i = 0; i < INITIAL_DOCUMENTS; i++) {
      this.insert({ a: i });
    }
  };
  CollectionExtensions.addCollectionExtension(extension);
  var testCollection = new Mongo.Collection(null);
  testCollection.find().forEach(function(doc, index) {
    test.equal(doc.a, index);
  });
  clearExtension(extension);
});

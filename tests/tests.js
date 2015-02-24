Tinytest.add("works alongside dburles:mongo-collection-instances", function (test) {
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

Tinytest.add("works alongside ongoworks:security", function (test) {
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

Tinytest.add("works alongside aldeed:collection2", function (test) {
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

Tinytest.add("works alongside matb33:collection-hooks", function (test) {
  Todos = new Mongo.Collection('todos' + test.id);
  
  Todos.after.update(function () {
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

Tinytest.add("works alongside cfs:standard-packages + cfs:gridfs", function (test) {
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
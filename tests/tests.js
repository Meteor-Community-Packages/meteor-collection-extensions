/* eslint-env mocha */
/* global CollectionExtensions FS */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { assert } from 'chai'
import { Random } from 'meteor/random'
import { insert, inst, clearExtension } from './functions'
import SimpleSchema from 'simpl-schema'

const randomName = name => `${name}${Random.id(6)}`
const createCollection = name => new Mongo.Collection(name)

describe('tets', function () {
  it('works alongside dburles:mongo-collection-instances', function () {
    const name = randomName('todos')
    const Todos = createCollection(name)
    const todosInstance = Mongo.Collection.get(name)

    assert.instanceOf(todosInstance, Mongo.Collection)
    assert.instanceOf(todosInstance, Meteor.Collection)

    insert(Todos)

    let todo = inst(Todos)
    todo.$update({
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('works alongside ongoworks:security', function () {
    const name = randomName('todos')
    const Todos = createCollection(name)

    if (Meteor.isServer) {
      Todos.permit(['insert', 'update', 'remove']).apply()

      insert(Todos)

      let todo = inst(Todos)
      todo.$update({
        $set: {
          title: 'Pick up more stuff'
        }
      })

      todo = inst(Todos)
      assert.equal(todo.title, 'Pick up more stuff')
    } else {
      assert.equal(Todos.permit, undefined)
    }
  })

  it('works alongside aldeed:collection2', function () {
    const Todos = createCollection(randomName('todos'))

    Todos.attachSchema(new SimpleSchema({
      title: {
        type: String
      }
    }))

    insert(Todos)

    let todo = inst(Todos)
    todo.$update({
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('works alongside matb33:collection-hooks', function () {
    const Todos = createCollection(randomName('todos'))

    Todos.after.update(function () {
      assert.equal(true, true)
    })

    insert(Todos)

    let todo = inst(Todos)
    todo.$update({
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('works alongside cfs:standard-packages + cfs:gridfs', function () {
    const Todos = createCollection(randomName('todos'))
    const imagesName = randomName('images')
    const createFs = name => new FS.Collection(name, {
      stores: [new FS.Store.GridFS(name)]
    })

    createFs(imagesName)

    insert(Todos)

    let todo = inst(Todos)
    todo.$update({
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('instanceof - matches Mongo.Collection', function () {
    const collectionName = randomName('foo')
    const Test = createCollection(collectionName)
    assert.instanceOf(Test, Mongo.Collection)
  })

  it('instanceof - Meteor.Collection matches Mongo.Collection', function () {
    const collectionName = randomName('foo')
    const Test = new Meteor.Collection(collectionName)
    assert.instanceOf(Test, Mongo.Collection)
  })

  it('instanceof - Meteor.users matches (Mongo/Meteor).Collection', function () {
    assert.instanceOf(Meteor.users, Mongo.Collection)
    assert.instanceOf(Meteor.users, Meteor.Collection)
  })

  it('instanceof - Mongo.Collection === Mongo.Collection.prototype.constructor', function () {
    assert.equal(Mongo.Collection, Mongo.Collection.prototype.constructor)
    assert.equal(Meteor.Collection, Mongo.Collection.prototype.constructor)
    assert.equal(Meteor.Collection, Meteor.Collection.prototype.constructor)
  })

  it('functionality - Add a collection extension', function () {
    const arr = []
    const extension = function () {
      arr.push(1)
    }
  });

  todo = inst(Todos);
  test.equal(todo.title, 'Pick up more stuff');
});

Tinytest.add('inheritance - Shows the db-functions as properties of the prototype', function(test) {
  Todos = new Mongo.Collection('todos' + test.id);
  console.log(Object.keys(Mongo.Collection.prototype));
  test.include(Object.keys(Mongo.Collection.prototype), 'update');
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
  CollectionExtensions.addExtension(extension);
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
    CollectionExtensions.addExtension(extension)
    const testCollection = createCollection(null)
    testCollection.find().forEach(function (doc, index) {
      assert.equal(doc.a, index)
    })
    clearExtension(extension)
  })
})

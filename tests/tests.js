/* eslint-env mocha */
/* global CollectionExtensions FS */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { assert } from 'chai'
import { Random } from 'meteor/random'
import { insert, inst, clearExtension } from './functions'
import SimpleSchema from 'simpl-schema'
import 'meteor/aldeed:collection2/static'

const randomName = name => `${name}${Random.id(6)}`
const createCollection = name => new Mongo.Collection(name)

describe('tets', function () {
  it('works alongside dburles:mongo-collection-instances', async function () {
    const name = randomName('todos')
    const Todos = createCollection(name)
    const todosInstance = Mongo.Collection.get(name)

    assert.instanceOf(todosInstance, Mongo.Collection)
    assert.instanceOf(todosInstance, Meteor.Collection)

    await insert(Todos)

    let todo = await inst(Todos)
    await Todos.updateAsync(todo._id, {
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = await inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  // XXX: ongoworks:security is currently out of our reach
  // XXX: and we should remove comments, once it's part of MCP
  // it('works alongside ongoworks:security', async function () {
  //   const name = randomName('todos')
  //   const Todos = createCollection(name)
  //
  //   if (Meteor.isServer) {
  //     Todos.permit(['insertAsync', 'updateAsync', 'removeAsync']).apply()
  //
  //     await insert(Todos)
  //
  //     let todo = await inst(Todos)
  //     await Todos.updateAsync(todo._id, {
  //       $set: {
  //         title: 'Pick up more stuff'
  //       }
  //     })
  //
  //     todo = await inst(Todos)
  //     assert.equal(todo.title, 'Pick up more stuff')
  //   } else {
  //     assert.equal(Todos.permit, undefined)
  //   }
  // })

  it('works alongside aldeed:collection2', async function () {
    const Todos = createCollection(randomName('todos'))

    Todos.attachSchema(new SimpleSchema({
      title: {
        type: String
      }
    }))

    await insert(Todos)

    let todo = await inst(Todos)
    await Todos.updateAsync(todo._id, {
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = await inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('works alongside matb33:collection-hooks', async function () {
    const Todos = createCollection(randomName('todos'))

    Todos.after.update(function () {
      assert.equal(true, true)
    })

    await insert(Todos)

    let todo = await inst(Todos)
    await Todos.updateAsync(todo._id, {
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = await inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('works alongside cfs:standard-packages + cfs:gridfs', async function () {
    const Todos = createCollection(randomName('todos'))
    const imagesName = randomName('images')
    const createFs = name => new FS.Collection(name, {
      stores: [new FS.Store.GridFS(name)]
    })

    createFs(imagesName)

    await insert(Todos)

    let todo = await inst(Todos)
    await Todos.updateAsync(todo._id, {
      $set: {
        title: 'Pick up more stuff'
      }
    })

    todo = await inst(Todos)
    assert.equal(todo.title, 'Pick up more stuff')
  })

  it('inheritance - Shows the db-functions as properties of the prototype', function () {
    const Todos = createCollection(randomName('todos'))
    const keys = Object.keys(Mongo.Collection.prototype)
    assert.instanceOf(Todos, Mongo.Collection)
    ;[
      '_makeNewID',
      '_connection',
      '_name',
      '_transform'
    ].forEach(key => assert.include(keys, key))
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
    CollectionExtensions.addExtension(extension)
    createCollection(null)
    assert.equal(arr[0], 1)
    clearExtension(extension)
  })

  it('functionality - Add a collection extension that adds initial documents', function () {
    const INITIAL_DOCUMENTS = 3
    const extension = function () {
      for (let i = 0; i < INITIAL_DOCUMENTS; i++) {
        this.insert({ a: i })
      }
    }
    CollectionExtensions.addExtension(extension)
    const testCollection = createCollection(null)
    testCollection.find().forEach(function (doc, index) {
      assert.equal(doc.a, index)
    })
    clearExtension(extension)
  })
})

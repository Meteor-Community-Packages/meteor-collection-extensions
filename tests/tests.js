/* eslint-env mocha */
/* global Collection2 */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { assert } from 'chai'
import { Random } from 'meteor/random'
import { insert, inst, clearExtension, asyncTimeout } from './functions'
import SimpleSchema from 'meteor/aldeed:simple-schema'
import 'meteor/aldeed:collection2/dynamic'
import { CollectionExtensions } from 'meteor/lai:collection-extensions'

const randomName = name => `${name}${Random.id(6)}`
const createCollection = (name, options) => new Mongo.Collection(name, options)
// no extensions should apply to this one
const UnaffectedCollection = createCollection(randomName('unaffected'))

Meteor.users.allow({
  insert: () => true
})

describe('CollectionExtensions', function () {
  describe('addExtension', function () {
    let extension

    afterEach(() => {
      if (extension) {
        clearExtension(extension)
      }
    })

    it('works alongside dburles:mongo-collection-instances', async function () {
      const name = randomName('mongoCollectionInstances')
      const Todos = createCollection(name)

      const todosInstance = Mongo.Collection.get(name)

      assert.equal(Todos, todosInstance)
      assert.instanceOf(todosInstance, Mongo.Collection)
      assert.instanceOf(todosInstance, Meteor.Collection)

      if (Meteor.isServer) {
        await insert(todosInstance)

        let todo = await inst(todosInstance)
        await todosInstance.updateAsync(todo._id, {
          $set: {
            title: 'Pick up more stuff'
          }
        })

        todo = await inst(todosInstance)
        assert.equal(todo.title, 'Pick up more stuff')
      }
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
      Collection2.load()
      const name = randomName('collection2')
      const Todos = createCollection(name)
      Todos.attachSchema(new SimpleSchema({
        title: {
          type: String
        }
      }, {
        clean: {
          autoConvert: false,
          filter: false
        }
      }))

      try {
        await Todos.insertAsync({ foo: 'bar' })
      } catch (e) {
        const message = `foo is not allowed by the schema in ${name} insertAsync`
        assert.equal(e.message, message)
      }
    })

    // TODO: uncomment, once collection-hooks is upgraded to 3.0
    // it('works alongside matb33:collection-hooks', async function () {
    //   const Todos = createCollection(randomName('todos'))
    //
    //   Todos.after.update(function () {
    //     assert.equal(true, true)
    //   })
    //
    //   await insert(Todos)
    //
    //   let todo = await inst(Todos)
    //   await Todos.updateAsync(todo._id, {
    //     $set: {
    //       title: 'Pick up more stuff'
    //     }
    //   })
    //
    //   todo = await inst(Todos)
    //   assert.equal(todo.title, 'Pick up more stuff')
    // })

    // TODO: cfs* are deprecated, check if this can be dropped safely
    // it('works alongside cfs:standard-packages + cfs:gridfs', async function () {
    //   const Todos = createCollection(randomName('todos'))
    //   const imagesName = randomName('images')
    //   const createFs = name => new FS.Collection(name, {
    //     stores: [new FS.Store.GridFS(name)]
    //   })
    //
    //   createFs(imagesName)
    //
    //   await insert(Todos)
    //
    //   let todo = await inst(Todos)
    //   await Todos.updateAsync(todo._id, {
    //     $set: {
    //       title: 'Pick up more stuff'
    //     }
    //   })
    //
    //   todo = await inst(Todos)
    //   assert.equal(todo.title, 'Pick up more stuff')
    // })

    it('inheritance - Shows the db-functions as properties of the prototype', function () {
      const Todos = createCollection(randomName('propsCheck'))
      const keys = Object.keys(Mongo.Collection.prototype)
      assert.instanceOf(Todos, Mongo.Collection)
      ;[
        '_maybeSetUpReplication',
        'countDocuments',
        'estimatedDocumentCount',
        '_getFindSelector',
        '_getFindOptions',
        'find',
        'findOneAsync',
        'findOne',
        '_insert',
        'insert',
        '_insertAsync',
        'insertAsync',
        'updateAsync',
        'update',
        'removeAsync',
        'remove',
        '_isRemoteCollection',
        'upsertAsync',
        'upsert',
        'ensureIndexAsync',
        'createIndexAsync',
        'createIndex',
        'dropIndexAsync',
        'dropCollectionAsync',
        'createCappedCollectionAsync',
        'rawCollection',
        'rawDatabase',
        'allow',
        'deny',
        '_defineMutationMethods',
        '_updateFetch',
        '_isInsecure',
        '_validatedInsertAsync',
        '_validatedInsert',
        '_validatedUpdateAsync',
        '_validatedUpdate',
        '_validatedRemoveAsync',
        '_validatedRemove',
        '_callMutatorMethodAsync',
        '_callMutatorMethod'
      ].forEach(key => assert.include(keys, key))
    })

    it('instanceof - matches Mongo.Collection', function () {
      const collectionName = randomName('instanceOfMongo')
      const Test = createCollection(collectionName)
      assert.instanceOf(Test, Mongo.Collection)
    })

    it('instanceof - Meteor.Collection matches Mongo.Collection', function () {
      const collectionName = randomName('instanceOfMeteor')
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

    it('functionality - Add a collection extension that manipulates a data structure in a standard sync function', async function () {
      const registered = new Set()
      extension = function countArray (collection) {
        registered.add(collection._name)
      }

      CollectionExtensions.addExtension(extension)

      // immediately apply to users
      assert.isTrue(registered.has('users'))

      // apply to local collection
      assert.isFalse(registered.has(null))
      createCollection(null)
      await asyncTimeout(25)
      assert.isTrue(registered.has(null))

      // apply to named collection
      const name = randomName('simpleArray')
      assert.isFalse(registered.has(name))
      createCollection(name)
      await asyncTimeout(25)
      assert.isTrue(registered.has(name))
    })

    it('functionality - Add a collection extension that adds initial documents in an async arrow function', async function () {
      const COUNT = 3
      const prop = randomName('prop')
      extension = async (collection) => {
        for (let i = 0; i < COUNT; i++) {
          const doc = { [prop]: i }
          await collection.insertAsync(doc)
        }
      }

      CollectionExtensions.addExtension(extension)

      const testCollection = async (collection, expectedCount) => {
        await asyncTimeout(200)
        const cursor = collection.find({ [prop]: { $exists: true } })
        const count = await cursor.countAsync()
        assert.equal(count, expectedCount, collection._name)
        cursor.forEach(function (doc, index) {
          assert.equal(doc[prop], index)
        })
        await asyncTimeout(100)
      }

      await testCollection(createCollection(null), COUNT)
      await testCollection(UnaffectedCollection, 0)

      if (Meteor.isServer) {
        // TODO: we need to get this running on the client
        await testCollection(Meteor.users, COUNT)
        await testCollection(createCollection(randomName('initialDocs')), COUNT)
      }
    })

    it('supports a callback that execs when extensions have completed', done => {
      extension = () => {
      }
      CollectionExtensions.addExtension(extension)
      const name = randomName('onComplete')
      const extensions = {
        onError: e => done(e),
        onComplete: (collection) => {
          assert.equal(collection._name, name)
          done()
        }
      }
      createCollection(name, { extensions })
    })

    it('catches errors and forwards them in an optional callback', done => {
      extension = () => {
        throw new Error('expected error callback')
      }
      CollectionExtensions.addExtension(extension)
      const name = randomName('onError')
      const extensions = {
        onError: (e, collection) => {
          assert.equal(e.message, 'expected error callback')
          assert.equal(collection._name, name)
          done()
        }
      }
      createCollection(name, { extensions })
    })
  })

  describe('addPrototype', function () {
    it('allows to register a prototype function', async () => {
      CollectionExtensions.addPrototype('count', async function () {
        return this.find().countAsync()
      })
      const name = randomName('proto')
      const collection = createCollection(name)
      assert.equal(await collection.count(), 0)

      // expect not being enumerable by default
      assert.isFalse(Object.keys(collection).includes('count'))
    })
    it('allows to override proto functions', async () => {
      CollectionExtensions.addPrototype('insert', async function (doc) {
        return this.insertAsync(doc)
      })
      const name = randomName('proto')
      const collection = createCollection(name)
      assert.equal(await collection.count(), 0)

      if (Meteor.isServer) {
        const promise = collection.insert({ foo: 1 })
        assert.isTrue(typeof promise.then === 'function')
        await promise

        assert.equal(await collection.count(), 1)
      }
    })
  })
})

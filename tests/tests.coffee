{ CollectionExtensions } = require('meteor/lai:collection-extensions')
{ assert } = require 'chai'
{ clearExtension } = require './functions'

describe 'coffeescript', () ->
  it 'child class - Can create child classes with wrapped constructor in Coffeescript', () ->
    arr = []

    extension = () ->
      arr.push 1

    CollectionExtensions.addExtension extension

    class ChildMongoCollection extends Mongo.Collection
      constructor: ->
        arr.push 2

    new ChildMongoCollection

    assert.equal arr[0], 1
    assert.equal arr[1], 2
    clearExtension extension

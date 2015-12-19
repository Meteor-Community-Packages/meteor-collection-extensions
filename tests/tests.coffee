Tinytest.add 'child class - Can create child classes with wrapped constructor in Coffeescript', (test) ->
  arr = []
  
  extension = () ->
  	arr.push 1

  Meteor.addCollectionExtension extension
    
  class ChildMongoCollection extends Mongo.Collection
    constructor: ->
      arr.push 2
      
  new ChildMongoCollection
  
  test.equal arr[0], 1
  test.equal arr[1], 2
  clearExtension extension
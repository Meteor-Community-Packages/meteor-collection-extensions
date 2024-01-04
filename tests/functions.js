/* global CollectionExtensions */
export const insert = async function (collection) {
  return collection.insertAsync({
    title: 'Buy groceries',
    createdAt: new Date('1/1/2014'),
    assignedTo: [{
      user: 'lindsey',
      assignedOn: new Date('1/1/2014')
    }],
    some: {
      weirdly: 'nested object',
      that: 'I uncreatively',
      came: 'up with because',
      iwas: 'running out of creativity'
    },
    tags: ['critical', 'yum'],
    done: false
  })
}

export const inst = async function (collection) {
  return collection.findOneAsync()
}

export const clearExtension = function (extension) {
  const extensions = CollectionExtensions._extensions
  const indexOfExtension = extensions.indexOf(extension)

  if (indexOfExtension > -1) {
    extensions.splice(indexOfExtension, 1)
  }
}

/**
 * Created by cj on 8/21/2015.
 */

var when = require('when')
var pipeline = require('when/pipeline')
var monk = require('monk')
var monkery = require('../monkery.js')

var db = monk('127.0.0.1:27017/shapeshift-test')
var db2

var rincewind = null
monkery.add_handler(db, ['insert', 'update'], function (c, n, args) {
  rincewind = args[0]
})

pipeline([

  function () {
    var characters = db.get('characters')
    return characters.insert({name: 'Rincewind', occupation: 'wizzard'})
  },

  function () {
    if (!rincewind)
      throw new Error("Handler was not called")

    if (rincewind.name != 'Rincewind')
      throw new Error("Saved entity was mangled.")
  },

  function () {
    db.close()
    db = monk('127.0.0.1:27017/shapeshift-test')
    db2 = monk('127.0.0.1:27017/shapeshift-test')

    monkery.add_destination(db, db2)

    var characters = db.get('characters')
    return characters.update({name: 'The Librarian', occupation: 'librarian'})
  },

  function () {
    var characters = db.get('characters')
    return characters.findOne({name: 'Rincewind'})
      .then(function (entity) {
        if (!entity || entity.name != 'Rincewind')
          throw new Error("Error saving entity to first db.")

        console.log('Entity saved to first db')
      })
  },

  function () {
    var characters = db2.get('characters')
    return characters.findOne({name: 'Rincewind'})
      .then(function (entity) {
        if (!entity || entity.name != 'Rincewind')
          throw new Error("Error saving entity to second db.")

        console.log('Entity saved to second db')
      })
  },

  function () {
    console.log('All tests succeeded.')
  }
])
  .done(function () {
    db.close()
    db2.close()
  })


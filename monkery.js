/**
 * Created by cj on 8/21/2015.
 */

var monk = require('monk')

// Helper function to wrap an existing function and attach a second function to it
function wrap_function(collection, method_name, handler) {
  var original_method = collection[method_name]
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var result = original_method.apply(collection, args)
    handler.call(null, collection, method_name, args)
    return result
  }
}

module.exports = {

  // The primary API function.
  // This function takes two monk db connection objects and connects the second one to the first so that
  // when any of the methods listed in the method_names parameter are called, that same function is called on
  // the second db object, passing the same arguments that were passed to the first function call.
  add_destination: function(first_db, second_db, method_names) {
    method_names = method_names || ['insert', 'update']

    module.exports.add_handler(first_db, method_names, function (collection, method_name, args) {
      var second_collection = second_db.get(collection.name)
      second_collection[method_name].apply(second_collection, args)
    })
  },

  // Attaches a handler function to be fired alongside one or more existing methods of a monk connection object
  // This was intended to be called from add_destination but can optionally be used directly for increased flexibility.
  add_handler: function (db, method_names, handler) {
    db.get = function (name) {
      if (!db.collections[name]) {
        var collection = db.collections[name] = new monk.Collection(this, name)
        for (var i in method_names) {
          var method_name = method_names[i]
          collection[method_name] = wrap_function(collection, method_name, handler)
        }
      }

      return db.collections[name]
    }
  }

}
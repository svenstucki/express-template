var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// TODO: Add schema definitions here


var schemas = {

};


module.exports = {
  getModels: function (connection) {
    var models = {};
    for (var k in schemas) {
      models[k] = connection.model(k, schemas[k]);
    }
    return models;
  },

  init: function (connection) {

  },
};

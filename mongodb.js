var mongoose = require('mongoose');
require('dotenv').config();

var db = process.env.DB || 'local_db';
var url = process.env.DB_URL || 'localhost:27017';

var DB_ref = mongoose
  .createConnection('mongodb://' + url + '/' + db)

  .on('error', function (err) {
    if (err) {
      console.error('Error connecting to MongoDB.', err.message);
      process.exit(1);
    }
  })
  .once('open', function callback() {
    console.info('Mongo db connected successfully ' + db);
  });

module.exports = DB_ref;

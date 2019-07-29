const mongoose = require('mongoose');

const User = require('./user')

const connectDb = () => {
  return mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/pictopal');
};

const models = {User};


module.exports = {
  connectDb: connectDb,
  models: models,
}

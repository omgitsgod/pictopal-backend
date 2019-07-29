const mongoose = require('mongoose');

const User = require('./user')

const connectDb = () => {
  return mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/pictopal');
};

const models = {User};

//export {connectDb};

//export default models;
module.exports = {
  connectDb: connectDb,
  models: models,
}

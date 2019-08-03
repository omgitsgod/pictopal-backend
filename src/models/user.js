const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  name: String,
  photo: String,
  token: String,
  oauthID: Number,
  created: Date,
}, {timestamps: true});

const User = mongoose.model('User', userSchema);

module.exports = User;

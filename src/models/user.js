const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: string,
    unique: true,
  },
});

const User = mongoose.model('User', userSchema);

export default User;
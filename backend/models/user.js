const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Allowed branches
const allowedBranches = ['computer science', 'electronic', 'mechanical', 'civil', 'electrical'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@thapar\.edu$/, 'Only @thapar.edu emails allowed']
  },
  password: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
    enum: allowedBranches,
  }
});

// Encrypt the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords on login
userSchema.methods.comparePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

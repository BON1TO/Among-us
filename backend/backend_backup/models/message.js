// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  user: { type: String, required: true },      // username or userId
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

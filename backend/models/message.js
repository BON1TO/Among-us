// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  user: {  // sender info
    id: { type: String, required: true },   // userId
    name: { type: String, required: true }  // username/displayName
  },
  message: { type: String, required: true },

  // ✅ NEW FIELDS
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  deliveredTo: [{ type: String }], // userIds who received it
  readBy: [{ type: String }],      // userIds who read it

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/message');

dotenv.config();
const app = express();

// Enable CORS for REST API, restrict to React frontend origin
app.use(cors({
  origin: 'http://localhost:3000',  // Your React app origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);

// Create HTTP server and bind Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS restricted to React frontend
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Track online users (userId -> Set of socketIds)
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins app (after login)
  socket.on('user:join', ({ userId, name }) => {
    if (!userId) return;

    socket.data.userId = userId;
    socket.data.name = name;

    const set = onlineUsers.get(userId) || new Set();
    set.add(socket.id);
    onlineUsers.set(userId, set);

    io.emit('user:online', { userId, name });
    console.log(`➡️ user:join ${userId} (${socket.id})`);
  });

  // Join a branch (room)
  socket.on('joinBranch', (branch) => {
    console.log(`✅ Socket ${socket.id} joined branch: ${branch}`);
    socket.join(branch);
  });

  // Typing indicator
  socket.on('typing', ({ branch, userId }) => {
    socket.to(branch).emit('typing', { branch, userId });
  });
  socket.on('stopTyping', ({ branch, userId }) => {
    socket.to(branch).emit('stopTyping', { branch, userId });
  });

  // Send a message
  socket.on('message:send', async ({ branch, text, userId, name }) => {
    if (!branch || !userId) return;

    try {
      // Save message with status "sent"
      const msgDoc = new Message({
        branch,
        user: { id: userId, name },
        message: text,
        status: 'sent'
      });
      await msgDoc.save();

      // Emit new message to everyone in branch
      io.to(branch).emit('message:new', {
        _id: msgDoc._id,
        branch,
        user: msgDoc.user,
        message: msgDoc.message,
        status: msgDoc.status,
        createdAt: msgDoc.createdAt
      });

      // Mark delivered for all online users in this branch
      const deliveredTo = [];
      for (const [uid, sockets] of onlineUsers.entries()) {
        if (uid === userId) continue; // skip sender
        if (sockets && sockets.size > 0) {
          deliveredTo.push(uid);
        }
      }

      if (deliveredTo.length) {
        await Message.findByIdAndUpdate(msgDoc._id, {
          $addToSet: { deliveredTo: { $each: deliveredTo } },
          $set: { status: 'delivered' }
        });

        io.to(branch).emit('message:delivered', {
          messageId: msgDoc._id.toString(),
          deliveredTo
        });
      }

    } catch (err) {
      console.error('❌ Error saving chat message:', err);
    }
  });

  // Manual delivery ack
  socket.on('message:ackDelivered', async ({ messageId, userId }) => {
    if (!messageId || !userId) return;
    try {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deliveredTo: userId },
        $set: { status: 'delivered' }
      });
      io.emit('message:delivered', { messageId, deliveredTo: [userId] });
    } catch (err) {
      console.error('ackDelivered error', err);
    }
  });

  // Read receipt
  socket.on('message:read', async ({ messageId, userId }) => {
    if (!messageId || !userId) return;
    try {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: userId },
        $set: { status: 'read' }
      });
      io.emit('message:read', { messageId, userId });
    } catch (err) {
      console.error('message:read error', err);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log('❎ User disconnected:', socket.id);
    const userId = socket.data.userId;
    if (!userId) return;

    const set = onlineUsers.get(userId);
    if (set && set.has(socket.id)) {
      set.delete(socket.id);
      if (set.size === 0) {
        onlineUsers.delete(userId);
        io.emit('user:offline', { userId, lastSeen: new Date() });
      } else {
        onlineUsers.set(userId, set);
      }
    }
  });
});

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });

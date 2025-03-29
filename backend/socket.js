const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.user._id);

    // Join user-specific room
    socket.join(`user:${socket.user._id}`);
    if (socket.user.role === 'business') {
      socket.join(`business:${socket.user._id}`);
    } else if (socket.user.role === 'collector') {
      socket.join(`collector:${socket.user._id}`);
    }

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.user._id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO
};
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const redisService = require('./redis.service');

// In-memory Map to track online users: userId -> socket.id
const onlineUsers = new Map();

// Rate limiter trackers
const rateLimits = new Map();
const blockList = new Map();

let io;
let pubClient, subClient;

exports.init = async (httpServer) => {
  io = new Server(httpServer, {
    path: '/api/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Initialize Redis adapter for multi-instance scaling
  if (redisService.isReady && redisService.client) {
    try {
      pubClient = redisService.client.duplicate();
      subClient = redisService.client.duplicate();
      await pubClient.connect();
      await subClient.connect();
      io.adapter(createAdapter(pubClient, subClient));
      console.log('[Socket.io] ✅ Redis adapter initialized for multi-instance scaling');
    } catch (err) {
      console.warn('[Socket.io] ⚠️ Redis adapter failed, using in-memory:', err.message);
    }
  }

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.join(`user_${userId}`);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.warn(`Connection attempt without userId: ${socket.id}`);
    }

    socket.on('sendMessage', async (payload) => {
      try {
        const { senderId, receiverId, text } = payload;
        
        if (!senderId || !receiverId || !text) {
          throw new Error('Invalid payload');
        }

        const now = Date.now();

        // Check if user is currently blocked
        if (blockList.has(senderId) && now < blockList.get(senderId)) {
          return socket.emit('messageError', { error: 'Rate limit exceeded. Blocked for 1 minute.' });
        }

        // Track messages per second
        const userRate = rateLimits.get(senderId) || { count: 0, startTime: now };
        
        if (now - userRate.startTime < 1000) {
          userRate.count++;
          if (userRate.count > 3) {
            blockList.set(senderId, now + 60000);
            return socket.emit('messageError', { error: 'Sending too fast! Blocked for 1 minute.' });
          }
        } else {
          userRate.count = 1;
          userRate.startTime = now;
        }
        rateLimits.set(senderId, userRate);

        // Check or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [senderId, receiverId],
            lastMessage: text
          });
          await conversation.save();
        } else {
          conversation.lastMessage = text;
          await conversation.save();
        }

        // Create the message
        const newMessage = new Message({
          conversationId: conversation._id,
          senderId,
          receiverId,
          text,
          status: 'sent',
          isRead: false
        });

        await newMessage.save();

        const messagePayload = {
          _id: newMessage._id.toString(),
          id: newMessage._id.toString(),
          conversationId: conversation._id.toString(),
          sender: senderId.toString(),
          senderId: senderId.toString(),
          receiver: receiverId.toString(),
          receiverId: receiverId.toString(),
          text,
          status: 'sent',
          createdAt: newMessage.createdAt
        };

        // Emit message to receiver's room and individual socket
        io.to(`user_${receiverId}`).emit('receiveMessage', messagePayload);
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receiveMessage', messagePayload);
          newMessage.status = 'delivered';
          await newMessage.save();
        }

        // Acknowledge back to sender
        socket.emit('messageSent', { ...messagePayload, localId: payload.id });

        // Emit real-time conversation updates for tab views
        io.to(`user_${receiverId}`).emit('conversationUpdate', {
          otherUserId: senderId.toString(),
          lastMessage: text,
          updatedAt: newMessage.createdAt
        });
        io.to(`user_${senderId}`).emit('conversationUpdate', {
          otherUserId: receiverId.toString(),
          lastMessage: text,
          updatedAt: newMessage.createdAt
        });

      } catch (error) {
        console.error('Socket sendMessage Error:', error);
        socket.emit('messageError', { error: 'Failed to send message.' });
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
      }
    });
  });
};

exports.getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

exports.getOnlineUsers = () => onlineUsers;

const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Client joins a room
    socket.on('join', async ({ userId, username, room = 'global' }) => {
      try {
        socket.join(room);
        socket.data.userId = userId;
        socket.data.username = username;
        socket.data.room = room;

        // mark user online
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            online: true,
            socketId: socket.id,
          });
        }

        // notify others
        socket.to(room).emit('user:joined', { userId, username });

        const users = await User.find({}, 'username online socketId');
        io.to(room).emit('presence', users);

        console.log(`👤 ${username} joined ${room}`);
      } catch (err) {
        console.error('❌ join error:', err);
      }
    });

    // 💬 Handle new messages
    socket.on('message', async (payload) => {
      try {
        const { room = 'global', userId, text } = payload;

        if (!userId || !text?.trim()) {
          console.warn('⚠️ Invalid message payload:', payload);
          return;
        }

        // Save to MongoDB
        const msg = new Message({
          room,
          from: userId,
          text: text.trim(),
        });

        const savedMsg = await msg.save();
        console.log('💾 Message saved:', savedMsg._id);

        // Emit to everyone in the room
        io.to(room).emit('newMessage', {
          _id: savedMsg._id,
          text: savedMsg.text,
          from: savedMsg.from,
          createdAt: savedMsg.createdAt,
        });
      } catch (err) {
        console.error('❌ Message save error:', err);
      }
    });

    // 📝 Typing indicator
    socket.on('typing', ({ room, userId, username }) => {
      socket.to(room || 'global').emit('typing', { userId, username });
    });

    // 👀 Read receipts
    socket.on('message:read', async ({ messageId, userId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { seenBy: userId },
        });
        io.to(socket.data.room || 'global').emit('message:read', {
          messageId,
          userId,
        });
      } catch (err) {
        console.error('❌ message:read error:', err);
      }
    });

    // 🚪 Handle disconnect
    socket.on('disconnect', async (reason) => {
      console.log('❌ Socket disconnected:', socket.id, reason);
      const userId = socket.data.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          online: false,
          socketId: null,
        });
        socket.broadcast.emit('user:left', {
          userId,
          username: socket.data.username,
        });
      }
    });
  });
};

const Message = require('../models/Message');
const User = require('../models/User');
module.exports = (io) => {
// Use namespaces or keep default `io`
io.on('connection', (socket) => {
console.log('Socket connected', socket.id);
// Client sends `join` with { token, room }
socket.on('join', async ({ token, room = 'global' }) => {
try {
// If you want to authenticate using token, decode here
// For simplicity assume client also sends userId and username
const { userId, username } = socket.handshake.query || {};
socket.join(room);
socket.data.userId = userId;
socket.data.username = username;
socket.data.room = room;
// mark user online & store socket id
if (userId) await User.findByIdAndUpdate(userId, { online: true,
socketId: socket.id });
// notify room
socket.to(room).emit('user:joined', { userId, username });
// send presence list (very basic)
const users = await User.find({}, 'username online socketId');
io.to(room).emit('presence', users);
} catch (err) {
console.error('join error', err);
}
});
// Receiving a chat message
socket.on('message', async (payload) => {
// payload: { room, fromId, text }
try {
const msg = new Message({ room: payload.room || 'global', from:
payload.fromId, text: payload.text });
await msg.save();
// broadcast to room
io.to(payload.room || 'global').emit('message', {
id: msg._id,
text: msg.text,
fromId: payload.fromId,
createdAt: msg.createdAt
});
} catch (err) {
console.error(err);
}
});
// Typing indicator
socket.on('typing', ({ room, userId, username }) => {
socket.to(room).emit('typing', { userId, username });
});
// Read receipts
socket.on('message:read', async ({ messageId, userId }) => {
await Message.findByIdAndUpdate(messageId, { $addToSet: { seenBy:
    userId } });
// notify message sender / room
io.to(socket.data.room || 'global').emit('message:read', { messageId,
userId });
});
socket.on('disconnect', async (reason) => {
console.log('Socket disconnected', socket.id, reason);
const userId = socket.data.userId;
if (userId) {
await User.findByIdAndUpdate(userId, { online: false, socketId: null });
// notify others
socket.broadcast.emit('user:left', { userId, username:
socket.data.username });
}
});
});
};

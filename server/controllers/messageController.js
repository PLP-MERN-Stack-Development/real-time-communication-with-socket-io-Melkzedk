// controllers/messageController.js
const Message = require('../models/Message');

// Save a new message
exports.createMessage = async (req, res) => {
  try {
    const { room, from, text } = req.body;

    if (!from || !text) {
      return res.status(400).json({ msg: 'Sender and message text are required' });
    }

    const message = new Message({
      room: room || 'global',
      from,
      text,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Fetch all messages in a room
exports.getMessages = async (req, res) => {
  try {
    const room = req.query.room || 'global';
    const messages = await Message.find({ room })
      .populate('from', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// routes/message.js
const express = require('express');
const router = express.Router();
const { createMessage, getMessages } = require('../controllers/messageController');

router.post('/', createMessage);   // Save new message
router.get('/', getMessages);      // Fetch messages

module.exports = router;

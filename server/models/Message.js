const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
room: { type: String, default: 'global' },
from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
text: { type: String },
attachments: [{ url: String, filename: String }],
seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', MessageSchema);

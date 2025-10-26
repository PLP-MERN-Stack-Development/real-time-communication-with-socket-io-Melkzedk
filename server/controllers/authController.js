const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
exports.register = async (req, res) => {
const { username, password } = req.body;
try {
let user = await User.findOne({ username });
if (user) return res.status(400).json({ msg: 'Username already taken' });
const hashed = password ? await bcrypt.hash(password, 10) : null;
user = new User({ username, password: hashed });
await user.save();
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
expiresIn: '7d' });
res.json({ token, user: { id: user._id, username: user.username } });
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
};
exports.login = async (req, res) => {
const { username, password } = req.body;
try {
const user = await User.findOne({ username });
if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
if (user.password) {
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
}
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
expiresIn: '7d' });
res.json({ token, user: { id: user._id, username: user.username } });
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
};

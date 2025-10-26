require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/api/auth', authRoutes);
(async () => {
await connectDB(process.env.MONGO_URI);
const io = new Server(server, {
cors: { origin: process.env.CLIENT_URL || '*' }
});
// attach socket handlers
require('./socket')(io);
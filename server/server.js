require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message'); // 👈 ADD THIS

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Start server & connect DB
(async () => {
  await connectDB(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');

  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || '*' },
  });

  // Attach socket handlers
  require('./socket')(io);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// ====== Middleware ======
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// ====== API Routes ======
app.use('/api/auth', authRoutes);

// ====== Database & Socket.IO Setup ======
(async () => {
try {
// Connect to MongoDB
await connectDB(process.env.MONGO_URI);
console.log('✅ MongoDB connected successfully');
} catch (error) {
console.error('❌ Server startup failed:', error.message);
process.exit(1);
}
})();

// ====== Default Route ======
app.get('/', (req, res) => {
res.send('Realtime Chat Server is running...');
});
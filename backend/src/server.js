import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { getPool } from './utils/db.js';
import authRoutes from './routes/authRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import topUpRoutes from './routes/topUpRoutes.js';
import { registerBidSocketHandlers } from './sockets/bidSocket.js';
import { registerChatSocketHandlers } from './sockets/chatSocket.js';
import { registerNotificationSocketHandlers } from './sockets/notificationSocket.js';
import auctionChecker from './jobs/auctionChecker.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Set io instance for routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/top-ups', topUpRoutes);

// Health
app.get('/api/health', async (req, res) => {
  try {
    await (await getPool()).query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Socket.IO
io.on('connection', (socket) => {
  registerBidSocketHandlers(io, socket);
  registerChatSocketHandlers(io, socket);
  registerNotificationSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, '..', 'uploads');
const chatUploadsPath = path.join(uploadsPath, 'chat');
const topUpUploadsPath = path.join(uploadsPath, 'topups');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
if (!fs.existsSync(chatUploadsPath)) {
  fs.mkdirSync(chatUploadsPath, { recursive: true });
}
if (!fs.existsSync(topUpUploadsPath)) {
  fs.mkdirSync(topUpUploadsPath, { recursive: true });
}

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`);
  
  // Set io instance for auction checker and start it
  auctionChecker.setIO(io);
  auctionChecker.start();
});



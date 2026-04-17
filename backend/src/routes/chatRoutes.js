import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'chat');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `chat-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

/**
 * chatRoutes
 * - ถูก mount ที่: `/api/chat`
 * - logic อยู่ที่ `controllers/chatController.js`
 */
const router = Router();

router.get('/rooms', authRequired, chatController.listRooms);
router.post('/rooms', authRequired, chatController.createRoom);
router.get('/rooms/winner/:auctionId', authRequired, chatController.winnerRooms);
router.get('/rooms/accessible', authRequired, chatController.accessibleRooms);
router.get('/rooms/:id/messages', authRequired, chatController.getMessages);
router.post('/rooms/:id/messages', authRequired, chatController.postMessage);
router.post('/rooms/:id/messages/image', authRequired, upload.single('image'), chatController.postImageMessage);
router.delete('/messages/:id', authRequired, chatController.deleteMessage);

export default router;

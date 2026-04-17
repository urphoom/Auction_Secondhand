import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';
import * as topUpController from '../controllers/topUpController.js';

/**
 * topUpRoutes
 * - ถูก mount ที่: `/api/top-ups`
 * - logic อยู่ที่ `controllers/topUpController.js`
 */
const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'topups');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeExt = ext ? ext.toLowerCase() : '';
    cb(null, `topup-${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/', authRequired, upload.single('slip'), topUpController.create);
router.get('/me', authRequired, topUpController.listMine);

export default router;

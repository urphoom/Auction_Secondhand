import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRequired, requireRole } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

/**
 * adminRoutes
 * - ถูก mount ที่: `/api/admin`
 * - logic อยู่ที่ `controllers/adminController.js`
 */
const router = Router();

router.use(authRequired, requireRole('admin'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const withdrawalUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'withdrawals');
if (!fs.existsSync(withdrawalUploadsDir)) {
  fs.mkdirSync(withdrawalUploadsDir, { recursive: true });
}

const withdrawalSlipStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, withdrawalUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `withdrawal-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const uploadWithdrawalSlip = multer({
  storage: withdrawalSlipStorage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/users', adminController.listUsers);
router.get('/users/:id/profile', adminController.getUserProfile);
router.get('/users/:id/activity', adminController.getUserActivity);
router.get('/stats', adminController.getStats);
router.get('/auctions', adminController.listAuctions);
router.patch('/auctions/:id', adminController.patchAuction);
router.post('/auctions/:id/cancel', adminController.cancelAuction);
router.get('/top-ups', adminController.listTopUps);
router.get('/top-ups/:id/logs', adminController.getTopUpLogs);
router.get('/withdrawals', adminController.listWithdrawals);
router.get('/withdrawals/:id/logs', adminController.getWithdrawalLogs);
router.post('/withdrawals/:id/approve', uploadWithdrawalSlip.single('slip'), adminController.approveWithdrawal);
router.post('/withdrawals/:id/reject', adminController.rejectWithdrawal);
router.post('/top-ups/:id/approve', adminController.approveTopUp);
router.post('/top-ups/:id/reject', adminController.rejectTopUp);
router.patch('/users/:id', adminController.patchUser);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/auctions/:id', adminController.deleteAuction);
router.post('/users/:id/add-funds', adminController.addFunds);
router.post('/users/:id/deduct-funds', adminController.deductFunds);

export default router;

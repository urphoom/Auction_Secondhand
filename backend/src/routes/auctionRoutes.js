import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRequired } from '../middleware/auth.js';
import * as auctionController from '../controllers/auctionController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

/**
 * auctionRoutes
 * - ถูก mount ที่: `/api/auctions`
 * - logic อยู่ที่ `controllers/auctionController.js`
 * - หมายเหตุ: path ตายตัวต้องอยู่ก่อน `/:id`
 */
const router = Router();

router.get('/active', auctionController.getActive);
router.get('/my-active-count', authRequired, auctionController.getMyActiveCount);
router.get('/my-listing-counts', authRequired, auctionController.getMyListingCounts);
router.get('/:id/highest-bid', auctionController.getHighestBid);
router.get('/:id/top-bidders', auctionController.getTopBidders);
router.get('/', auctionController.list);
router.get('/my-auctions', authRequired, auctionController.getMyAuctions);
router.get('/my-bid-history', authRequired, auctionController.getMyBidHistory);
router.get('/:id/has-bid', authRequired, auctionController.hasBid);
router.post('/:id/finalize', auctionController.finalize);
router.get('/:id', auctionController.getById);
router.get('/:id/bids/owner', authRequired, auctionController.getBidsOwner);
router.post(
  '/',
  authRequired,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
  ]),
  auctionController.create
);
router.put('/:id', authRequired, upload.single('image'), auctionController.update);
router.patch(
  '/:id/edit',
  authRequired,
  upload.fields([{ name: 'images', maxCount: 5 }]),
  auctionController.edit
);
router.delete('/:id', authRequired, auctionController.remove);
router.post('/:id/bids', authRequired, auctionController.placeBid);
router.post('/:id/buy-now', authRequired, auctionController.buyNow);

export default router;

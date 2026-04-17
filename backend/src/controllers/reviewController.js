import { getPool } from '../utils/db.js';

// ฟังก์ชันภายใน (ไม่ใช่ route) — หลังสร้างรีวิว คำนวณคะแนนเฉลี่ยจาก order ที่ completed แล้วอัปเดต users
async function updateSellerAverageRating(conn, sellerId) {
  const [rows] = await conn.query(
    `SELECT AVG(r.rating) AS avg_rating, COUNT(r.id) AS review_count
     FROM reviews r
     JOIN payment_transactions pt ON pt.id = r.order_id
     WHERE r.seller_id = ? AND pt.status = 'completed'`,
    [sellerId]
  );
  const avg = rows?.[0]?.avg_rating ? Number(rows[0].avg_rating) : 0;
  const count = rows?.[0]?.review_count ? Number(rows[0].review_count) : 0;
  await conn.query('UPDATE users SET average_rating = ?, review_count = ? WHERE id = ?', [avg, count, sellerId]);
  return avg;
}

/**
 * reviewController
 * - ใช้กับหน้า: ให้คะแนนหลังซื้อสำเร็จ / ดูรีวิวร้านค้า (หน้า seller / order)
 * - mount จริงที่: `/api/reviews` (`routes/reviewRoutes.js`)
 */
// POST /api/reviews — ผู้ชนะประมูลสร้างรีวิวได้ครั้งเดียวต่อ order (order ต้อง completed)
export async function create(req, res) {
  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    const orderId = Number(req.body.order_id);
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : null;

    if (!orderId || Number.isNaN(orderId)) {
      return res.status(400).json({ message: 'order_id is required' });
    }
    if (!rating || Number.isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    await conn.beginTransaction();

    const [txRows] = await conn.query(
      `SELECT id, auction_id, winner_id, seller_id, status
       FROM payment_transactions
       WHERE id = ?
       FOR UPDATE`,
      [orderId]
    );
    if (!txRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    const tx = txRows[0];
    if (Number(tx.winner_id) !== Number(req.user.id)) {
      await conn.rollback();
      return res.status(403).json({ message: 'You are not the winner of this order' });
    }
    if (tx.status !== 'completed') {
      await conn.rollback();
      return res.status(400).json({ message: "Order status must be 'completed' to review" });
    }

    const [existing] = await conn.query('SELECT id FROM reviews WHERE order_id = ? LIMIT 1 FOR UPDATE', [orderId]);
    if (existing.length) {
      await conn.rollback();
      return res.status(409).json({ message: 'Review already submitted for this order' });
    }

    const [result] = await conn.query(
      `INSERT INTO reviews (order_id, auction_id, seller_id, buyer_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, tx.auction_id, tx.seller_id, req.user.id, rating, comment || null]
    );

    const avg = await updateSellerAverageRating(conn, tx.seller_id);
    await conn.commit();

    const [reviewRows] = await pool.query(
      `SELECT r.*, u.username AS buyer_username
       FROM reviews r
       JOIN users u ON u.id = r.buyer_id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.json({ review: reviewRows[0], seller_average_rating: avg });
  } catch (e) {
    try {
      await conn.rollback();
    } catch {}
    res.status(500).json({ message: e.message || 'Failed to create review' });
  } finally {
    conn.release();
  }
}

// GET /api/reviews/order/:orderId — ดึงรีวิวของ order (เฉพาะ buyer หรือ seller ของ order นั้น)
export async function getByOrder(req, res) {
  const pool = await getPool();
  const orderId = Number(req.params.orderId);
  if (!orderId || Number.isNaN(orderId)) return res.status(400).json({ message: 'Invalid order id' });

  const [rows] = await pool.query(
    `SELECT r.*, buyer.username AS buyer_username, seller.username AS seller_username, a.title AS auction_title
     FROM reviews r
     JOIN users buyer ON buyer.id = r.buyer_id
     JOIN users seller ON seller.id = r.seller_id
     JOIN auctions a ON a.id = r.auction_id
     WHERE r.order_id = ?
     LIMIT 1`,
    [orderId]
  );
  if (!rows.length) return res.json(null);

  const review = rows[0];
  if (Number(review.buyer_id) !== Number(req.user.id) && Number(review.seller_id) !== Number(req.user.id)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  return res.json(review);
}

export async function listBySeller(req, res) {
  const pool = await getPool();
  const sellerId = Number(req.params.sellerId);
  if (!sellerId || Number.isNaN(sellerId)) return res.status(400).json({ message: 'Invalid seller id' });

  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at,
            buyer.username AS buyer_username,
            a.title AS auction_title,
            r.order_id
     FROM reviews r
     JOIN users buyer ON buyer.id = r.buyer_id
     JOIN auctions a ON a.id = r.auction_id
     WHERE r.seller_id = ?
     ORDER BY r.created_at DESC
     LIMIT 100`,
    [sellerId]
  );

  res.json(rows);
}

// GET /api/reviews/seller/:sellerId/page — ข้อมูล seller + รีวิว (ใช้โหลดหน้าโปรไฟล์ร้าน)
export async function sellerPage(req, res) {
  const pool = await getPool();
  const sellerId = Number(req.params.sellerId);
  if (!sellerId || Number.isNaN(sellerId)) return res.status(400).json({ message: 'Invalid seller id' });

  const [[seller]] = await pool.query(
    'SELECT id, username, average_rating, review_count FROM users WHERE id = ? LIMIT 1',
    [sellerId]
  );
  if (!seller) return res.status(404).json({ message: 'Seller not found' });

  const [reviews] = await pool.query(
    `SELECT r.id, r.rating, r.comment, r.created_at,
            buyer.username AS buyer_username,
            a.title AS auction_title,
            r.order_id
     FROM reviews r
     JOIN users buyer ON buyer.id = r.buyer_id
     JOIN auctions a ON a.id = r.auction_id
     JOIN payment_transactions pt ON pt.id = r.order_id
     WHERE r.seller_id = ? AND pt.status = 'completed'
     ORDER BY r.created_at DESC
     LIMIT 200`,
    [sellerId]
  );

  res.json({ seller, reviews });
}

import fs from 'fs';
import { getPool } from '../utils/db.js';
import { recordTopUpLog } from '../utils/topUpLogs.js';
import { NotificationService } from '../services/notificationService.js';

/**
 * topUpController
 * - ใช้กับหน้า: เติมเงิน / ประวัติคำขอเติมเงิน
 * - mount จริงที่: `/api/top-ups` (`routes/topUpRoutes.js` — field `slip` เป็น multipart)
 */
// POST /api/top-ups — ส่งคำขอเติมเงิน + อัปโหลดสลิป (แจ้ง user + admin)
export async function create(req, res) {
  const { amount, note } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'จำเป็นต้องอัปโหลดสลิปโอนเงิน' });
  }

  const numericAmount = Number(amount);
  if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ message: 'จำนวนเงินไม่ถูกต้อง' });
  }

  try {
    const pool = await getPool();
    const slipUrl = `/uploads/topups/${req.file.filename}`;
    const trimmedNote = note ? note.toString().trim() : null;

    const [result] = await pool.query(
      `INSERT INTO top_up_requests (user_id, amount, slip_url, note)
       VALUES (?, ?, ?, ?)`,
      [req.user.id, numericAmount, slipUrl, trimmedNote || null]
    );

    await recordTopUpLog(pool, {
      requestId: result.insertId,
      actorId: req.user.id,
      actorType: 'user',
      action: 'created',
      details: {
        amount: numericAmount,
        slipUrl,
        note: trimmedNote || null
      }
    });

    const [rows] = await pool.query(
      `SELECT tur.*, proc.username AS processed_by_username
       FROM top_up_requests tur
       LEFT JOIN users proc ON tur.processed_by = proc.id
       WHERE tur.id = ?`,
      [result.insertId]
    );

    const io = req.app.get('io');
    await NotificationService.createNotification(
      {
        userId: req.user.id,
        type: 'topup_created',
        title: 'ส่งคำขอเติมเงินเรียบร้อย',
        message: `เรารับคำขอเติมเงินจำนวน ฿${numericAmount.toFixed(2)} แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ`,
        context: {
          requestId: result.insertId,
          amount: numericAmount
        }
      },
      io
    );

    try {
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      await Promise.all(
        (admins || []).map((admin) =>
          NotificationService.createNotification(
            {
              userId: admin.id,
              type: 'topup_created',
              title: 'มีคำขอเติมเงินใหม่',
              message: `มีผู้ใช้ส่งคำขอเติมเงิน ฿${numericAmount.toFixed(2)} รอตรวจสอบ`,
              context: { requestId: result.insertId, amount: numericAmount, fromUserId: req.user.id }
            },
            io
          )
        )
      );
    } catch (e) {
      console.warn('Failed to notify admins (topup_created):', e.message);
    }

    res.status(201).json(rows[0]);
  } catch (error) {
    fs.unlink(req.file.path, () => {});
    console.error('Error creating top up request:', error);
    res.status(500).json({ message: 'ไม่สามารถสร้างคำขอเติมเงินได้' });
  }
}

// GET /api/top-ups/me — รายการคำขอเติมเงินของผู้ใช้ที่ล็อกอิน
export async function listMine(req, res) {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT tur.*, proc.username AS processed_by_username
       FROM top_up_requests tur
       LEFT JOIN users proc ON tur.processed_by = proc.id
       WHERE tur.user_id = ?
       ORDER BY tur.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error fetching user top up requests:', error);
    res.status(500).json({ message: 'ไม่สามารถโหลดข้อมูลคำขอเติมเงินได้' });
  }
}

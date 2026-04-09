import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { getPool } from '../utils/db.js';
import { recordWithdrawalLog } from '../utils/withdrawalLogs.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

function getWithdrawFee() {
  const raw = process.env.WITHDRAW_FEE;
  const n = Number(raw);
  if (raw === undefined || raw === null || raw === '') return 20;
  return Number.isFinite(n) && n >= 0 ? n : 20;
}

router.get('/me', authRequired, async (req, res) => {
  try {
    const pool = await getPool();
    const [rows] = await pool.query(
      `SELECT wr.*, u.username AS user_username, p.username AS processed_by_username
       FROM withdrawal_requests wr
       JOIN users u ON wr.user_id = u.id
       LEFT JOIN users p ON wr.processed_by = p.id
       WHERE wr.user_id = ?
       ORDER BY wr.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching withdrawal requests:', error);
    res.status(500).json({ message: 'ไม่สามารถโหลดคำขอถอนเงินได้' });
  }
});

router.post('/', authRequired, async (req, res) => {
  const { amount, bankName, accountNumber, acceptedTerms } = req.body;

  if (!acceptedTerms) {
    return res.status(400).json({ message: 'กรุณายอมรับเงื่อนไขก่อนส่งคำขอถอนเงิน' });
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ message: 'จำนวนเงินไม่ถูกต้อง' });
  }

  const trimmedBank = (bankName || '').toString().trim();
  const trimmedAccount = (accountNumber || '').toString().trim();
  if (!trimmedBank) return res.status(400).json({ message: 'กรุณาเลือกธนาคาร' });
  if (!trimmedAccount || trimmedAccount.length < 6) return res.status(400).json({ message: 'กรุณากรอกเลขบัญชีให้ถูกต้อง' });

  const fee = getWithdrawFee();
  const payoutAmount = Number((numericAmount - fee).toFixed(2));
  if (payoutAmount <= 0) {
    return res.status(400).json({ message: 'จำนวนเงินต้องมากกว่าค่าธรรมเนียม' });
  }

  const pool = await getPool();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [userRows] = await conn.query('SELECT id, balance, username FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    if (!userRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRows[0];
    if (Number(user.balance) < numericAmount) {
      await conn.rollback();
      return res.status(400).json({ message: 'ยอดเงินไม่เพียงพอสำหรับการถอน' });
    }

    await conn.query('UPDATE users SET balance = balance - ? WHERE id = ?', [numericAmount, req.user.id]);

    const [result] = await conn.query(
      `INSERT INTO withdrawal_requests (user_id, amount, fee, payout_amount, bank_name, account_number, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, numericAmount, fee, payoutAmount, trimmedBank, trimmedAccount]
    );

    await recordWithdrawalLog(conn, {
      requestId: result.insertId,
      actorId: req.user.id,
      actorType: 'user',
      action: 'created',
      details: {
        amount: numericAmount,
        fee,
        payoutAmount,
        bankName: trimmedBank,
        accountNumber: trimmedAccount
      }
    });

    await conn.commit();

    const io = req.app.get('io');
    await NotificationService.createNotification(
      {
        userId: req.user.id,
        type: 'withdrawal_created',
        title: 'ส่งคำขอถอนเงินเรียบร้อย',
        message: `คำขอถอนเงิน ฿${numericAmount.toFixed(2)} ถูกส่งแล้ว (ค่าธรรมเนียม ฿${fee.toFixed(2)}) สถานะ: รอตรวจสอบ`,
        context: {
          requestId: result.insertId,
          amount: numericAmount,
          fee,
          payoutAmount
        }
      },
      io
    );

    // Notify all admins about new withdrawal request
    try {
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      await Promise.all(
        (admins || []).map((admin) =>
          NotificationService.createNotification(
            {
              userId: admin.id,
              type: 'withdrawal_created',
              title: 'มีคำขอถอนเงินใหม่',
              message: `มีผู้ใช้ส่งคำขอถอนเงิน ฿${numericAmount.toFixed(2)} รอตรวจสอบ`,
              context: { requestId: result.insertId, amount: numericAmount, fromUserId: req.user.id }
            },
            io
          )
        )
      );
    } catch (e) {
      console.warn('Failed to notify admins (withdrawal_created):', e.message);
    }

    const [rows] = await pool.query('SELECT * FROM withdrawal_requests WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    await conn.rollback();
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ message: 'ไม่สามารถส่งคำขอถอนเงินได้' });
  } finally {
    conn.release();
  }
});

export default router;


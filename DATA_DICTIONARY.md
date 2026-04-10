# Data Dictionary — Auction-App (MySQL)

เอกสารนี้อธิบายโครงสร้างฐานข้อมูลหลักของโปรเจกต์ โดยอ้างอิงจาก `backend/src/scripts/init-db.js` และสคริปต์เสริม `backend/src/scripts/create-payment-system.js` (บางตารางอาจมีเฉพาะเมื่อรันสคริปต์นั้น)

**ข้อสังเกตทั่วไป**

- ชนิด `INT` / `INT UNSIGNED` อาจไม่สอดคล้องกันทุกตารางในฐานข้อมูลจริง (มีการ patch แบบ best-effort ใน init)
- คอลัมน์ `DECIMAL(12,2)` / `DECIMAL(10,2)` ใช้เก็บจำนวนเงิน (บาท)
- ตาราง `bids` รองรับ **ประวัติการบิดหลายแถวต่อ user ต่อการประมูล** (แต่ละครั้งที่บิดสูงขึ้นเป็นแถวใหม่)

---

## 1. `users`

ผู้ใช้ระบบ (ผู้ซื้อ/ผู้ขาย/แอดมิน)

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT AUTO_INCREMENT | NO | PK | รหัสผู้ใช้ |
| `username` | VARCHAR(100) | NO | UNIQUE | ชื่อผู้ใช้เข้าสู่ระบบ |
| `password` | VARCHAR(255) | NO | | รหัสผ่าน (เก็บแบบ hash) |
| `role` | ENUM('user','admin') | NO | | บทบาท: ผู้ใช้ทั่วไป / ผู้ดูแลระบบ |
| `balance` | DECIMAL(12,2) | NO | | ยอดเงินในบัญชี (ใช้หัก/คืนตามกติกาบิดและคำขอ) |
| `average_rating` | DECIMAL(3,2) | NO | | คะแนนเฉลี่ยจากรีวิว (cache) |
| `review_count` | INT | NO | | จำนวนรีวิวที่นับเข้า cache |

**FK / ความสัมพันธ์:** ถูกอ้างอิงจาก `auctions.user_id`, `bids.user_id`, `payment_transactions`, `notifications`, ฯลฯ

---

## 2. `auctions`

รายการประมูล

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT AUTO_INCREMENT | NO | PK | รหัสการประมูล |
| `title` | VARCHAR(255) | NO | | ชื่อสินค้า/หัวข้อ |
| `description` | TEXT | YES | | รายละเอียด |
| `image` | VARCHAR(255) | YES | | URL รูปหลัก (legacy) |
| `images` | JSON | YES | | อาร์เรย์ path รูป (สูงสุด 5 ในแอป) |
| `start_price` | DECIMAL(10,2) | NO | | ราคาเริ่มต้น |
| `current_price` | DECIMAL(10,2) | NO | | ราคาปัจจุบัน (increment) |
| `end_time` | DATETIME | NO | IDX | เวลาสิ้นสุดการประมูล |
| `status` | ENUM('active','ended','cancelled') | NO | IDX | สถานะการประมูล |
| `winner_id` | INT | YES | FK | ผู้ชนะ (อ้างอิง `users.id`) เมื่อสรุปผลแล้ว |
| `user_id` | INT | NO | FK, IDX | ผู้ขาย (เจ้าของการประมูล) |
| `bid_type` | ENUM('increment','sealed') | NO | | แบบเปิดราคา / ปิดซอง |
| `minimum_increment` | DECIMAL(10,2) | YES | | ขั้นต่ำต่อการเพิ่มราคา (increment) |
| `buy_now_price` | DECIMAL(10,2) | YES | | ราคาซื้อทันที (ถ้ามี) |

---

## 3. `bids`

ประวัติการเสนอราคา (หนึ่งแถวต่อหนึ่งครั้งที่บิด)

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT AUTO_INCREMENT | NO | PK | รหัสบิด |
| `auction_id` | INT | NO | FK, IDX | การประมูล |
| `user_id` | INT | NO | FK, IDX | ผู้บิด |
| `amount` | DECIMAL(10,2) | NO | | ยอดที่เสนอในรอบนั้น |
| `created_at` | DATETIME | NO | | เวลาบันทึก |

---

## 4. `payment_transactions`

คำสั่งซื้อ/ออเดอร์หลังชนะประมูล (เชื่อมกระบวนการชำระเงินและจัดส่ง)

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT AUTO_INCREMENT | NO | PK | รหัสธุรกรรม (ใช้เป็น order ในหน้ารีวิว) |
| `auction_id` | INT | NO | FK, IDX | การประมูล |
| `winner_id` | INT | NO | FK, IDX | ผู้ซื้อที่ชนะ |
| `seller_id` | INT | NO | FK, IDX | ผู้ขาย |
| `amount` | DECIMAL(12,2) | NO | | จำนวนเงิน |
| `status` | ENUM('pending','paid','shipped','delivered','completed','cancelled') | NO | IDX | สถานะออเดอร์ |
| `payment_method` | VARCHAR(50) | YES | | วิธีชำระ (ค่าเริ่ม escrow) |
| `payment_reference` | VARCHAR(255) | YES | | อ้างอิงการชำระ |
| `created_at` | DATETIME | NO | | สร้างเมื่อ |
| `paid_at` | DATETIME | YES | | ชำระเมื่อ |
| `shipped_at` | DATETIME | YES | | จัดส่งเมื่อ |
| `delivered_at` | DATETIME | YES | | ส่งถึงเมื่อ |
| `completed_at` | DATETIME | YES | | เสร็จสมบูรณ์เมื่อ |

---

## 5. `reviews`

รีวิวจากผู้ซื้อต่อผู้ขาย (หลัง order)

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัสรีวิว |
| `order_id` | INT | NO | FK, UNIQUE | อ้าง `payment_transactions.id` |
| `auction_id` | INT UNSIGNED | NO | FK, UNIQUE(buyer) | การประมูล |
| `seller_id` | INT UNSIGNED | NO | FK | ผู้ขาย |
| `buyer_id` | INT UNSIGNED | NO | FK | ผู้ซื้อ |
| `rating` | TINYINT UNSIGNED | NO | CHECK 1–5 | คะแนน |
| `comment` | TEXT | YES | | ความคิดเห็น |
| `created_at` | TIMESTAMP | NO | | สร้างเมื่อ |
| `updated_at` | TIMESTAMP | NO | | อัปเดตล่าสุด |

**Trigger:** `trg_reviews_after_insert` (ถ้าสร้างได้) อัปเดต `users.average_rating` / `review_count`

---

## 6. `chat_rooms`

ห้องแชท

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัสห้อง |
| `name` | VARCHAR(255) | NO | | ชื่อห้อง |
| `description` | TEXT | YES | | คำอธิบาย |
| `created_by` | INT UNSIGNED | NO | FK | ผู้สร้าง (มักเป็นผู้ขาย) |
| `auction_id` | INT UNSIGNED | YES | FK, IDX | เชื่อมการประมูล (ถ้ามี) |
| `created_at` | DATETIME | NO | IDX | สร้างเมื่อ |

---

## 7. `chat_messages`

ข้อความในห้องแชท

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัสข้อความ |
| `room_id` | INT UNSIGNED | NO | FK, IDX | ห้อง |
| `user_id` | INT UNSIGNED | NO | FK, IDX | ผู้ส่ง |
| `message` | TEXT | YES | | ข้อความ (ถ้า type = text) |
| `image_url` | VARCHAR(500) | YES | | URL รูป (ถ้า type = image) |
| `message_type` | ENUM('text','image') | NO | | ชนิดข้อความ |
| `created_at` | DATETIME | NO | | เวลาส่ง |

---

## 8. `top_up_requests`

คำขอเติมเงิน

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัสคำขอ |
| `user_id` | INT UNSIGNED | NO | FK | ผู้ขอ |
| `amount` | DECIMAL(12,2) | NO | | จำนวนเงิน |
| `slip_url` | VARCHAR(255) | YES | | path สลิป |
| `status` | ENUM('pending','approved','rejected') | NO | IDX | สถานะ |
| `note` | TEXT | YES | | หมายเหตุ |
| `processed_by` | INT UNSIGNED | YES | FK | แอดมินที่ดำเนินการ |
| `processed_at` | DATETIME | YES | | เวลาดำเนินการ |
| `created_at` | DATETIME | NO | IDX | สร้างเมื่อ |

---

## 9. `top_up_request_logs`

บันทึกกิจกรรมคำขอเติมเงิน

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัส log |
| `request_id` | INT UNSIGNED | NO | FK, IDX | คำขอ |
| `actor_id` | INT UNSIGNED | YES | FK | ผู้กระทำ (null = ระบบ) |
| `actor_type` | ENUM('user','admin','system') | NO | | ประเภทผู้กระทำ |
| `action` | VARCHAR(100) | NO | | การกระทำ (เช่น created) |
| `details` | TEXT | YES | | รายละเอียด JSON/text |
| `created_at` | DATETIME | NO | IDX | เวลา |

---

## 10. `withdrawal_requests`

คำขอถอนเงิน

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัสคำขอ |
| `user_id` | INT UNSIGNED | NO | FK, IDX | ผู้ขอ |
| `amount` | DECIMAL(12,2) | NO | | ยอดขอถอน |
| `fee` | DECIMAL(12,2) | NO | | ค่าธรรมเนียม |
| `payout_amount` | DECIMAL(12,2) | NO | | ยอดโอนจริงหลังหัก fee |
| `bank_name` | VARCHAR(100) | NO | | ธนาคาร |
| `account_number` | VARCHAR(50) | NO | | เลขบัญชี |
| `status` | ENUM('pending','approved','rejected') | NO | IDX | สถานะ |
| `note` | TEXT | YES | | หมายเหตุ |
| `slip_url` | VARCHAR(255) | YES | | สลิปโอน (ฝั่งแอดมิน) |
| `processed_by` | INT UNSIGNED | YES | FK | แอดมินที่ดำเนินการ |
| `processed_at` | DATETIME | YES | | เวลาดำเนินการ |
| `created_at` | DATETIME | NO | IDX | สร้างเมื่อ |

---

## 11. `withdrawal_request_logs`

บันทึกกิจกรรมคำขอถอนเงิน

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัส log |
| `request_id` | INT UNSIGNED | NO | FK, IDX | คำขอ |
| `actor_id` | INT UNSIGNED | YES | FK | ผู้กระทำ |
| `actor_type` | ENUM('user','admin','system') | NO | | ประเภทผู้กระทำ |
| `action` | VARCHAR(100) | NO | | การกระทำ |
| `details` | TEXT | YES | | รายละเอียด |
| `created_at` | DATETIME | NO | IDX | เวลา |

---

## 12. `admin_audit_logs`

บันทึกการกระทำของแอดมิน

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT UNSIGNED AUTO_INCREMENT | NO | PK | รหัส log |
| `admin_id` | INT UNSIGNED | NO | FK, IDX | แอดมิน |
| `action` | VARCHAR(100) | NO | | ชื่อ action |
| `target_type` | VARCHAR(100) | YES | | ประเภทเป้าหมาย |
| `target_id` | INT UNSIGNED | YES | | รหัสเป้าหมาย |
| `details` | TEXT | YES | | รายละเอียด (มักเป็น JSON) |
| `created_at` | DATETIME | NO | IDX | เวลา |

---

## 13. `notifications`

การแจ้งเตือนในแอป (รวมถึงของ user และของแอดมิน)

| Column | Type | Null | Key | Description |
|--------|------|------|-----|-------------|
| `id` | INT AUTO_INCREMENT | NO | PK | รหัสแจ้งเตือน |
| `user_id` | INT | NO | FK, IDX | ผู้รับ |
| `auction_id` | INT UNSIGNED | YES | FK, IDX | อ้างการประมูล (ถ้ามี) |
| `type` | ENUM(ดูด้านล่าง) | NO | | ประเภทแจ้งเตือน |
| `title` | VARCHAR(255) | NO | | หัวข้อ |
| `message` | TEXT | NO | | ข้อความ |
| `context` | JSON | YES | | ข้อมูลเสริม (เช่น `requestId`, `amount`) |
| `is_read` | BOOLEAN | NO | IDX | อ่านแล้วหรือยัง |
| `created_at` | DATETIME | NO | IDX | เวลา |

**ค่า `type` (ตาม init-db):**

`auction_won`, `auction_lost`, `auction_ended`, `outbid`, `bid_refunded`,  
`topup_created`, `topup_approved`, `topup_rejected`,  
`withdrawal_created`, `withdrawal_approved`, `withdrawal_rejected`

---

## 14. ตารางเสริมจาก Payment System (อาจมีในฐานข้อมูลบางสภาพแวดล้อม)

สร้างจาก `create-payment-system.js` — ไม่ได้สร้างใน `init-db.js` โดยตรง

### 14.1 `shipping_info`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT PK | รหัส |
| `transaction_id` | INT FK | อ้าง `payment_transactions.id` |
| `shipping_address` | TEXT | ที่อยู่จัดส่ง |
| `shipping_method` | VARCHAR(100) | วิธีจัดส่ง |
| `tracking_number` | VARCHAR(255) | เลขพัสดุ |
| `estimated_delivery` | DATE | ประมาณการถึง |
| `actual_delivery` | DATE | ถึงจริง |
| `notes` | TEXT | หมายเหตุ |
| `created_at` / `updated_at` | DATETIME | เวลา |

**คอลัมน์เพิ่มจาก init (ถ้ามีตาราง):** `recipient_name`, `recipient_phone` — ใช้เก็บชื่อ/เบอร์ผู้รับ

### 14.2 `payment_escrow`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT PK | รหัส |
| `transaction_id` | INT FK | อ้างธุรกรรม |
| `escrow_amount` | DECIMAL(12,2) | ยอดกันวงเงิน |
| `platform_fee` | DECIMAL(12,2) | ค่าธรรมเนียมแพลตฟอร์ม |
| `seller_amount` | DECIMAL(12,2) | ยอดที่เกี่ยวกับผู้ขาย |
| `status` | ENUM('held','released','refunded') | สถานะ escrow |
| `held_at` / `released_at` / `refunded_at` | DATETIME | เวลาเหตุการณ์ |

### 14.3 `payment_notifications`

แจ้งเตือนเฉพาะกระบวนการชำระเงิน (แยกจาก `notifications` หลัก)

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT PK | รหัส |
| `transaction_id` | INT FK | ธุรกรรม |
| `user_id` | INT FK | ผู้รับ |
| `type` | ENUM('payment_pending', 'payment_received', 'item_shipped', 'item_delivered', 'payment_released', 'payment_refunded') | ประเภท |
| `title` | VARCHAR(255) | หัวข้อ |
| `message` | TEXT | ข้อความ |
| `is_read` | BOOLEAN | อ่านแล้ว |
| `created_at` | DATETIME | เวลา |

---

## อัปเดตสคีมา

รันจากโฟลเดอร์ `backend`:

```bash
npm run db:init
```

สำหรับสคริปต์ payment system (ถ้าใช้): รันด้วย `node src/scripts/create-payment-system.js` จากโฟลเดอร์ `backend` (ไม่มี npm script ใน `package.json` ปัจจุบัน)

---

*เอกสารนี้สรุปจากโค้ด init ณ เวลาที่สร้าง หากมี migration/สคริปต์เพิ่มเติมในทีม ควรอัปเดตตาราง/คอลัมน์ให้สอดคล้องกับฐานข้อมูลจริง*

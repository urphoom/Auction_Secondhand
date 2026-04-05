# Auction App

แอปประมูลสินค้าแบบ full-stack — React (Vite) + Express + MySQL + Socket.IO สำหรับประมูลแบบเรียลไทม์ แชท แจ้งเตือน การชำระเงิน เติมเงิน ถอนเงิน และแผงผู้ดูแลระบบ

## เทคโนโลยี

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 18, Vite 5, React Router, Axios, Socket.IO Client, Lucide |
| Backend | Node.js (ESM), Express 4, mysql2, JWT, Multer, Socket.IO |
| Database | MySQL / MariaDB (InnoDB) |

## ความต้องการของระบบ

- **Node.js** 18+ (แนะนำ LTS)
- **MySQL** หรือ **MariaDB** พร้อมสิทธิ์สร้างฐานข้อมูล/ตาราง

## โครงสร้างโปรเจกต์

```
Auction-App/
├── backend/          # API + Socket.IO + อัปโหลดไฟล์
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── scripts/init-db.js   # สร้าง/อัปเดต schema
│   │   └── ...
│   └── uploads/       # รูปประมูล, สลิป, ฯลฯ
└── frontend/         # SPA (Vite)
    └── src/
```

## การตั้งค่า Backend

1. สร้างฐานข้อมูลใน MySQL (ชื่อตาม `DB_NAME` ด้านล่าง)

2. สร้างไฟล์ `backend/.env` (อ้างอิงจากตัวอย่าง):

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=auction_app

# Server
PORT=4000
JWT_SECRET=เปลี่ยนเป็นค่าลับยาวๆ_ใน_production

# CORS / Socket.IO — origin ของ frontend (Vite default = 5173)
CLIENT_ORIGIN=http://localhost:5173

# ค่าธรรมเนียมถอน (ถ้าใช้ใน logic ฝั่ง server — ดู withdrawalRoutes)
# WITHDRAW_FEE=20
```

3. ติดตั้งแพ็กเกจและสร้างตาราง:

```bash
cd backend
npm install
npm run db:init
```

4. รันเซิร์ฟเวอร์:

```bash
npm run dev    # nodemon — พัฒนา
# หรือ
npm start      # production
```

- API base: `http://localhost:4000/api`
- Health check: `GET http://localhost:4000/api/health`
- ไฟล์ static อัปโหลด: `http://localhost:4000/uploads/...`

## การตั้งค่า Frontend

1. (ไม่บังคับ) สร้าง `frontend/.env` ถ้า backend ไม่ได้รันที่ค่า default:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_BACKEND_ORIGIN=http://localhost:4000
# แสดงค่าธรรมเนียมถอนในหน้า UI (ต้องสอดคล้องกับ backend ถ้ามี)
# VITE_WITHDRAW_FEE=20
```

2. รัน:

```bash
cd frontend
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ URL ที่ Vite แสดง (ปกติ `http://localhost:5173`)

### Build สำหรับ production

```bash
cd frontend
npm run build
npm run preview   # ทดสอบ build แบบ static
```

ตั้ง `VITE_*` ให้ชี้ไปที่โดเมน/API จริงของ backend

## สคริปต์ที่สำคัญ

| คำสั่ง | ที่อยู่ | คำอธิบาย |
|--------|---------|----------|
| `npm run db:init` | `backend` | สร้าง/อัปเดตตาราง (users, auctions, bids, chat, payments, top-ups, withdrawals, reviews, ฯลฯ) |
| `npm run dev` | `backend` / `frontend` | โหมดพัฒนา |

> หลังอัปเดตโค้ดที่เปลี่ยน schema ให้รัน `npm run db:init` อีกครั้ง (สคริปต์ใช้ `CREATE IF NOT EXISTS` / `ALTER` ที่รองรับได้)

## ฟีเจอร์หลัก (สรุป)

- สมัคร / เข้าสู่ระบบ (JWT), บทบาท user / admin
- สร้างและดูรายการประมูล, รูปหลายรูป, **ประมูลแบบเปิด (increment)** และ **แบบปิด (sealed)**, Buy Now
- ประมูลแบบเรียลไทม์ผ่าน Socket.IO
- แชทระหว่างผู้ใช้, แจ้งเตือน (รวม real-time)
- กระเป๋าเงิน / ยอดคงเหลือ, **เติมเงิน** (ส่งหลักฐาน), **ชำระค่าสินค้าหลังชนะ**
- **ถอนเงิน** (คำขอ, ค่าธรรมเนียม), แอดมินอนุมัติ/ปฏิเสธพร้อมสลิป
- **รีวิวผู้ขาย** หลังคำสั่งซื้อเสร็จ, คะแนนเฉลี่ยบนโปรไฟล์ผู้ขาย
- แผงแอดมิน: ผู้ใช้, ประมูล, เติมเงิน, ถอนเงิน, ฯลฯ

## แก้ปัญหาเบื้องต้น

| อาการ | แนวทาง |
|--------|--------|
| `Network Error` / เรียก API ไม่ติด | ตรวจว่า backend รันที่พอร์ต 4000 และ `VITE_API_URL` ถูกต้อง |
| Socket ไม่เชื่อม | ตั้ง `VITE_SOCKET_URL` และ `CLIENT_ORIGIN` ให้ตรงกับ URL ของ frontend |
| Error เกี่ยวกับตาราง / column | รัน `npm run db:init` ใน `backend` แล้วรีสตาร์ทเซิร์ฟเวอร์ |
| รูปไม่แสดง | ตรวจ `VITE_BACKEND_ORIGIN` และ path ใต้ `/uploads` |

## License

โปรเจกต์นี้ใช้ภายในหรือตามที่เจ้าของ repo กำหนด

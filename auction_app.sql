-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 10, 2026 at 08:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `auction_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_audit_logs`
--

CREATE TABLE `admin_audit_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `admin_id` int(10) UNSIGNED NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(100) DEFAULT NULL,
  `target_id` int(10) UNSIGNED DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_audit_logs`
--

INSERT INTO `admin_audit_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES
(1, 2, 'update_user', 'user', 1, '{\"role\":\"admin\"}', '2025-11-08 00:22:52'),
(2, 25, 'manual_add_funds', 'user', 27, '{\"amount\":500,\"note\":null}', '2025-11-08 01:02:16'),
(3, 25, 'manual_deduct_funds', 'user', 27, '{\"amount\":500,\"note\":null}', '2025-11-08 01:02:27'),
(4, 25, 'approve_top_up', 'top_up', 1, '{\"amount\":500,\"note\":null}', '2025-11-08 01:02:37'),
(5, 25, 'update_auction', 'auction', 75, '{\"fields\":{\"title\":\"รองเท้า\",\"description\":null,\"bid_type\":\"increment\",\"minimum_increment\":100,\"buy_now_price\":null,\"end_time\":\"2025-11-08T10:40:00.000Z\"}}', '2025-11-08 01:04:23'),
(6, 25, 'update_auction', 'auction', 75, '{\"fields\":{\"title\":\"รองเท้า\",\"description\":null,\"bid_type\":\"increment\",\"minimum_increment\":100,\"buy_now_price\":null,\"end_time\":\"2025-11-08T05:40:00.000Z\"}}', '2025-11-08 01:04:37'),
(10, 25, 'reject_top_up', 'top_up', 2, '{\"amount\":2000,\"note\":null}', '2025-11-08 01:37:10'),
(11, 25, 'approve_top_up', 'top_up', 3, '{\"amount\":2500,\"note\":null}', '2025-11-08 01:37:40'),
(12, 25, 'approve_top_up', 'top_up', 4, '{\"amount\":45000,\"note\":\"กำลังโอนเงิน\"}', '2025-11-08 02:37:45'),
(13, 25, 'approve_top_up', 'top_up', 5, '{\"amount\":5000,\"note\":null}', '2025-11-08 03:02:07'),
(14, 25, 'manual_add_funds', 'user', 27, '{\"amount\":5000,\"note\":null}', '2025-11-08 03:02:23'),
(15, 25, 'approve_top_up', 'top_up', 6, '{\"amount\":2500000,\"note\":null}', '2025-11-08 03:05:49'),
(16, 25, 'update_auction', 'auction', 78, '{\"fields\":{\"title\":\"รองเท้า\",\"description\":null,\"bid_type\":\"increment\",\"minimum_increment\":1,\"buy_now_price\":90000,\"end_time\":\"2025-11-07T21:21:00.000Z\"}}', '2025-11-08 04:20:48'),
(17, 25, 'update_auction', 'auction', 80, '{\"fields\":{\"title\":\"นาฬิกา\",\"description\":\"นาฬิกานาฬิกานาฬิกา\",\"bid_type\":\"increment\",\"minimum_increment\":100,\"buy_now_price\":400000,\"end_time\":\"2025-11-07T22:08:00.000Z\"}}', '2025-11-08 05:06:55'),
(18, 25, 'approve_top_up', 'top_up', 7, '{\"amount\":900000,\"note\":null}', '2026-03-11 14:40:01'),
(19, 25, 'approve_withdrawal', 'withdrawal', 1, '{\"amount\":520,\"fee\":20,\"payoutAmount\":500,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1773218331464-811183345.jpg\",\"note\":null}', '2026-03-11 15:38:51'),
(20, 25, 'reject_withdrawal', 'withdrawal', 2, '{\"amount\":520,\"note\":null}', '2026-03-11 15:42:31'),
(21, 25, 'approve_top_up', 'top_up', 8, '{\"amount\":500000,\"note\":null}', '2026-03-13 00:45:09'),
(22, 25, 'manual_add_funds', 'user', 32, '{\"amount\":50000,\"note\":null}', '2026-03-13 00:46:07'),
(23, 25, 'approve_top_up', 'top_up', 9, '{\"amount\":35000,\"note\":null}', '2026-03-18 13:45:14'),
(24, 25, 'approve_top_up', 'top_up', 10, '{\"amount\":5000,\"note\":null}', '2026-03-18 13:46:40'),
(25, 25, 'manual_deduct_funds', 'user', 32, '{\"amount\":5000,\"note\":null}', '2026-03-18 13:52:39'),
(26, 25, 'approve_top_up', 'top_up', 11, '{\"amount\":5000,\"note\":null}', '2026-03-18 13:53:06'),
(27, 25, 'reject_top_up', 'top_up', 12, '{\"amount\":900,\"note\":null}', '2026-03-18 13:54:40'),
(28, 25, 'approve_withdrawal', 'withdrawal', 3, '{\"amount\":100,\"fee\":20,\"payoutAmount\":80,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1775754850370-865328615.jpg\",\"note\":null}', '2026-04-10 00:14:10'),
(29, 25, 'approve_top_up', 'top_up', 16, '{\"amount\":10000,\"note\":null}', '2026-04-10 07:55:54'),
(30, 25, 'approve_top_up', 'top_up', 15, '{\"amount\":500,\"note\":null}', '2026-04-10 07:55:56'),
(31, 25, 'approve_withdrawal', 'withdrawal', 4, '{\"amount\":1000,\"fee\":20,\"payoutAmount\":980,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1775784931200-79703688.jpg\",\"note\":null}', '2026-04-10 08:35:31');

-- --------------------------------------------------------

--
-- Table structure for table `auctions`
--

CREATE TABLE `auctions` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `start_price` decimal(10,2) NOT NULL,
  `current_price` decimal(10,2) NOT NULL,
  `end_time` datetime NOT NULL,
  `status` enum('active','ended','cancelled') NOT NULL DEFAULT 'active',
  `winner_id` int(11) DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `bid_type` enum('increment','sealed') NOT NULL DEFAULT 'increment',
  `minimum_increment` decimal(10,2) DEFAULT 1.00,
  `buy_now_price` decimal(10,2) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auctions`
--

INSERT INTO `auctions` (`id`, `title`, `description`, `image`, `start_price`, `current_price`, `end_time`, `status`, `winner_id`, `user_id`, `bid_type`, `minimum_increment`, `buy_now_price`, `images`) VALUES
(4, '11111', '11111', '/uploads/1759178560562-125586529.jpg', 11111.00, 12000.00, '2025-09-30 04:42:00', 'active', NULL, 2, 'increment', 1.00, NULL, NULL),
(5, 'This aa', 'For sale', '/uploads/1759178808951-159098616.png', 29999.00, 29999.00, '2025-09-30 05:46:00', 'active', NULL, 2, 'increment', 1.00, NULL, NULL),
(6, 'AEE', 'For Me', '/uploads/1759182349360-917374269.png', 2222.00, 2300.00, '2025-09-30 05:45:00', 'active', NULL, 5, 'increment', 1.00, NULL, NULL),
(7, 'Sale Egg', 'EAA', '/uploads/1759182429021-954178070.jpg', 2000.00, 3000.00, '2025-09-30 04:49:00', 'active', NULL, 5, 'increment', 1.00, NULL, NULL),
(8, 'The Card', 'The Alakazam Thebest card', '/uploads/1759183845099-327308000.png', 2900.00, 3000.00, '2025-09-30 05:11:00', 'active', NULL, 3, 'increment', 1.00, NULL, NULL),
(9, 'qweq', 'qwe', '/uploads/1759270320474-7106592.png', 123123.00, 200000.00, '2025-10-01 06:11:00', 'active', NULL, 2, 'increment', 1.00, NULL, NULL),
(10, 'The Best', 'EIEI Na', '/uploads/1759274214739-89850555.png', 200000.00, 400000.00, '2025-10-01 08:16:00', 'active', NULL, 2, 'increment', 1.00, NULL, NULL),
(11, 'EWWW', 'ew', '/uploads/1759278387888-981957184.png', 20000.00, 20000.00, '2025-10-01 09:26:00', 'active', NULL, 2, 'sealed', NULL, NULL, NULL),
(12, 'MYMY', 'WWW', '/uploads/1759279003361-135140941.jpg', 2000.00, 2200.00, '2025-10-08 07:35:00', 'active', NULL, 2, 'increment', 5.00, NULL, NULL),
(13, 'UMAN', 'QQQ', '/uploads/1759279468842-633562265.png', 100.00, 100.00, '2025-10-01 09:43:00', 'active', NULL, 4, 'sealed', NULL, NULL, NULL),
(14, 'QQQ', 'QQQ', '/uploads/1759279578022-7322729.jpg', 2000.00, 2000.00, '2025-10-01 09:46:00', 'active', NULL, 4, 'sealed', NULL, NULL, NULL),
(15, 'Test', 'QEEEE', '/uploads/1759283346171-232698515.jpg', 2000.00, 2000.00, '2025-10-01 10:00:00', 'active', NULL, 8, 'sealed', NULL, NULL, NULL),
(16, 'ถ้วยน้ำชาโบราณ', 'เป็นถ้วยน้ำชาสมัยเก่า โบราณมาก', '/uploads/1760724551429-221425373.jpg', 25000.00, 35000.00, '2025-10-18 02:10:00', 'active', NULL, 12, 'increment', 50.00, NULL, NULL),
(17, 'กาน้ำร้อนโบราณ', 'สวย สะอาด วัสดุดีเยี่่ยม จัดส่งไว', '/uploads/1760821217135-310683269.jpg', 500.00, 45000.00, '2025-10-19 05:01:00', 'active', NULL, 12, 'increment', 50.00, NULL, NULL),
(19, 'ถ้วยน้ำร้อน', 'ถ้วยน้ำร้อนถ้วยน้ำร้อน', '/uploads/1760821784593-371937424.jpg', 499.96, 2500.00, '2025-10-19 04:11:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(20, 'ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน', '', '/uploads/1760822161703-787644901.jpg', 5000.00, 5050.01, '2025-10-19 04:17:00', 'active', NULL, 12, 'increment', 50.00, NULL, NULL),
(25, 'ถ้วยน้ำร้อนถ้วยน้ำร้อน', 'ถ้วยน้ำร้อนถ้วยน้ำร้อน', '/uploads/1760823041447-670668415.jpg', 2000.00, 2600.00, '2025-10-19 04:32:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(26, '151515', '151515', '/uploads/1760823466170-716480122.jpg', 20000.00, 250000.00, '2025-10-19 04:39:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(27, '131313', '131313', '/uploads/1760824645808-11908590.jpg', 2222.00, 25000.00, '2025-10-19 04:58:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(28, '1411414', '141414', '/uploads/1760825279076-832620202.jpg', 1199.96, 1500.00, '2025-10-19 05:09:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(29, 'ถ้วยกาแฟไร', '', '/uploads/1760826249979-311113410.webp', 20000.00, 25000.00, '2025-10-19 05:25:00', 'active', NULL, 12, 'increment', 100.00, NULL, NULL),
(30, 'กาน้ำร้อน', '', '/uploads/1760826842703-64385010.jpg', 25000.00, 25000.00, '2025-10-19 05:35:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(31, 'กาไรปะ', '', '/uploads/1760828041338-765448349.jpg', 25000.00, 30000.00, '2025-10-19 05:55:00', 'active', NULL, 12, 'increment', 1.00, NULL, NULL),
(32, 'Test Auction for Payment System', 'This is a test auction to verify payment system works', '/uploads/test.jpg', 1000.00, 1500.00, '2025-10-19 06:00:07', 'active', NULL, 12, 'increment', 100.00, NULL, NULL),
(33, 'ไก่กา', '', '/uploads/1760828726298-696691590.jpg', 25000.00, 30000.00, '2025-10-19 06:06:00', 'active', NULL, 17, 'increment', 1.00, NULL, NULL),
(34, 'ไก่กาอาราเร่', '', '/uploads/1760829467651-244849786.jpg', 25000.00, 30000.00, '2025-10-19 06:19:00', 'active', NULL, 18, 'increment', 200.00, NULL, NULL),
(35, 'กาอะไรเนี่ยสวยจัง', 'กาอะไรเนี่ยสวยจังกาอะไรเนี่ยสวยจัง', '/uploads/1760829970276-388869411.jpg', 25000.00, 35000.00, '2025-10-19 06:27:00', 'active', NULL, 21, 'increment', 2500.00, NULL, NULL),
(36, 'ยังไงๆๆ', '', '/uploads/1760832256257-983582763.jpg', 50000.00, 55000.00, '2025-10-19 07:05:00', 'active', NULL, 21, 'increment', 1.00, NULL, NULL),
(37, 'asdasdasd', '', '/uploads/1760834177799-953544093.jpg', 20000.00, 25000.00, '2025-10-19 07:37:00', 'active', NULL, 21, 'increment', 1.00, NULL, NULL),
(38, 'กล้อง Nikon COOLPIX A900', 'Nikon COOLPIX A900', '/uploads/1761359747811-656826614.jpg', 9538.00, 9538.00, '2025-10-25 10:35:00', 'active', NULL, 22, 'increment', 50.00, NULL, NULL),
(39, 'นาฬิกา PATEK PHILIPPE', 'อันดับที่ 1 : 6,200,000 สวิสฟรังก์ ‘PATEK PHILIPPE’ The Triple Complication Ref. 5208T-010', '/uploads/1761392878609-918393574.jpg', 600000.00, 650000.00, '2025-10-25 18:49:00', 'active', NULL, 22, 'increment', 199.00, NULL, NULL),
(40, 'ล้อแม็ก YOKOHAMA iceGUARD7', 'ล้อแม็ก YOKOHAMA iceGUARD7', '/uploads/1761394846516-459339024.jpg', 250000.00, 255000.00, '2025-10-25 19:22:00', 'active', NULL, 22, 'increment', 5000.00, NULL, NULL),
(41, 'กีต้าร์ YAMAHA FG-301', 'กีต้าร์ YAMAHA FG-301', '/uploads/1761399376019-314500175.jpg', 250000.00, 260000.00, '2025-10-25 20:38:00', 'active', NULL, 22, 'increment', 2000.00, NULL, NULL),
(42, 'กาน้ำร้อนโปราณหายาก', 'กาน้ำร้อนโปราณหายาก', '/uploads/1761399917578-118040911.jpg', 250000.00, 260000.00, '2025-10-25 20:47:00', 'active', NULL, 22, 'increment', 2500.00, NULL, NULL),
(43, 'กาน้ำร้อน ร้อยละยี่', 'กาน้ำร้อน ร้อยละยี่', '/uploads/1761549298140-383390834.jpg', 250000.00, 300000.00, '2025-10-30 14:14:00', 'active', NULL, 22, 'increment', 250.00, NULL, NULL),
(44, 'แมวน้ำมูกไหล', 'แมวน้ำมูกไหล น่ากินมาก', '/uploads/1761810607090-161147364.jpg', 250000.00, 300000.00, '2025-10-30 14:51:00', 'active', NULL, 22, 'increment', 250.00, NULL, NULL),
(45, '限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ', '限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ', '/uploads/1762246853994-413843247.jpg', 260000.00, 270000.00, '2025-11-04 16:02:00', 'active', NULL, 22, 'increment', 2600.00, NULL, NULL),
(46, 'YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品', 'YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品', '/uploads/1762247486456-219897176.jpg', 200000.00, 200000.00, '2025-11-04 16:13:00', 'active', NULL, 22, 'sealed', NULL, NULL, NULL),
(47, 'K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪', 'K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪', '/uploads/1762248417026-316029793.jpg', 200000.00, 200000.00, '2025-11-04 16:28:00', 'active', NULL, 22, 'sealed', NULL, NULL, NULL),
(48, 'กาน้ำ', 'กาน้ำ', '/uploads/1762248938582-388670334.jpg', 250000.00, 300000.00, '2025-11-04 16:37:00', 'active', NULL, 22, 'increment', 1.00, NULL, NULL),
(49, 'รถประกอบ', 'รถประกอบ', '/uploads/1762249460770-148480503.jpg', 200000.00, 200000.00, '2025-11-04 16:47:00', 'active', NULL, 22, 'sealed', NULL, NULL, NULL),
(50, 'น้ำกา', '', '/uploads/1762250253676-307677306.webp', 200000.00, 200000.00, '2025-11-04 16:59:00', 'active', NULL, 22, 'sealed', NULL, NULL, NULL),
(51, 'GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き', 'GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き', '/uploads/1762254309866-339231842.jpg', 900000.00, 900000.00, '2025-11-04 18:08:00', 'active', NULL, 22, 'sealed', NULL, NULL, NULL),
(52, 'กล้องasdasd', 'กล้องasdasd', '/uploads/1762336375805-638151046.jpg', 200000.00, 200000.00, '2025-11-05 16:54:00', 'active', NULL, 22, 'increment', 5.00, 900000.00, NULL),
(53, 'กล้อง V2', '', '/uploads/1762336510077-762130371.jpg', 200000.00, 300000.00, '2025-11-05 16:56:00', 'active', NULL, 22, 'increment', 5.00, 300000.00, NULL),
(54, 'กาน้ำร้อนโคตรโบราณ', 'กาน้ำร้อนโคตรโบราณ', '/uploads/1762336811126-188695706.jpg', 900000.00, 1200000.00, '2025-11-05 17:00:39', 'active', NULL, 22, 'increment', 10000.00, 1200000.00, NULL),
(55, 'กีต้า', 'กีต้ากีต้ากีต้ากีต้ากีต้ากีต้า', '/uploads/1762337327618-58963409.jpg', 300000.00, 420000.00, '2025-11-05 17:09:18', 'active', NULL, 22, 'increment', 2000.00, 420000.00, NULL),
(56, 'ถ้วยน้ำชา', 'ถ้วยน้ำชาถ้วยน้ำชาถ้วยน้ำชา', '/uploads/1762337673982-802031184.jpg', 680000.00, 800000.00, '2025-11-05 17:15:05', 'active', NULL, 22, 'increment', 20000.00, 800000.00, NULL),
(57, 'GAINWARD GeForce3', 'GAINWARD GeForce3', '/uploads/1762338085650-937635626.jpg', 700000.00, 820000.00, '2025-11-05 17:22:24', 'active', NULL, 22, 'increment', 10000.00, 820000.00, NULL),
(58, 'กำไลข้อมือ', 'กำไลข้อมือกำไลข้อมือกำไลข้อมือกำไลข้อมือ', '/uploads/1762338557055-132591465.jpg', 760000.00, 850000.00, '2025-11-05 17:29:39', 'active', NULL, 22, 'increment', 20000.00, 850000.00, NULL),
(59, 'รองเท้าเก่า', 'รองเท้าเก่า', '/uploads/1762339009348-633018619.jpg', 2500.00, 5000.00, '2025-11-05 17:37:22', 'active', NULL, 22, 'increment', 100.00, 5000.00, NULL),
(60, 'การ์ด TCG', 'การ์ด TCG', '/uploads/1762340025734-325763917.jpg', 300000.00, 400000.00, '2025-11-05 17:54:32', 'active', NULL, 22, 'increment', 10000.00, 400000.00, NULL),
(61, 'ไพ่ TCG', 'ไพ่ TCG', '/uploads/1762340320966-155817304.jpg', 250000.00, 400000.00, '2025-11-05 17:59:05', 'active', NULL, 22, 'increment', 5.00, 400000.00, NULL),
(62, 'ONE PIECE', 'ONE PIECE', '/uploads/1762340682506-193590460.jpg', 30000.00, 50000.00, '2025-11-05 18:04:52', 'active', NULL, 22, 'increment', 1000.00, 50000.00, NULL),
(63, 'ไพ่การ์ด TCG', 'ไพ่การ์ด TCGไพ่การ์ด TCG', '/uploads/1762340912587-459724333.jpg', 250000.00, 400000.00, '2025-11-05 18:08:49', 'active', NULL, 22, 'increment', 1000.00, 400000.00, NULL),
(64, 'รองเท้าเก่ามากก', 'รองเท้าเก่ามากก', '/uploads/1762341069437-633460080.jpg', 340000.00, 500000.00, '2025-11-05 18:11:43', 'active', NULL, 22, 'increment', 10000.00, 500000.00, NULL),
(65, 'กาน้ำเก่ากาน้ำเก่า', 'กาน้ำเก่า', '/uploads/1762341269038-98837235.webp', 600000.00, 800000.00, '2025-11-05 18:14:44', 'active', NULL, 22, 'increment', 1.00, 800000.00, NULL),
(66, 'กาน้ำไก่ๆกา', 'กาน้ำไก่ๆกา', '/uploads/1762341476500-382696082.jpg', 20000.00, 50000.00, '2025-11-05 18:18:14', 'active', NULL, 22, 'increment', 10.00, 50000.00, NULL),
(67, 'นาฬิกานาฬิกา', 'นาฬิกานาฬิกานาฬิกา', '/uploads/1762341773743-138233237.jpg', 50000.00, 90000.00, '2025-11-05 18:23:15', 'active', NULL, 22, 'increment', 1000.00, 90000.00, NULL),
(68, 'การ์ด TCG', 'การ์ด TCGการ์ด TCGการ์ด TCG', '/uploads/1762342082885-731676093.jpg', 40000.00, 80000.00, '2025-11-05 18:28:14', 'active', NULL, 22, 'increment', 1000.00, 80000.00, NULL),
(69, 'ไพ่การ์ฺด', 'ไพ่การ์ฺดไพ่การ์ฺดไพ่การ์ฺด', '/uploads/1762344554925-527548708.jpg', 199999.00, 400000.00, '2025-11-05 19:09:26', 'active', NULL, 22, 'increment', 1000.00, 400000.00, NULL),
(70, 'การ์ด', '', '/uploads/1762344605668-164529874.jpg', 19998.97, 21000.00, '2025-11-05 19:11:00', 'active', NULL, 22, 'increment', 1000.00, NULL, NULL),
(71, 'Krong', 'Krong', '/uploads/1762524475779-720810845.jpg', 29000.00, 90000.00, '2025-11-07 21:08:07', 'active', NULL, 22, 'increment', 1.00, 90000.00, NULL),
(72, 'eiueieiei', '', '/uploads/1762524522342-669055302.jpg', 2000.00, 4000.00, '2025-11-07 21:10:00', 'active', NULL, 22, 'increment', 25.00, NULL, NULL),
(73, '123456789', '123456789123456789', '/uploads/1762525058224-188517927.jpg', 2900.00, 3500.00, '2025-11-07 21:19:00', 'active', NULL, 22, 'increment', 500.00, NULL, NULL),
(74, 'การ์ด TCG', 'การ์ด TCG', '/uploads/1762530005892-384699334.jpg', 35000.00, 60000.00, '2025-11-07 23:39:00', 'active', NULL, 22, 'increment', 1000.00, NULL, NULL),
(75, 'รองเท้า', NULL, '/uploads/1762530048388-622291541.jpg', 4499.97, 8099.00, '2025-11-08 12:40:00', 'active', NULL, 22, 'increment', 100.00, NULL, NULL),
(76, 'สร้อย AEC', '', '/uploads/1762546083478-704643755.jpg', 25000.00, 36000.00, '2025-11-08 03:09:00', 'active', NULL, 29, 'increment', 2500.00, 90000.00, NULL),
(77, 'แหวนเพชร 2.99 กะรัต', '2.99 กะรัต', '/uploads/1762547835898-183676212.jpg', 339999.00, 500000.00, '2025-11-08 03:39:00', 'active', NULL, 29, 'increment', 10000.00, NULL, NULL),
(78, 'รองเท้า', NULL, '/uploads/1762550403209-955452949.jpg', 30000.00, 34000.00, '2025-11-08 04:21:00', 'active', NULL, 29, 'increment', 1.00, 90000.00, NULL),
(80, 'นาฬิกา', 'นาฬิกานาฬิกานาฬิกา', '/uploads/1762553123868-184749731.jpg', 24000.00, 400000.00, '2025-11-08 05:07:21', 'active', NULL, 29, 'increment', 100.00, 400000.00, NULL),
(81, 'Audemars Piguet Royal Oak Chronograph Green Dial 26240ST', 'Audemars Piguet\r\nRoyal Oak Chronograph 26240ST.OO.1320ST.08\r\nCollection: Royal Oak\r\nModel Reference: 26240ST.OO.1320ST.08\r\nCase/Size: Stainless Steel / 41mm\r\nDial: Green\r\nMovement: Automatic winding\r\nFunctions: Hours, Minutes, Chronograph, Date\r\nCondition / Year: Brand New / 2025\r\nBox / Papers: Yes / Yes', '/uploads/1773214183978-103614227.jpg', 29000.00, 29000.00, '2026-03-12 14:29:00', 'active', NULL, 22, 'increment', 6000.00, NULL, '[\"/uploads/1773214183978-103614227.jpg\",\"/uploads/1773214183980-738869023.jpg\",\"/uploads/1773214183981-556904216.jpg\",\"/uploads/1773214183982-989695884.jpg\",\"/uploads/1773214183983-54162084.jpg\"]'),
(82, 'Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器', '■ชื่อสินค้า:\r\nกีตาร์โปร่ง Morris SPECIAL\r\n[สภาพ]\r\nมี\r\nรอยขีดข่วน คราบสกปรก รอยหมอง สีซีดจาง ลอกเป็นขุย สนิม ฯลฯ\r\nหมุดสำหรับติดสายสะพายหายไป\r\nมีบางสถานที่ที่ไม่มีเชือกผูก\r\nฉันไม่มีความเชี่ยวชาญในการปรับแต่งรายละเอียด ดังนั้นฉันจึงไม่ทราบ\r\nรายละเอียดเหล่านั้น โปรดดูภาพประกอบเพื่อพิจารณาสภาพสินค้า', '/uploads/1773215330593-939265386.jpg', 4299.97, 4359.97, '2026-03-11 14:50:00', 'active', NULL, 22, 'increment', 60.00, NULL, '[\"/uploads/1773215330593-939265386.jpg\",\"/uploads/1773215330594-245610246.jpg\",\"/uploads/1773215330595-368690081.jpg\"]'),
(83, 'กีต้า', 'กีต้าเติ้ล', '/uploads/1773339262436-259555695.jpg', 250000.00, 300000.00, '2026-03-15 01:14:00', 'active', NULL, 22, 'increment', 5000.00, NULL, '[\"/uploads/1773339262436-259555695.jpg\",\"/uploads/1773339262438-953972121.jpg\",\"/uploads/1773339262439-308458921.jpg\",\"/uploads/1773339262439-720276834.jpg\"]'),
(84, 'กาน้ำ', '', '/uploads/1773343309227-421478630.jpg', 5000.00, 5000.00, '2026-03-16 02:21:00', 'active', NULL, 22, 'increment', 50.00, NULL, '[\"/uploads/1773343309227-421478630.jpg\"]'),
(85, 'การ์ด Pokemon', 'การ์ด Pokemon Pokemon\r\nPokemon\r\nPokemon Pokemon', '/uploads/1773349285798-369747164.jpg', 6000.00, 6000.00, '2026-03-16 04:01:00', 'active', NULL, 22, 'sealed', NULL, NULL, '[\"/uploads/1773349285798-369747164.jpg\"]'),
(86, 'สร้อยหมูหมากาไก่', 'สร้อยหมูหมากาไก่', '/uploads/1773350083766-840601786.jpg', 9000.00, 10000.00, '2026-03-19 04:14:00', 'active', NULL, 22, 'increment', 100.00, 20000.00, '[\"/uploads/1773350083766-840601786.jpg\"]'),
(87, 'Max รถ', 'Max รถMax รถMax รถ', '/uploads/1773350790441-224706160.jpg', 25000.00, 251000.00, '2026-03-19 04:26:00', 'active', NULL, 29, 'increment', 50.00, 35000.00, '[\"/uploads/1773350790441-224706160.jpg\"]'),
(88, 'กาไหน้ำ', 'กาไหน้ำ\r\nกาไหน้ำ\r\nกาไหน้ำ', '/uploads/1773818041619-135834743.jpg', 4000.00, 4300.00, '2026-03-18 14:15:00', 'active', NULL, 29, 'increment', 100.00, NULL, '[\"/uploads/1773818041619-135834743.jpg\",\"/uploads/1773818041620-962211194.jpg\"]'),
(89, '§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い', '', '/uploads/1773819107166-237752403.jpg', 5000.00, 5100.00, '2026-03-18 14:33:00', 'active', NULL, 29, 'increment', 50.00, NULL, '[\"/uploads/1773819107166-237752403.jpg\",\"/uploads/1773819107168-395057657.jpg\",\"/uploads/1773819107171-335165268.jpg\",\"/uploads/1773819107173-311394393.jpg\"]'),
(90, 'ของเล่นไทย', '', '/uploads/1773819857402-768700082.jpg', 4500.00, 4550.00, '2026-03-18 14:46:00', 'active', NULL, 29, 'increment', 50.00, NULL, '[\"/uploads/1773819857402-768700082.jpg\"]'),
(91, 'ตากี้', 'ตากี้ตากี้ตากี้', '/uploads/1773820278112-78584183.jpg', 4500.00, 6000.00, '2026-03-18 14:53:00', 'active', NULL, 29, 'increment', 1500.00, NULL, '[\"/uploads/1773820278112-78584183.jpg\"]'),
(92, 'สร้อยแหวนรวมกันมันส์กว่า', 'สร้อยแหวนรวมกันมันส์กว่า', '/uploads/1775375293824-852621201.jpg', 5000.00, 5000.00, '2026-04-05 15:47:00', 'active', NULL, 34, 'increment', 50.00, 6500.00, '[\"/uploads/1775375293824-852621201.jpg\",\"/uploads/1775375293825-681364484.jpg\"]'),
(93, 'นาฬิกา 26351', 'นาฬิกา 26351\r\nคุณภาพดี', '/uploads/1775416613526-919080169.jpg', 25000.00, 30000.00, '2026-04-08 02:13:00', 'active', NULL, 22, 'increment', 500.00, NULL, '[\"/uploads/1775416613526-919080169.jpg\",\"/uploads/1775416613529-966426676.jpg\",\"/uploads/1775416613535-528660727.jpg\",\"/uploads/1775416613536-111573985.jpg\"]'),
(94, 'กาน้ำร้อน', 'กาน้ำร้อนมือสอง', '/uploads/1775483251996-513244743.jpg', 5000.00, 5000.00, '2026-04-06 20:50:00', 'active', NULL, 35, 'increment', 50.00, 7500.00, '[\"/uploads/1775483251996-513244743.jpg\"]'),
(95, 'กาน้ำร้อน', 'กาน้ำร้อน', '/uploads/1775485671666-332669946.jpg', 5000.00, 6500.00, '2026-04-06 21:29:00', 'active', NULL, 35, 'increment', 500.00, 7600.00, '[\"/uploads/1775485671666-332669946.jpg\"]'),
(96, 'แหวนหยก', 'แหวนหยกคุณภาพดี', '/uploads/1775637075883-173127557.jpg', 3000.00, 3200.00, '2026-04-08 15:35:00', 'active', NULL, 35, 'increment', 100.00, 6500.00, '[\"/uploads/1775637075883-173127557.jpg\"]'),
(97, 'หยกใหม่', 'หยกใหม่', '/uploads/1775637472765-948020964.jpg', 5000.00, 5400.00, '2026-04-08 17:37:00', 'active', NULL, 35, 'increment', 150.00, 7500.00, '[\"/uploads/1775637472765-948020964.jpg\"]'),
(98, 'กีต้า', 'กีต้า', '/uploads/1775638242424-622883946.jpg', 6500.00, 6500.00, '2026-04-08 19:50:00', 'ended', NULL, 35, 'increment', 100.00, 11999.99, '[\"/uploads/1775638242424-622883946.jpg\",\"/uploads/1775638242429-382414347.jpg\",\"/uploads/1775638242440-40686483.jpg\",\"/uploads/1775638242445-197881025.jpg\"]'),
(99, 'กำไลทอง', 'กำไลทองคำหนัก 2 กิโลล้านแคล\r\nกำไลทองคำหนัก 2 กิโลล้านแคล\r\nกำไลทองคำหนัก 2 กิโลล้านแคล\r\nกำไลทองคำหนัก 2 กิโลล้านแคล\r\n\r\nกำไลทองคำหนัก 2 กิโลล้านแคล', '/uploads/1775639839735-950649436.jpg', 35000.00, 45000.00, '2026-04-08 16:18:00', 'active', NULL, 35, 'increment', 200.00, 50000.00, '[\"/uploads/1775639839735-950649436.jpg\"]'),
(100, 'รองเท้า', 'รองเท้าหนังสภาพดี', '/uploads/1775647778211-74799995.jpg', 2500.00, 3500.00, '2026-04-08 18:31:00', 'ended', 27, 35, 'increment', 50.00, 3500.00, '[\"/uploads/1775647778211-74799995.jpg\"]'),
(101, 'รองเท้าA', 'รองเท้าA', '/uploads/1775648111087-769698374.jpg', 2500.00, 4000.00, '2026-04-08 18:36:00', 'ended', 27, 35, 'increment', 10.00, NULL, '[\"/uploads/1775648111087-769698374.jpg\"]'),
(102, 'รองเท้าบู๊ท', 'รองเท้าบู๊ท', '/uploads/1775723736091-513185917.jpg', 5500.00, 5600.00, '2026-04-11 15:35:00', 'active', NULL, 35, 'increment', 50.00, 8500.00, '[\"/uploads/1775723736091-513185917.jpg\"]'),
(103, 'นาฬิกานาฬิกานาฬิกา', 'นาฬิกานาฬิกานาฬิกา', '/uploads/1775723987760-446623194.jpg', 4500.00, 9500.00, '2026-04-09 15:41:00', 'ended', 27, 35, 'increment', 100.00, 6500.00, '[\"/uploads/1775723987760-446623194.jpg\",\"/uploads/1775723987761-51446317.jpg\",\"/uploads/1775723987763-711559866.jpg\",\"/uploads/1775723987767-230812132.jpg\"]'),
(104, 'นาฬิกานาฬิกานาฬิกา', 'นาฬิกานาฬิกานาฬิกา', '/uploads/1775724811272-360536774.jpg', 5000.00, 6000.00, '2026-04-09 15:55:00', 'ended', 32, 35, 'increment', 100.00, NULL, '[\"/uploads/1775724811272-360536774.jpg\",\"/uploads/1775724811277-48735000.jpg\",\"/uploads/1775724811282-716993321.jpg\"]'),
(105, 'แพ็คการ์ด', 'แพ็คการ์ด', '/uploads/1775724981761-89686355.jpg', 5000.00, 5500.00, '2026-04-09 15:58:00', 'ended', 27, 35, 'increment', 100.00, NULL, '[\"/uploads/1775724981761-89686355.jpg\"]'),
(106, 'กีต้า', 'กีต้ากีต้า', '/uploads/1775725746879-551534676.jpg', 3500.00, 6500.00, '2026-04-09 16:10:00', 'ended', 27, 35, 'increment', 100.00, NULL, '[\"/uploads/1775725746879-551534676.jpg\",\"/uploads/1775725746907-544471402.jpg\"]'),
(107, 'ประมูลไหโบราณ', 'ประมูลไหโบราณ', '/uploads/1775726055469-157351995.webp', 5400.00, 6600.00, '2026-04-09 16:16:00', 'ended', 27, 35, 'increment', 100.00, NULL, '[\"/uploads/1775726055469-157351995.webp\"]'),
(108, 'จานโบราณทรงสวย', 'จานโบราณทรงสวย', '/uploads/1775726445391-992070704.jpg', 5000.00, 7000.00, '2026-04-09 16:22:00', 'ended', 27, 35, 'increment', 100.00, 8000.00, '[\"/uploads/1775726445391-992070704.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

CREATE TABLE `bids` (
  `id` int(10) UNSIGNED NOT NULL,
  `auction_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`id`, `auction_id`, `user_id`, `amount`, `created_at`) VALUES
(4, 4, 3, 12000.00, '2025-09-30 04:12:03'),
(5, 6, 6, 2300.00, '2025-09-30 04:46:23'),
(6, 7, 6, 3000.00, '2025-09-30 04:47:22'),
(7, 8, 6, 3000.00, '2025-09-30 05:10:57'),
(8, 9, 7, 200000.00, '2025-10-01 05:57:02'),
(9, 10, 8, 300000.00, '2025-10-01 07:10:43'),
(10, 11, 2, 300000.00, '2025-10-01 07:27:34'),
(11, 10, 2, 400000.00, '2025-10-01 07:27:53'),
(12, 12, 4, 2200.00, '2025-10-01 07:37:52'),
(13, 13, 4, 200.00, '2025-10-01 07:44:43'),
(14, 13, 2, 2000.00, '2025-10-01 07:45:09'),
(15, 14, 8, 30000.00, '2025-10-01 07:46:40'),
(16, 15, 2, 500000.00, '2025-10-01 08:49:50'),
(17, 15, 4, 100000.00, '2025-10-01 08:50:07'),
(18, 16, 13, 30000.00, '2025-10-18 01:24:58'),
(19, 16, 14, 35000.00, '2025-10-18 01:28:37'),
(20, 17, 14, 45000.00, '2025-10-19 04:01:02'),
(23, 19, 14, 2500.00, '2025-10-19 04:10:02'),
(24, 20, 14, 5050.01, '2025-10-19 04:16:23'),
(33, 25, 14, 2600.00, '2025-10-19 04:30:59'),
(34, 26, 14, 250000.00, '2025-10-19 04:38:03'),
(35, 27, 14, 25000.00, '2025-10-19 04:57:38'),
(36, 28, 14, 1500.00, '2025-10-19 05:08:11'),
(37, 29, 14, 25000.00, '2025-10-19 05:24:40'),
(38, 31, 15, 30000.00, '2025-10-19 05:54:14'),
(39, 32, 15, 1500.00, '2025-10-19 06:00:11'),
(40, 33, 16, 30000.00, '2025-10-19 06:05:39'),
(41, 34, 19, 30000.00, '2025-10-19 06:18:03'),
(42, 35, 19, 35000.00, '2025-10-19 06:26:42'),
(43, 36, 19, 55000.00, '2025-10-19 07:04:37'),
(44, 37, 19, 25000.00, '2025-10-19 07:36:38'),
(45, 39, 23, 650000.00, '2025-10-25 18:48:25'),
(46, 40, 23, 255000.00, '2025-10-25 19:21:24'),
(47, 41, 23, 260000.00, '2025-10-25 20:36:41'),
(48, 42, 23, 260000.00, '2025-10-25 20:45:37'),
(49, 43, 23, 300000.00, '2025-10-27 14:17:06'),
(50, 44, 23, 300000.00, '2025-10-30 14:50:35'),
(51, 45, 23, 270000.00, '2025-11-04 16:01:16'),
(52, 46, 23, 250000.00, '2025-11-04 16:12:15'),
(53, 46, 27, 300000.00, '2025-11-04 16:12:45'),
(54, 47, 23, 220000.00, '2025-11-04 16:27:17'),
(55, 47, 27, 230000.00, '2025-11-04 16:27:32'),
(56, 48, 23, 300000.00, '2025-11-04 16:36:12'),
(57, 49, 23, 250000.00, '2025-11-04 16:44:52'),
(58, 49, 27, 300000.00, '2025-11-04 16:45:25'),
(59, 50, 23, 250000.00, '2025-11-04 16:57:52'),
(60, 50, 27, 300000.00, '2025-11-04 16:58:12'),
(61, 51, 23, 1000000.00, '2025-11-04 18:05:31'),
(62, 51, 27, 1200000.00, '2025-11-04 18:06:05'),
(63, 53, 23, 300000.00, '2025-11-05 16:55:35'),
(64, 57, 22, 800000.00, '2025-11-05 17:21:35'),
(65, 70, 27, 21000.00, '2025-11-05 19:10:29'),
(66, 72, 27, 4000.00, '2025-11-07 21:08:54'),
(67, 73, 27, 3500.00, '2025-11-07 21:17:47'),
(68, 75, 27, 8099.00, '2025-11-07 22:43:00'),
(69, 74, 22, 40000.00, '2025-11-07 23:09:28'),
(70, 74, 27, 60000.00, '2025-11-07 23:18:46'),
(71, 76, 30, 36000.00, '2025-11-08 03:08:14'),
(72, 77, 30, 500000.00, '2025-11-08 03:37:31'),
(73, 77, 27, 450000.00, '2025-11-08 03:38:16'),
(74, 78, 30, 34000.00, '2025-11-08 04:20:15'),
(75, 80, 30, 350000.00, '2025-11-08 05:05:34'),
(76, 82, 31, 4359.97, '2026-03-11 14:49:34'),
(77, 83, 32, 255000.00, '2026-03-13 02:00:47'),
(78, 83, 31, 300000.00, '2026-03-13 02:05:13'),
(79, 85, 23, 10000.00, '2026-03-13 04:02:12'),
(80, 85, 27, 6000.00, '2026-03-13 04:13:26'),
(81, 86, 23, 10000.00, '2026-03-13 04:21:30'),
(82, 88, 31, 4300.00, '2026-03-18 14:14:25'),
(83, 89, 31, 5100.00, '2026-03-18 14:31:58'),
(84, 90, 31, 4550.00, '2026-03-18 14:44:51'),
(85, 91, 31, 6000.00, '2026-03-18 14:51:44'),
(86, 87, 31, 251000.00, '2026-03-18 15:00:03'),
(87, 93, 23, 27000.00, '2026-04-06 02:36:01'),
(88, 93, 27, 30000.00, '2026-04-06 21:05:11'),
(89, 95, 27, 6000.00, '2026-04-06 21:28:13'),
(90, 95, 23, 6500.00, '2026-04-06 21:28:35'),
(91, 96, 32, 3200.00, '2026-04-08 15:32:21'),
(92, 97, 27, 5200.00, '2026-04-08 15:49:36'),
(93, 97, 32, 5400.00, '2026-04-08 16:05:14'),
(94, 99, 32, 40000.00, '2026-04-08 16:17:35'),
(95, 99, 27, 45000.00, '2026-04-08 16:17:44'),
(96, 100, 32, 3000.00, '2026-04-08 18:29:51'),
(97, 100, 27, 3500.00, '2026-04-08 18:30:02'),
(98, 101, 27, 4000.00, '2026-04-08 18:35:19'),
(99, 101, 32, 3500.00, '2026-04-08 18:35:30'),
(100, 103, 27, 9500.00, '2026-04-09 15:40:05'),
(101, 103, 32, 8000.00, '2026-04-09 15:40:18'),
(102, 104, 32, 5200.00, '2026-04-09 15:53:48'),
(103, 104, 27, 5600.00, '2026-04-09 15:53:54'),
(104, 104, 32, 6000.00, '2026-04-09 15:54:03'),
(105, 105, 32, 5200.00, '2026-04-09 15:56:31'),
(106, 105, 27, 5500.00, '2026-04-09 15:56:39'),
(107, 106, 32, 4000.00, '2026-04-09 16:09:20'),
(108, 106, 27, 4500.00, '2026-04-09 16:09:25'),
(109, 106, 32, 5000.00, '2026-04-09 16:09:29'),
(110, 106, 27, 6500.00, '2026-04-09 16:09:32'),
(111, 107, 32, 5500.00, '2026-04-09 16:14:28'),
(112, 107, 27, 6600.00, '2026-04-09 16:14:35'),
(113, 108, 32, 5699.00, '2026-04-09 16:20:56'),
(114, 108, 27, 7000.00, '2026-04-09 16:21:05'),
(115, 102, 34, 5600.00, '2026-04-10 08:04:01');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(10) UNSIGNED NOT NULL,
  `room_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `message` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `message_type` enum('text','image') NOT NULL DEFAULT 'text',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `room_id`, `user_id`, `message`, `image_url`, `message_type`, `created_at`) VALUES
(1, 1, 2, 'Hello', NULL, 'text', '2025-09-30 04:17:39'),
(2, 1, 2, 'Hello', NULL, 'text', '2025-09-30 04:17:56'),
(3, 1, 3, NULL, '/uploads/chat/chat-1759180704499-967583559.jpg', 'image', '2025-09-30 04:18:24'),
(4, 1, 3, NULL, '/uploads/chat/chat-1759180737118-696862147.jpg', 'image', '2025-09-30 04:18:57'),
(5, 2, 4, 'asdasd', NULL, 'text', '2025-09-30 04:24:19'),
(6, 3, 6, 'eiei', NULL, 'text', '2025-09-30 05:21:36'),
(7, 3, 2, 'ดั้ยยย', NULL, 'text', '2025-09-30 05:22:08'),
(8, 3, 2, 'มาเบยยย', NULL, 'text', '2025-09-30 05:22:11'),
(9, 3, 2, NULL, '/uploads/chat/chat-1759184535491-497946880.jpg', 'image', '2025-09-30 05:22:15'),
(10, 4, 7, 'โหลลล', NULL, 'text', '2025-10-01 05:55:27'),
(11, 4, 7, 'Hello', NULL, 'text', '2025-10-01 05:55:29'),
(12, 4, 2, 'ไหนอ่ะ', NULL, 'text', '2025-10-01 05:55:51'),
(13, 4, 2, NULL, '/uploads/chat/chat-1759272955895-792563095.jpg', 'image', '2025-10-01 05:55:55'),
(14, 2, 2, 'OK', NULL, 'text', '2025-10-01 06:06:41'),
(15, 4, 2, 'ห้ะ', NULL, 'text', '2025-10-01 07:19:22'),
(16, 4, 2, NULL, '/uploads/chat/chat-1759282390361-736734882.jpg', 'image', '2025-10-01 08:33:10'),
(17, 4, 2, 'อิอิ', NULL, 'text', '2025-10-01 08:35:05'),
(19, 4, 2, 'vbvb', NULL, 'text', '2025-10-01 08:35:11'),
(21, 4, 2, 'eiei', NULL, 'text', '2025-10-01 08:40:48'),
(23, 3, 2, 'งงมาก', NULL, 'text', '2025-10-01 08:40:58'),
(25, 4, 2, 'ไหนนนนนนนนน', NULL, 'text', '2025-10-01 08:43:34'),
(27, 3, 2, 'sssss', NULL, 'text', '2025-10-01 08:43:42'),
(29, 4, 2, 'ห้ะะะะะะะะะะะ', NULL, 'text', '2025-10-01 08:43:51'),
(31, 4, 2, 'งงงอ่าาาาาาาาาาาาาาาาาา', NULL, 'text', '2025-10-01 08:43:57'),
(35, 3, 8, NULL, '/uploads/chat/chat-1759283593751-841436500.jpg', 'image', '2025-10-01 08:53:13'),
(36, 3, 8, NULL, '/uploads/chat/chat-1759283593751-841436500.jpg', 'image', '2025-10-01 08:53:13'),
(37, 2, 2, 'ตวยๆๆๆ', NULL, 'text', '2025-10-04 00:43:14'),
(39, 5, 12, 'เติมเงินเข้าเว็บหน่อยครับ', NULL, 'text', '2025-10-17 23:13:32'),
(41, 5, 2, NULL, '/uploads/chat/chat-1760819107510-404074398.webp', 'image', '2025-10-19 03:25:07'),
(42, 5, 2, NULL, '/uploads/chat/chat-1760819107510-404074398.webp', 'image', '2025-10-19 03:25:07'),
(43, 6, 12, '🎉 Congratulations! You won the auction \"ถ้วยน้ำชาโบราณ\" with a bid of $1000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 03:59:00'),
(45, 8, 8, '🎉 Congratulations! You won the auction \"Test\" with a bid of $500000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:05:11'),
(46, 9, 4, '🎉 Congratulations! You won the auction \"UMAN\" with a bid of $2000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:06:02'),
(47, 10, 2, '🎉 Congratulations! You won the auction \"EWWW\" with a bid of $300000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:07:44'),
(48, 11, 2, '🎉 Congratulations! You won the auction \"The Best\" with a bid of $400000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:07:44'),
(49, 12, 12, '🎉 Congratulations! You won the auction \"ถ้วยน้ำร้อน\" with a bid of $2500.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:11:07'),
(50, 12, 12, 'สวัสดีค้าบบบ', NULL, 'text', '2025-10-19 04:11:54'),
(53, 14, 12, '🎉 Congratulations! You won the auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\" with a bid of $2600.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:32:05'),
(54, 15, 12, '🎉 Congratulations! You won the auction \"151515\" with a bid of $250000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:39:10'),
(55, 15, 14, 'ค้าบบบ', NULL, 'text', '2025-10-19 04:41:35'),
(57, 15, 14, 'คั้บ', NULL, 'text', '2025-10-19 04:44:05'),
(58, 15, 14, 'หฟกดฟกด', NULL, 'text', '2025-10-19 04:44:07'),
(59, 15, 14, 'ห้ะ', NULL, 'text', '2025-10-19 04:44:11'),
(60, 15, 14, 'อะไรนะ', NULL, 'text', '2025-10-19 04:44:18'),
(61, 15, 14, 'งงอ่ะ', NULL, 'text', '2025-10-19 04:44:22'),
(62, 15, 14, 'งงอ่ะ', NULL, 'text', '2025-10-19 04:45:00'),
(63, 15, 14, 'งง', NULL, 'text', '2025-10-19 04:45:05'),
(64, 15, 14, 'งง', NULL, 'text', '2025-10-19 04:45:05'),
(65, 15, 14, 'ฟหกฟหก', NULL, 'text', '2025-10-19 04:45:12'),
(66, 15, 14, 'ฟหก', NULL, 'text', '2025-10-19 04:45:12'),
(67, 15, 14, 'ฟ', NULL, 'text', '2025-10-19 04:45:13'),
(68, 15, 14, 'หก', NULL, 'text', '2025-10-19 04:45:13'),
(69, 15, 14, 'ฟห', NULL, 'text', '2025-10-19 04:45:13'),
(70, 15, 14, 'ก', NULL, 'text', '2025-10-19 04:45:13'),
(71, 15, 14, 'ฟห', NULL, 'text', '2025-10-19 04:45:13'),
(72, 15, 14, 'ก', NULL, 'text', '2025-10-19 04:45:13'),
(73, 15, 14, 'ฟหก', NULL, 'text', '2025-10-19 04:45:14'),
(74, 15, 14, 'ฟห', NULL, 'text', '2025-10-19 04:45:14'),
(75, 15, 14, 'ก', NULL, 'text', '2025-10-19 04:45:14'),
(76, 15, 14, 'ฟห', NULL, 'text', '2025-10-19 04:45:14'),
(77, 15, 14, 'ก', NULL, 'text', '2025-10-19 04:45:14'),
(78, 15, 14, 'ฟห', NULL, 'text', '2025-10-19 04:45:14'),
(79, 15, 14, 'กฟห', NULL, 'text', '2025-10-19 04:45:14'),
(80, 15, 14, 'กฟห', NULL, 'text', '2025-10-19 04:45:15'),
(81, 15, 14, 'ก', NULL, 'text', '2025-10-19 04:45:15'),
(82, 16, 12, '🎉 Congratulations! You won the auction \"131313\" with a bid of $25000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 04:58:01'),
(83, 16, 14, 'คับบบ', NULL, 'text', '2025-10-19 04:59:16'),
(84, 17, 12, '🎉 Congratulations! You won the auction \"กาน้ำร้อนโบราณ\" with a bid of $45000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 05:01:01'),
(85, 18, 12, '🎉 Congratulations! You won the auction \"1411414\" with a bid of $1500.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 05:09:14'),
(86, 19, 12, '🎉 Congratulations! You won the auction \"ถ้วยกาแฟไร\" with a bid of $25000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 05:25:19'),
(87, 20, 12, '🎉 Congratulations! You won the auction \"กาไรปะ\" with a bid of $30000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 05:55:22'),
(88, 20, 15, 'โโอนจ่ายนะครับ', NULL, 'text', '2025-10-19 05:55:40'),
(89, 21, 12, '🎉 Congratulations! You won the auction \"Test Auction for Payment System\" with a bid of $1500.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 06:02:25'),
(90, 22, 17, '🎉 Congratulations! You won the auction \"ไก่กา\" with a bid of $30000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 06:06:20'),
(91, 22, 16, 'เดี๋ยวโอนนะครับ', NULL, 'text', '2025-10-19 06:06:31'),
(92, 23, 18, '🎉 Congratulations! You won the auction \"ไก่กาอาราเร่\" with a bid of $30000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 06:19:06'),
(93, 24, 21, '🎉 Congratulations! You won the auction \"กาอะไรเนี่ยสวยจัง\" with a bid of $35000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 06:27:06'),
(94, 25, 21, '🎉 Congratulations! You won the auction \"ยังไงๆๆ\" with a bid of $55000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 07:05:23'),
(95, 26, 21, '🎉 Congratulations! You won the auction \"asdasdasd\" with a bid of $25000.00. You can now chat with the seller to arrange delivery and payment.', NULL, 'text', '2025-10-19 07:37:01'),
(96, 18, 14, 'Kub Pee', NULL, 'text', '2025-10-20 10:14:11'),
(97, 27, 14, NULL, '/uploads/chat/chat-1761121703721-514348785.jpg', 'image', '2025-10-22 15:28:23'),
(98, 27, 14, NULL, '/uploads/chat/chat-1761121703721-514348785.jpg', 'image', '2025-10-22 15:28:23'),
(99, 27, 14, '50 n', NULL, 'text', '2025-10-22 15:28:27'),
(100, 20, 15, 'ค้าบบบ', NULL, 'text', '2025-10-25 09:03:28'),
(101, 28, 22, 'เติมเงินหน่อยครับ', NULL, 'text', '2025-10-25 09:29:31'),
(102, 28, 22, 'ขอบคุณครัย', NULL, 'text', '2025-10-25 09:29:37'),
(103, 28, 22, 'ครับพี่', NULL, 'text', '2025-10-25 09:29:45'),
(104, 30, 23, 'สวัสดีครับ', NULL, 'text', '2025-10-25 18:52:40'),
(105, 39, 23, 'อิอิ', NULL, 'text', '2025-10-25 19:22:42'),
(106, 39, 22, 'สวัสดีครับ', NULL, 'text', '2025-10-25 19:23:23'),
(107, 40, 23, 'รับทราบ', NULL, 'text', '2025-10-25 20:38:54'),
(108, 41, 23, 'ครับพี่', NULL, 'text', '2025-10-25 20:47:32'),
(109, 42, 22, 'ฟหำฟหกฟห', NULL, 'text', '2025-10-30 14:53:38'),
(110, 42, 22, 'ขอที่อยู่', NULL, 'text', '2025-10-30 14:53:50'),
(111, 42, 23, '123124', NULL, 'text', '2025-10-30 14:55:18'),
(112, 43, 23, 'asdasd', NULL, 'text', '2025-11-04 16:02:20'),
(113, 51, 27, 'Dee kub', NULL, 'text', '2025-11-04 17:01:54'),
(114, 52, 27, 'สวัสดีครับ', NULL, 'text', '2025-11-04 18:11:08'),
(115, 52, 22, 'สวัสดีครับ', NULL, 'text', '2025-11-04 18:12:21'),
(116, 52, 22, 'ขอที่อยู่หน่อยครับ', NULL, 'text', '2025-11-04 18:12:26'),
(117, 53, 23, 'OK', NULL, 'text', '2025-11-05 16:57:11'),
(118, 59, 27, 'eiei', NULL, 'text', '2025-11-05 17:50:50'),
(119, 51, 27, 'asdasd', NULL, 'text', '2025-11-07 21:25:16'),
(120, 52, 27, 'eiei', NULL, 'text', '2025-11-07 21:27:01'),
(121, 59, 27, NULL, '/uploads/chat/chat-1762529488965-360064168.jpg', 'image', '2025-11-07 22:31:28'),
(122, 59, 27, NULL, '/uploads/chat/chat-1762529488965-360064168.jpg', 'image', '2025-11-07 22:31:28'),
(123, 59, 27, NULL, '/uploads/chat/chat-1762530425503-943264729.jpg', 'image', '2025-11-07 22:47:05'),
(124, 59, 27, NULL, '/uploads/chat/chat-1762530425503-943264729.jpg', 'image', '2025-11-07 22:47:05'),
(125, 59, 27, NULL, '/uploads/chat/chat-1762530459989-727196745.png', 'image', '2025-11-07 22:47:39'),
(126, 59, 27, NULL, '/uploads/chat/chat-1762530459989-727196745.png', 'image', '2025-11-07 22:47:40'),
(127, 59, 27, 'asdasd', NULL, 'text', '2025-11-07 22:47:44'),
(128, 52, 27, 'asdasd', NULL, 'text', '2025-11-07 22:47:53'),
(129, 59, 27, NULL, '/uploads/chat/chat-1762530482928-925932699.png', 'image', '2025-11-07 22:48:02'),
(130, 59, 27, NULL, '/uploads/chat/chat-1762530482928-925932699.png', 'image', '2025-11-07 22:48:02'),
(131, 59, 27, NULL, '/uploads/chat/chat-1762530629959-398751669.png', 'image', '2025-11-07 22:50:29'),
(132, 59, 27, NULL, '/uploads/chat/chat-1762530687293-181600768.png', 'image', '2025-11-07 22:51:27'),
(133, 71, 28, NULL, '/uploads/chat/chat-1762531066177-131528655.png', 'image', '2025-11-07 22:57:46'),
(134, 71, 28, NULL, '/uploads/chat/chat-1762531160136-903637464.png', 'image', '2025-11-07 22:59:20'),
(135, 71, 28, NULL, '/uploads/chat/chat-1762531515697-453487065.png', 'image', '2025-11-07 23:05:15'),
(136, 71, 28, NULL, '/uploads/chat/chat-1762531599025-214795634.png', 'image', '2025-11-07 23:06:39'),
(137, 59, 27, NULL, '/uploads/chat/chat-1762531696084-570221479.png', 'image', '2025-11-07 23:08:16'),
(138, 59, 27, 'asdasd', NULL, 'text', '2025-11-07 23:08:20'),
(139, 59, 27, 'asdasd', NULL, 'text', '2025-11-07 23:08:24'),
(140, 52, 27, NULL, '/uploads/chat/chat-1762532618814-747318920.png', 'image', '2025-11-07 23:23:38'),
(141, 78, 31, 'สวัสดีครับบ', NULL, 'text', '2026-03-11 14:50:22'),
(142, 78, 22, 'ค้าบบ', NULL, 'text', '2026-03-11 14:50:39'),
(143, 78, 31, NULL, '/uploads/chat/chat-1773215448480-47277024.jpg', 'image', '2026-03-11 14:50:48'),
(144, 78, 22, 'ขอที่อยู่หรนน่อยครัยบ', NULL, 'text', '2026-03-11 14:50:59'),
(145, 78, 31, '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', NULL, 'text', '2026-03-11 14:51:45'),
(146, 78, 22, 'รับทราบครับ', NULL, 'text', '2026-03-11 14:51:53'),
(147, 79, 31, NULL, '/uploads/chat/chat-1773818117375-177020189.png', 'image', '2026-03-18 14:15:17'),
(148, 87, 35, 'สวัสดีครับ', NULL, 'text', '2026-04-08 16:19:10'),
(149, 87, 27, '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', NULL, 'text', '2026-04-08 16:21:03');

-- --------------------------------------------------------

--
-- Table structure for table `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(10) UNSIGNED NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `auction_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_rooms`
--

INSERT INTO `chat_rooms` (`id`, `name`, `description`, `created_by`, `created_at`, `auction_id`) VALUES
(1, 'เติมเงิน', '', 3, '2025-09-30 04:17:21', NULL),
(2, 'เติมเงิน22', '', 4, '2025-09-30 04:24:16', NULL),
(3, 'เติมเงินหน่อยย', '', 6, '2025-09-30 04:49:33', NULL),
(4, 'แอดครับเติมเงินให้หน่อย', '', 7, '2025-10-01 05:55:23', NULL),
(5, 'จ่ายเงินคั้บ', 'เติมเงินเข้า', 12, '2025-10-17 23:13:22', NULL),
(6, '🏆 ถ้วยน้ำชาโบราณ - Winner Chat', 'Chat between winner and seller for auction: ถ้วยน้ำชาโบราณ', 12, '2025-10-19 03:59:00', 16),
(8, '🏆 Test - Winner Chat', 'Chat between winner and seller for auction: Test', 8, '2025-10-19 04:05:11', 15),
(9, '🏆 UMAN - Winner Chat', 'Chat between winner and seller for auction: UMAN', 4, '2025-10-19 04:06:02', 13),
(10, '🏆 EWWW - Winner Chat', 'Chat between winner and seller for auction: EWWW', 2, '2025-10-19 04:07:44', 11),
(11, '🏆 The Best - Winner Chat', 'Chat between winner and seller for auction: The Best', 2, '2025-10-19 04:07:44', 10),
(12, '🏆 ถ้วยน้ำร้อน - Winner Chat', 'Chat between winner and seller for auction: ถ้วยน้ำร้อน', 12, '2025-10-19 04:11:07', 19),
(14, '🏆 ถ้วยน้ำร้อนถ้วยน้ำร้อน - Winner Chat', 'Chat between winner and seller for auction: ถ้วยน้ำร้อนถ้วยน้ำร้อน', 12, '2025-10-19 04:32:05', 25),
(15, '🏆 151515 - Winner Chat', 'Chat between winner and seller for auction: 151515', 12, '2025-10-19 04:39:10', 26),
(16, '🏆 131313 - Winner Chat', 'Chat between winner and seller for auction: 131313', 12, '2025-10-19 04:58:01', 27),
(17, '🏆 กาน้ำร้อนโบราณ - Winner Chat', 'Chat between winner and seller for auction: กาน้ำร้อนโบราณ', 12, '2025-10-19 05:01:01', 17),
(18, '🏆 1411414 - Winner Chat', 'Chat between winner and seller for auction: 1411414', 12, '2025-10-19 05:09:14', 28),
(19, '🏆 ถ้วยกาแฟไร - Winner Chat', 'Chat between winner and seller for auction: ถ้วยกาแฟไร', 12, '2025-10-19 05:25:19', 29),
(20, '🏆 กาไรปะ - Winner Chat', 'Chat between winner and seller for auction: กาไรปะ', 12, '2025-10-19 05:55:22', 31),
(21, '🏆 Test Auction for Payment System - Winner Chat', 'Chat between winner and seller for auction: Test Auction for Payment System', 12, '2025-10-19 06:02:25', 32),
(22, '🏆 ไก่กา - Winner Chat', 'Chat between winner and seller for auction: ไก่กา', 17, '2025-10-19 06:06:20', 33),
(23, '🏆 ไก่กาอาราเร่ - Winner Chat', 'Chat between winner and seller for auction: ไก่กาอาราเร่', 18, '2025-10-19 06:19:06', 34),
(24, '🏆 กาอะไรเนี่ยสวยจัง - Winner Chat', 'Chat between winner and seller for auction: กาอะไรเนี่ยสวยจัง', 21, '2025-10-19 06:27:06', 35),
(25, '🏆 ยังไงๆๆ - Winner Chat', 'Chat between winner and seller for auction: ยังไงๆๆ', 21, '2025-10-19 07:05:23', 36),
(26, '🏆 asdasdasd - Winner Chat', 'Chat between winner and seller for auction: asdasdasd', 21, '2025-10-19 07:37:01', 37),
(27, 'เติมเงิน', '', 14, '2025-10-22 15:28:14', NULL),
(28, 'เติมเงิน', 'เติมเงินหน่อยครับ', 22, '2025-10-25 09:29:23', NULL),
(29, 'เติมเงินเข้าเว็บ', 'เติมเงินเข้าเว็บ', 23, '2025-10-25 18:48:45', NULL),
(30, '🏆 นาฬิกา PATEK PHILIPPE - Winner Chat', 'Chat room for auction \"นาฬิกา PATEK PHILIPPE\" winner: User_bidder001', 22, '2025-10-25 18:52:03', 39),
(31, '🏆 ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน - Winner Chat', 'Chat room for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน\" winner: 1515', 12, '2025-10-25 18:52:03', 20),
(32, '🏆 QQQ - Winner Chat', 'Chat room for auction \"QQQ\" winner: Nongpoom', 4, '2025-10-25 18:52:03', 14),
(33, '🏆 MYMY - Winner Chat', 'Chat room for auction \"MYMY\" winner: 1133', 2, '2025-10-25 18:52:03', 12),
(34, '🏆 qweq - Winner Chat', 'Chat room for auction \"qweq\" winner: 1144', 2, '2025-10-25 18:52:03', 9),
(35, '🏆 The Card - Winner Chat', 'Chat room for auction \"The Card\" winner: 3333', 3, '2025-10-25 18:52:03', 8),
(36, '🏆 Sale Egg - Winner Chat', 'Chat room for auction \"Sale Egg\" winner: 3333', 5, '2025-10-25 18:52:03', 7),
(37, '🏆 AEE - Winner Chat', 'Chat room for auction \"AEE\" winner: 3333', 5, '2025-10-25 18:52:03', 6),
(38, '🏆 11111 - Winner Chat', 'Chat room for auction \"11111\" winner: 1122', 2, '2025-10-25 18:52:03', 4),
(39, '🏆 ล้อแม็ก YOKOHAMA iceGUARD7 - Winner Chat', 'Chat room for auction \"ล้อแม็ก YOKOHAMA iceGUARD7\" winner: User_bidder001', 22, '2025-10-25 19:22:29', 40),
(40, '🏆 กีต้าร์ YAMAHA FG-301 - Winner Chat', 'Chat room for auction \"กีต้าร์ YAMAHA FG-301\" winner: User_bidder001', 22, '2025-10-25 20:38:00', 41),
(41, '🏆 กาน้ำร้อนโปราณหายาก - Winner Chat', 'Chat room for auction \"กาน้ำร้อนโปราณหายาก\" winner: User_bidder001', 22, '2025-10-25 20:47:23', 42),
(42, '🏆 แมวน้ำมูกไหล - Winner Chat', 'Chat room for auction \"แมวน้ำมูกไหล\" winner: User_bidder001', 22, '2025-10-30 14:51:19', 44),
(43, '🏆 限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ - Winner Chat', 'Chat room for auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\" winner: User_bidder001', 22, '2025-11-04 16:02:04', 45),
(44, '🏆 YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品 - Winner Chat', 'Chat room for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" winner: User_bidder002', 22, '2025-11-04 16:13:55', 46),
(45, '🏆 YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品 - Winner Chat', 'Chat room for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" winner: User_bidder002', 22, '2025-11-04 16:14:46', 46),
(46, '🏆 K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪 - Winner Chat', 'Chat room for auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" winner: User_bidder002', 22, '2025-11-04 16:28:55', 47),
(47, '🏆 K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪 - Winner Chat', 'Chat room for auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" winner: User_bidder002', 22, '2025-11-04 16:29:46', 47),
(48, '🏆 กาน้ำ - Winner Chat', 'Chat room for auction \"กาน้ำ\" winner: User_bidder001', 22, '2025-11-04 16:37:03', 48),
(49, '🏆 รถประกอบ - Winner Chat', 'Chat room for auction \"รถประกอบ\" winner: User_bidder002', 22, '2025-11-04 16:47:54', 49),
(50, '🏆 รถประกอบ - Winner Chat', 'Chat room for auction \"รถประกอบ\" winner: User_bidder002', 22, '2025-11-04 16:48:45', 49),
(51, '🏆 น้ำกา - Winner Chat', 'Chat room for auction \"น้ำกา\" winner: User_bidder002', 22, '2025-11-04 17:00:17', 50),
(52, '🏆 GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き - Winner Chat', 'Chat room for auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\" winner: User_bidder002', 22, '2025-11-04 18:08:23', 51),
(53, '🏆 กล้อง V2 - Winner Chat', 'Chat room for auction \"กล้อง V2\" winner: User_bidder001', 22, '2025-11-05 16:56:15', 53),
(54, '🏆 กาน้ำร้อนโคตรโบราณ - Winner Chat', 'Chat room for auction \"กาน้ำร้อนโคตรโบราณ\" winner: User_bidder002', 22, '2025-11-05 17:02:21', 54),
(55, '🏆 ถ้วยน้ำชา - Winner Chat', 'Chat room for auction \"ถ้วยน้ำชา\" winner: User_bidder002', 22, '2025-11-05 17:16:47', 56),
(56, '🏆 GAINWARD GeForce3 - Winner Chat', 'Chat room for auction \"GAINWARD GeForce3\" winner: User_bidder002', 22, '2025-11-05 17:22:24', 57),
(57, '🏆 กำไลข้อมือ - Winner Chat', 'Chat room for auction \"กำไลข้อมือ\" winner: User_bidder001', 22, '2025-11-05 17:29:39', 58),
(58, '🏆 รองเท้าเก่า - Winner Chat', 'Chat room for auction \"รองเท้าเก่า\" winner: User_bidder002', 22, '2025-11-05 17:37:22', 59),
(59, 'เติมเงินหน่อย', '', 27, '2025-11-05 17:50:46', NULL),
(60, '🏆 ไพ่ TCG - Winner Chat', 'Chat room for auction \"ไพ่ TCG\" winner: User_bidder002', 22, '2025-11-05 17:59:05', 61),
(61, '🏆 ONE PIECE - Winner Chat', 'Chat room for auction \"ONE PIECE\" winner: User_bidder002', 22, '2025-11-05 18:04:53', 62),
(62, '🏆 ไพ่การ์ด TCG - Winner Chat', 'Chat room for auction \"ไพ่การ์ด TCG\" winner: User_bidder002', 22, '2025-11-05 18:08:49', 74),
(63, '🏆 รองเท้าเก่ามากก - Winner Chat', 'Chat room for auction \"รองเท้าเก่ามากก\" winner: User_bidder001', 22, '2025-11-05 18:11:43', 64),
(64, '🏆 กาน้ำเก่ากาน้ำเก่า - Winner Chat', 'Chat room for auction \"กาน้ำเก่ากาน้ำเก่า\" winner: User_bidder001', 22, '2025-11-05 18:14:44', 65),
(65, '🏆 กาน้ำไก่ๆกา - Winner Chat', 'Chat room for auction \"กาน้ำไก่ๆกา\" winner: User_bidder002', 22, '2025-11-05 18:18:14', 66),
(66, '🏆 นาฬิกานาฬิกา - Winner Chat', 'Chat room for auction \"นาฬิกานาฬิกา\" winner: User_bidder002', 22, '2025-11-05 18:23:15', 67),
(67, '🏆 ไพ่การ์ฺด - Winner Chat', 'Chat room for auction \"ไพ่การ์ฺด\" winner: User_bidder002', 22, '2025-11-05 19:09:26', 69),
(68, '🏆 Krong - Winner Chat', 'Chat room for auction \"Krong\" winner: User_bidder001', 22, '2025-11-07 21:08:07', 71),
(69, '🏆 eiueieiei - Winner Chat', 'Chat room for auction \"eiueieiei\" winner: User_bidder002', 22, '2025-11-07 21:10:23', 72),
(70, '🏆 123456789 - Winner Chat', 'Chat room for auction \"123456789\" winner: User_bidder002', 22, '2025-11-07 21:19:04', 73),
(71, 'Test Image Room', 'Room for image upload testing', 28, '2025-11-07 22:57:13', NULL),
(72, 'เติมเงิน', '', 27, '2025-11-07 23:58:12', NULL),
(73, '🏆 สร้อย AEC - Winner Chat', 'Chat room for auction \"สร้อย AEC\" winner: User_bidder003', 29, '2025-11-08 03:09:00', 76),
(74, '🏆 แหวนเพชร 2.99 กะรัต - Winner Chat', 'Chat room for auction \"แหวนเพชร 2.99 กะรัต\" winner: User_bidder003', 29, '2025-11-08 03:39:15', 77),
(75, '🏆 รองเท้า - Winner Chat', 'Chat room for auction \"รองเท้า\" winner: User_bidder003', 29, '2025-11-08 04:21:28', 78),
(77, '🏆 นาฬิกา - Winner Chat', 'Chat room for auction \"นาฬิกา\" winner: User_bidder003', 29, '2025-11-08 05:07:21', 80),
(78, '🏆 Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器 - Winner Chat', 'Chat room for auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\" winner: User_bidder004', 22, '2026-03-11 14:50:02', 82),
(79, '🏆 กาไหน้ำ - Winner Chat', 'Chat room for auction \"กาไหน้ำ\" winner: User_bidder004', 29, '2026-03-18 14:15:09', 88),
(80, '🏆 §§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い - Winner Chat', 'Chat room for auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\" winner: User_bidder004', 29, '2026-03-18 14:33:25', 89),
(81, '🏆 ของเล่นไทย - Winner Chat', 'Chat room for auction \"ของเล่นไทย\" winner: User_bidder004', 29, '2026-03-18 14:46:09', 90),
(82, '🏆 ตากี้ - Winner Chat', 'Chat room for auction \"ตากี้\" winner: User_bidder004', 29, '2026-03-18 14:53:10', 91),
(83, 'เติมเงิน', 'สวัสดี', 23, '2026-04-06 02:46:53', NULL),
(84, '🏆 กาน้ำร้อน - Winner Chat', 'Chat room for auction \"กาน้ำร้อน\" winner: User_bidder001', 35, '2026-04-06 21:29:14', 95),
(85, '🏆 นาฬิกา 26351 - Winner Chat', 'Chat room for auction \"นาฬิกา 26351\" winner: User_bidder002', 22, '2026-04-08 15:29:23', 93),
(86, '🏆 แหวนหยก - Winner Chat', 'Chat room for auction \"แหวนหยก\" winner: User_bidder005', 35, '2026-04-08 15:35:23', 96),
(87, '🏆 กำไลทอง - Winner Chat', 'Chat room for auction \"กำไลทอง\" winner: User_bidder002', 35, '2026-04-08 16:18:20', 99),
(88, '🏆 หยกใหม่ - Winner Chat', 'Chat room for auction \"หยกใหม่\" winner: User_bidder005', 35, '2026-04-08 17:37:21', 97),
(89, '🏆 รองเท้า - Winner Chat', 'Chat room for auction \"รองเท้า\" winner: User_bidder002', 35, '2026-04-08 18:31:08', 100),
(90, '🏆 รองเท้าA - Winner Chat', 'Chat room for auction \"รองเท้าA\" winner: User_bidder002', 35, '2026-04-08 18:36:00', 101),
(91, '🏆 นาฬิกานาฬิกานาฬิกา - Winner Chat', 'Chat room for auction \"นาฬิกานาฬิกานาฬิกา\" winner: User_bidder002', 35, '2026-04-09 15:41:13', 104),
(92, '🏆 แพ็คการ์ด - Winner Chat', 'Chat room for auction \"แพ็คการ์ด\" winner: User_bidder002', 35, '2026-04-09 15:58:13', 105),
(93, '🏆 กีต้า - Winner Chat', 'Chat room for auction \"กีต้า\" winner: User_bidder002', 35, '2026-04-09 16:10:00', 106),
(94, '🏆 ประมูลไหโบราณ - Winner Chat', 'Chat room for auction \"ประมูลไหโบราณ\" winner: User_bidder002', 35, '2026-04-09 16:16:00', 107),
(95, '🏆 จานโบราณทรงสวย - Winner Chat', 'Chat room for auction \"จานโบราณทรงสวย\" winner: User_bidder002', 35, '2026-04-09 16:22:00', 108);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `auction_id` int(10) UNSIGNED DEFAULT NULL,
  `type` enum('auction_won','auction_lost','auction_ended','outbid','bid_refunded','topup_created','topup_approved','topup_rejected','withdrawal_created','withdrawal_approved','withdrawal_rejected') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `auction_id`, `type`, `title`, `message`, `is_read`, `created_at`, `context`) VALUES
(2, 5, 7, 'auction_ended', 'Auction Ended', 'Your auction \"Sale Egg\" has ended. Winner: 3333 with $3000.00.', 0, '2025-09-30 04:49:29', NULL),
(4, 3, 8, 'auction_ended', 'Auction Ended', 'Your auction \"The Card\" has ended. Winner: 3333 with $3000.00.', 1, '2025-09-30 05:11:21', NULL),
(5, 7, 9, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"qweq\" with a bid of $200000.00.', 0, '2025-10-01 06:11:53', NULL),
(11, 3, 4, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"11111\" with a bid of $12000.00.', 1, '2025-10-19 03:51:58', NULL),
(12, 6, 6, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"AEE\" with a bid of $2300.00.', 0, '2025-10-19 03:51:58', NULL),
(15, 4, 12, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"MYMY\" with a bid of $2200.00.', 0, '2025-10-19 03:51:58', NULL),
(17, 8, 14, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"QQQ\" with a bid of $30000.00.', 0, '2025-10-19 03:51:58', NULL),
(21, 12, 16, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ถ้วยน้ำชาโบราณ\". You can now discuss delivery and payment details.', 1, '2025-10-19 03:59:00', NULL),
(27, 2, 15, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"Test\" with a bid of $500000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:05:11', NULL),
(28, 2, 15, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"Test\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:05:11', NULL),
(29, 8, 15, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"Test\". You can now discuss delivery and payment details.', 0, '2025-10-19 04:05:11', NULL),
(30, 8, 15, 'auction_ended', 'Auction Ended', 'Your auction \"Test\" has ended. Winner: 1111 with $500000.00.', 0, '2025-10-19 04:05:11', NULL),
(32, 2, 13, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"UMAN\" with a bid of $2000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:06:02', NULL),
(33, 2, 13, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"UMAN\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:06:02', NULL),
(36, 2, 11, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"EWWW\" with a bid of $300000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:07:44', NULL),
(37, 2, 11, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"EWWW\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:07:44', NULL),
(38, 2, 11, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"EWWW\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:07:44', NULL),
(39, 2, 11, 'auction_ended', 'Auction Ended', 'Your auction \"EWWW\" has ended. Winner: 1111 with $300000.00.', 1, '2025-10-19 04:07:44', NULL),
(40, 2, 10, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"The Best\" with a bid of $400000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:07:44', NULL),
(41, 2, 10, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"The Best\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:07:44', NULL),
(42, 2, 10, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"The Best\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:07:44', NULL),
(43, 2, 10, 'auction_ended', 'Auction Ended', 'Your auction \"The Best\" has ended. Winner: 1111 with $400000.00.', 1, '2025-10-19 04:07:44', NULL),
(44, 2, 5, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"This aa\" has ended with no bids.', 1, '2025-10-19 04:07:44', NULL),
(47, 12, 19, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ถ้วยน้ำร้อน\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:11:07', NULL),
(48, 12, 19, 'auction_ended', 'Auction Ended', 'Your auction \"ถ้วยน้ำร้อน\" has ended. Winner: 1515 with $2500.00.', 1, '2025-10-19 04:11:07', NULL),
(50, 12, 20, 'auction_ended', 'Auction Ended', 'Your auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน\" has ended. Winner: 1515 with $5050.01.', 1, '2025-10-19 04:17:21', NULL),
(51, 14, 16, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ถ้วยน้ำชาโบราณ\" with a bid of $35000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:20:28', NULL),
(52, 12, 16, 'auction_ended', 'Auction Ended', 'Your auction \"ถ้วยน้ำชาโบราณ\" has ended. Winner: 1515 with $35000.00.', 1, '2025-10-19 04:20:28', NULL),
(63, 14, 25, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\" with a bid of $2600.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:32:05', NULL),
(64, 14, 25, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:32:05', NULL),
(65, 12, 25, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:32:05', NULL),
(66, 12, 25, 'auction_ended', 'Auction Ended', 'Your auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\" has ended. Winner: 1515 with $2600.00.', 1, '2025-10-19 04:32:05', NULL),
(67, 14, 26, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"151515\" with a bid of $250000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:39:10', NULL),
(68, 14, 26, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"151515\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:39:10', NULL),
(69, 12, 26, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"151515\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:39:10', NULL),
(70, 12, 26, 'auction_ended', 'Auction Ended', 'Your auction \"151515\" has ended. Winner: 1515 with $250000.00.', 1, '2025-10-19 04:39:10', NULL),
(71, 14, 27, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"131313\" with a bid of $25000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 04:58:01', NULL),
(72, 14, 27, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"131313\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:58:01', NULL),
(73, 12, 27, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"131313\". You can now discuss delivery and payment details.', 1, '2025-10-19 04:58:01', NULL),
(74, 12, 27, 'auction_ended', 'Auction Ended', 'Your auction \"131313\" has ended. Winner: 1515 with $25000.00.', 1, '2025-10-19 04:58:01', NULL),
(75, 14, 17, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาน้ำร้อนโบราณ\" with a bid of $45000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 05:01:01', NULL),
(76, 14, 17, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"กาน้ำร้อนโบราณ\". You can now discuss delivery and payment details.', 1, '2025-10-19 05:01:01', NULL),
(77, 12, 17, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"กาน้ำร้อนโบราณ\". You can now discuss delivery and payment details.', 1, '2025-10-19 05:01:01', NULL),
(78, 12, 17, 'auction_ended', 'Auction Ended', 'Your auction \"กาน้ำร้อนโบราณ\" has ended. Winner: 1515 with $45000.00.', 1, '2025-10-19 05:01:01', NULL),
(79, 14, 28, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"1411414\" with a bid of $1500.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 05:09:14', NULL),
(80, 14, 28, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"1411414\". You can now discuss delivery and payment details.', 1, '2025-10-19 05:09:14', NULL),
(81, 12, 28, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"1411414\". You can now discuss delivery and payment details.', 1, '2025-10-19 05:09:14', NULL),
(82, 12, 28, 'auction_ended', 'Auction Ended', 'Your auction \"1411414\" has ended. Winner: 1515 with $1500.00.', 1, '2025-10-19 05:09:14', NULL),
(83, 14, 29, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ถ้วยกาแฟไร\" with a bid of $25000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 05:25:19', NULL),
(84, 14, 29, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"ถ้วยกาแฟไร\". You can now discuss delivery and payment details.', 1, '2025-10-19 05:25:19', NULL),
(85, 12, 29, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ถ้วยกาแฟไร\". You can now discuss delivery and payment details.', 1, '2025-10-19 05:25:19', NULL),
(86, 12, 29, 'auction_ended', 'Auction Ended', 'Your auction \"ถ้วยกาแฟไร\" has ended. Winner: 1515 with $25000.00.', 1, '2025-10-19 05:25:19', NULL),
(87, 12, 30, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"กาน้ำร้อน\" has ended with no bids.', 1, '2025-10-19 05:35:12', NULL),
(88, 15, 31, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาไรปะ\" with a bid of $30000.00. You can now chat with the seller to arrange delivery.', 0, '2025-10-19 05:55:22', NULL),
(89, 15, 31, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"กาไรปะ\". You can now discuss delivery and payment details.', 0, '2025-10-19 05:55:22', NULL),
(92, 15, 32, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"Test Auction for Payment System\" with a bid of $1500.00. You can now chat with the seller to arrange delivery.', 0, '2025-10-19 06:02:25', NULL),
(93, 15, 32, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"Test Auction for Payment System\". You can now discuss delivery and payment details.', 0, '2025-10-19 06:02:25', NULL),
(96, 16, 33, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ไก่กา\" with a bid of $30000.00. You can now chat with the seller to arrange delivery.', 0, '2025-10-19 06:06:20', NULL),
(97, 16, 33, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"ไก่กา\". You can now discuss delivery and payment details.', 0, '2025-10-19 06:06:20', NULL),
(98, 17, 33, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ไก่กา\". You can now discuss delivery and payment details.', 0, '2025-10-19 06:06:20', NULL),
(99, 17, 33, 'auction_ended', 'Auction Ended', 'Your auction \"ไก่กา\" has ended. Winner: 1717 with $30000.00.', 0, '2025-10-19 06:06:20', NULL),
(100, 19, 34, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ไก่กาอาราเร่\" with a bid of $30000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 06:19:06', NULL),
(101, 19, 34, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"ไก่กาอาราเร่\". You can now discuss delivery and payment details.', 1, '2025-10-19 06:19:06', NULL),
(102, 18, 34, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ไก่กาอาราเร่\". You can now discuss delivery and payment details.', 0, '2025-10-19 06:19:06', NULL),
(103, 18, 34, 'auction_ended', 'Auction Ended', 'Your auction \"ไก่กาอาราเร่\" has ended. Winner: Phoompm920 with $30000.00.', 0, '2025-10-19 06:19:06', NULL),
(104, 19, 35, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาอะไรเนี่ยสวยจัง\" with a bid of $35000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 06:27:06', NULL),
(105, 19, 35, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"กาอะไรเนี่ยสวยจัง\". You can now discuss delivery and payment details.', 1, '2025-10-19 06:27:06', NULL),
(106, 21, 35, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"กาอะไรเนี่ยสวยจัง\". You can now discuss delivery and payment details.', 1, '2025-10-19 06:27:06', NULL),
(107, 21, 35, 'auction_ended', 'Auction Ended', 'Your auction \"กาอะไรเนี่ยสวยจัง\" has ended. Winner: Phoompm920 with $35000.00.', 1, '2025-10-19 06:27:06', NULL),
(108, 19, 36, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ยังไงๆๆ\" with a bid of $55000.00. You can now chat with the seller to arrange delivery.', 1, '2025-10-19 07:05:23', NULL),
(109, 19, 36, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"ยังไงๆๆ\". You can now discuss delivery and payment details.', 0, '2025-10-19 07:05:23', NULL),
(110, 21, 36, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"ยังไงๆๆ\". You can now discuss delivery and payment details.', 0, '2025-10-19 07:05:23', NULL),
(111, 21, 36, 'auction_ended', 'Auction Ended', 'Your auction \"ยังไงๆๆ\" has ended. Winner: Phoompm920 with $55000.00.', 0, '2025-10-19 07:05:23', NULL),
(112, 19, 37, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"asdasdasd\" with a bid of $25000.00. You can now chat with the seller to arrange delivery.', 0, '2025-10-19 07:37:01', NULL),
(113, 19, 37, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the seller of \"asdasdasd\". You can now discuss delivery and payment details.', 0, '2025-10-19 07:37:01', NULL),
(114, 21, 37, '', '💬 Chat Room Created', 'A chat room has been created for you to communicate with the winner of \"asdasdasd\". You can now discuss delivery and payment details.', 0, '2025-10-19 07:37:01', NULL),
(115, 21, 37, 'auction_ended', 'Auction Ended', 'Your auction \"asdasdasd\" has ended. Winner: Phoompm920 with $25000.00.', 0, '2025-10-19 07:37:01', NULL),
(116, 22, 38, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"กล้อง Nikon COOLPIX A900\" has ended with no bids.', 1, '2025-10-25 10:35:11', NULL),
(117, 23, 39, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"นาฬิกา PATEK PHILIPPE\" with a bid of $650000.00.', 1, '2025-10-25 18:49:20', NULL),
(118, 22, 39, 'auction_ended', 'Auction Ended', 'Your auction \"นาฬิกา PATEK PHILIPPE\" has ended. Winner: User_bidder001 with $650000.00.', 1, '2025-10-25 18:49:20', NULL),
(119, 23, 40, '', '💳 Payment Required', 'Please complete payment for \"ล้อแม็ก YOKOHAMA iceGUARD7\". Amount: $255000.00', 1, '2025-10-25 19:22:29', NULL),
(120, 23, 40, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ล้อแม็ก YOKOHAMA iceGUARD7\" with a bid of $255000.00.', 1, '2025-10-25 19:22:29', NULL),
(121, 22, 40, 'auction_ended', 'Auction Ended', 'Your auction \"ล้อแม็ก YOKOHAMA iceGUARD7\" has ended. Winner: User_bidder001 with $255000.00.', 1, '2025-10-25 19:22:29', NULL),
(122, 23, 41, '', '💳 Payment Required', 'Please complete payment for \"กีต้าร์ YAMAHA FG-301\". Amount: $260000.00', 1, '2025-10-25 20:38:00', NULL),
(123, 23, 41, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กีต้าร์ YAMAHA FG-301\" with a bid of $260000.00.', 1, '2025-10-25 20:38:00', NULL),
(124, 22, 41, 'auction_ended', 'Auction Ended', 'Your auction \"กีต้าร์ YAMAHA FG-301\" has ended. Winner: User_bidder001 with $260000.00.', 1, '2025-10-25 20:38:00', NULL),
(125, 23, 42, '', '💳 Payment Required', 'Please complete payment for \"กาน้ำร้อนโปราณหายาก\". Amount: $260000.00', 1, '2025-10-25 20:47:23', NULL),
(126, 23, 42, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาน้ำร้อนโปราณหายาก\" with a bid of $260000.00.', 1, '2025-10-25 20:47:23', NULL),
(127, 22, 42, 'auction_ended', 'Auction Ended', 'Your auction \"กาน้ำร้อนโปราณหายาก\" has ended. Winner: User_bidder001 with $260000.00.', 1, '2025-10-25 20:47:23', NULL),
(128, 23, 44, '', '💳 Payment Required', 'Please complete payment for \"แมวน้ำมูกไหล\". Amount: $300000.00', 1, '2025-10-30 14:51:19', NULL),
(129, 23, 44, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"แมวน้ำมูกไหล\" with a bid of $300000.00.', 1, '2025-10-30 14:51:19', NULL),
(130, 22, 44, 'auction_ended', 'Auction Ended', 'Your auction \"แมวน้ำมูกไหล\" has ended. Winner: User_bidder001 with $300000.00.', 1, '2025-10-30 14:51:19', NULL),
(131, 23, 45, '', '💳 Payment Required', 'Please complete payment for \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\". Amount: $270000.00', 1, '2025-11-04 16:02:04', NULL),
(132, 23, 45, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\" with a bid of $270000.00.', 1, '2025-11-04 16:02:04', NULL),
(133, 22, 45, 'auction_ended', 'Auction Ended', 'Your auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\" has ended. Winner: User_bidder001 with $270000.00.', 1, '2025-11-04 16:02:04', NULL),
(135, 27, 46, '', '💳 Payment Required', 'Please complete payment for \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". Amount: $300000.00', 1, '2025-11-04 16:13:55', NULL),
(136, 27, 46, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" with a bid of $300000.00.', 1, '2025-11-04 16:13:55', NULL),
(137, 22, 46, 'auction_ended', 'Auction Ended', 'Your auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" has ended. Winner: User_bidder002 with $300000.00.', 1, '2025-11-04 16:13:55', NULL),
(139, 27, 46, '', '💳 Payment Required', 'Please complete payment for \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". Amount: $300000.00', 1, '2025-11-04 16:14:46', NULL),
(140, 27, 46, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" with a bid of $300000.00.', 1, '2025-11-04 16:14:46', NULL),
(141, 22, 46, 'auction_ended', 'Auction Ended', 'Your auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" has ended. Winner: User_bidder002 with $300000.00.', 1, '2025-11-04 16:14:46', NULL),
(143, 27, 47, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" with a bid of $230000.00.', 1, '2025-11-04 16:28:55', NULL),
(144, 22, 47, 'auction_ended', 'Auction Ended', 'Your auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" has ended. Winner: User_bidder002 with $230000.00.', 1, '2025-11-04 16:28:55', NULL),
(146, 27, 47, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" with a bid of $230000.00.', 1, '2025-11-04 16:29:46', NULL),
(147, 22, 47, 'auction_ended', 'Auction Ended', 'Your auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" has ended. Winner: User_bidder002 with $230000.00.', 1, '2025-11-04 16:29:46', NULL),
(148, 23, 48, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาน้ำ\" with a bid of $300000.00.', 1, '2025-11-04 16:37:03', NULL),
(149, 22, 48, 'auction_ended', 'Auction Ended', 'Your auction \"กาน้ำ\" has ended. Winner: User_bidder001 with $300000.00.', 1, '2025-11-04 16:37:03', NULL),
(151, 27, 49, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"รถประกอบ\" with a bid of $300000.00.', 1, '2025-11-04 16:47:54', NULL),
(152, 22, 49, 'auction_ended', 'Auction Ended', 'Your auction \"รถประกอบ\" has ended. Winner: User_bidder002 with $300000.00.', 1, '2025-11-04 16:47:54', NULL),
(155, 27, 50, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"น้ำกา\" with a bid of $300000.00.', 1, '2025-11-04 17:00:17', NULL),
(156, 22, 50, 'auction_ended', 'Auction Ended', 'Your auction \"น้ำกา\" has ended. Winner: User_bidder002 with $300000.00.', 1, '2025-11-04 17:00:17', NULL),
(158, 23, 51, 'bid_refunded', '💰 Bid Refunded', 'Your bid of $1000000.00 for \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\" has been refunded. You did not win this sealed auction.', 1, '2025-11-04 18:08:23', NULL),
(159, 27, 51, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\" with a bid of $1200000.00.', 1, '2025-11-04 18:08:23', NULL),
(160, 22, 51, 'auction_ended', 'Auction Ended', 'Your auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\" has ended. Winner: User_bidder002 with $1200000.00.', 1, '2025-11-04 18:08:23', NULL),
(161, 22, 52, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"กล้องasdasd\" has ended with no bids.', 1, '2025-11-05 16:54:15', NULL),
(162, 23, 53, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กล้อง V2\" with a bid of $300000.00.', 1, '2025-11-05 16:56:15', NULL),
(163, 22, 53, 'auction_ended', 'Auction Ended', 'Your auction \"กล้อง V2\" has ended. Winner: User_bidder001 with $300000.00.', 1, '2025-11-05 16:56:15', NULL),
(170, 22, 57, 'bid_refunded', 'เงินคืนการประมูล', 'การประมูล \"GAINWARD GeForce3\" ถูกปิดด้วยการซื้อทันที เงินจำนวน ฿800000.00 ถูกคืนให้คุณแล้ว', 1, '2025-11-05 17:22:24', NULL),
(171, 27, 57, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"GAINWARD GeForce3\" ในราคา ฿820000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 17:22:24', NULL),
(172, 22, 57, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"GAINWARD GeForce3\" ถูกปิดด้วยการซื้อทันทีในราคา ฿820000.00', 1, '2025-11-05 17:22:24', NULL),
(173, 23, 58, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"กำไลข้อมือ\" ในราคา ฿850000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 17:29:39', NULL),
(174, 22, 58, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"กำไลข้อมือ\" ถูกปิดด้วยการซื้อทันทีในราคา ฿850000.00', 1, '2025-11-05 17:29:39', NULL),
(175, 27, 59, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"รองเท้าเก่า\" ในราคา ฿5000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 17:37:22', NULL),
(176, 22, 59, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"รองเท้าเก่า\" ถูกปิดด้วยการซื้อทันทีในราคา ฿5000.00', 1, '2025-11-05 17:37:22', NULL),
(177, 23, 60, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"การ์ด TCG\" ในราคา ฿400000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 17:54:32', NULL),
(178, 22, 60, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"การ์ด TCG\" ถูกปิดด้วยการซื้อทันทีในราคา ฿400000.00', 1, '2025-11-05 17:54:32', NULL),
(179, 27, 61, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"ไพ่ TCG\" ในราคา ฿400000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 17:59:05', NULL),
(180, 22, 61, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"ไพ่ TCG\" ถูกปิดด้วยการซื้อทันทีในราคา ฿400000.00', 1, '2025-11-05 17:59:05', NULL),
(181, 27, 62, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"ONE PIECE\" ในราคา ฿50000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:04:53', NULL),
(182, 22, 62, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"ONE PIECE\" ถูกปิดด้วยการซื้อทันทีในราคา ฿50000.00', 1, '2025-11-05 18:04:53', NULL),
(183, 27, 63, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"ไพ่การ์ด TCG\" ในราคา ฿400000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:08:49', NULL),
(184, 22, 63, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"ไพ่การ์ด TCG\" ถูกปิดด้วยการซื้อทันทีในราคา ฿400000.00', 1, '2025-11-05 18:08:49', NULL),
(185, 23, 64, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"รองเท้าเก่ามากก\" ในราคา ฿500000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:11:43', NULL),
(186, 22, 64, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"รองเท้าเก่ามากก\" ถูกปิดด้วยการซื้อทันทีในราคา ฿500000.00', 1, '2025-11-05 18:11:43', NULL),
(187, 23, 65, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"กาน้ำเก่ากาน้ำเก่า\" ในราคา ฿800000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:14:44', NULL),
(188, 22, 65, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"กาน้ำเก่ากาน้ำเก่า\" ถูกปิดด้วยการซื้อทันทีในราคา ฿800000.00', 1, '2025-11-05 18:14:44', NULL),
(189, 27, 66, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"กาน้ำไก่ๆกา\" ในราคา ฿50000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:18:14', NULL),
(190, 22, 66, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"กาน้ำไก่ๆกา\" ถูกปิดด้วยการซื้อทันทีในราคา ฿50000.00', 1, '2025-11-05 18:18:14', NULL),
(191, 27, 67, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"นาฬิกานาฬิกา\" ในราคา ฿90000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:23:15', NULL),
(192, 22, 67, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"นาฬิกานาฬิกา\" ถูกปิดด้วยการซื้อทันทีในราคา ฿90000.00', 1, '2025-11-05 18:23:15', NULL),
(193, 27, 68, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"การ์ด TCG\" ในราคา ฿80000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 18:28:14', NULL),
(194, 22, 68, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"การ์ด TCG\" ถูกปิดด้วยการซื้อทันทีในราคา ฿80000.00', 1, '2025-11-05 18:28:14', NULL),
(195, 27, 69, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"ไพ่การ์ฺด\" ในราคา ฿400000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-05 19:09:26', NULL),
(196, 22, 69, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"ไพ่การ์ฺด\" ถูกปิดด้วยการซื้อทันทีในราคา ฿400000.00', 1, '2025-11-05 19:09:26', NULL),
(197, 27, 70, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"การ์ด\" with a bid of $21000.00.', 1, '2025-11-05 19:11:13', NULL),
(198, 22, 70, 'auction_ended', 'Auction Ended', 'Your auction \"การ์ด\" has ended. Winner: User_bidder002 with $21000.00.', 1, '2025-11-05 19:11:13', NULL),
(199, 23, 71, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"Krong\" ในราคา ฿90000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 1, '2025-11-07 21:08:07', NULL),
(200, 22, 71, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"Krong\" ถูกปิดด้วยการซื้อทันทีในราคา ฿90000.00', 1, '2025-11-07 21:08:07', NULL),
(201, 27, 72, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"eiueieiei\" with a bid of $4000.00.', 1, '2025-11-07 21:10:23', NULL),
(202, 22, 72, 'auction_ended', 'Auction Ended', 'Your auction \"eiueieiei\" has ended. Winner: User_bidder002 with $4000.00.', 1, '2025-11-07 21:10:23', NULL),
(203, 27, 73, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"123456789\" with a bid of $3500.00.', 1, '2025-11-07 21:19:04', NULL),
(204, 22, 73, 'auction_ended', 'Auction Ended', 'Your auction \"123456789\" has ended. Winner: User_bidder002 with $3500.00.', 1, '2025-11-07 21:19:04', NULL),
(205, 27, 74, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"การ์ด TCG\" with a bid of $60000.00.', 1, '2025-11-07 23:39:28', NULL),
(207, 27, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿5000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2025-11-08 03:01:47', '{\"requestId\":5,\"amount\":5000}'),
(208, 27, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿5000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2025-11-08 03:02:07', '{\"requestId\":5,\"amount\":5000,\"note\":null}'),
(209, 30, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿2500000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2025-11-08 03:05:10', '{\"requestId\":6,\"amount\":2500000}'),
(210, 30, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿2500000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2025-11-08 03:05:49', '{\"requestId\":6,\"amount\":2500000,\"note\":null}'),
(211, 30, 76, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"สร้อย AEC\" with a bid of $36000.00.', 1, '2025-11-08 03:09:00', NULL),
(212, 29, 76, 'auction_ended', 'Auction Ended', 'Your auction \"สร้อย AEC\" has ended. Winner: User_bidder003 with $36000.00.', 1, '2025-11-08 03:09:00', NULL),
(213, 30, 77, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"แหวนเพชร 2.99 กะรัต\" with a bid of $500000.00.', 1, '2025-11-08 03:39:15', NULL),
(214, 29, 77, 'auction_ended', 'Auction Ended', 'Your auction \"แหวนเพชร 2.99 กะรัต\" has ended. Winner: User_bidder003 with $500000.00.', 1, '2025-11-08 03:39:15', NULL),
(215, 30, 78, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"รองเท้า\" with a bid of $34000.00.', 0, '2025-11-08 04:21:28', NULL),
(216, 29, 78, 'auction_ended', 'Auction Ended', 'Your auction \"รองเท้า\" has ended. Winner: User_bidder003 with $34000.00.', 1, '2025-11-08 04:21:28', NULL),
(219, 30, 80, 'auction_won', 'คุณซื้อสินค้าสำเร็จ!', 'คุณได้ซื้อ \"นาฬิกา\" ในราคา ฿400000.00 เรียบร้อยแล้ว กรุณาชำระเงินเพื่อดำเนินการต่อ', 0, '2025-11-08 05:07:21', NULL),
(220, 29, 80, 'auction_ended', 'การประมูลของคุณถูกปิดด้วยการซื้อทันที', 'การประมูล \"นาฬิกา\" ถูกปิดด้วยการซื้อทันทีในราคา ฿400000.00', 1, '2025-11-08 05:07:21', NULL),
(221, 31, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿900000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-03-11 14:39:11', '{\"requestId\":7,\"amount\":900000}'),
(222, 31, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿900000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-03-11 14:40:01', '{\"requestId\":7,\"amount\":900000,\"note\":\"ด่วนๆ\"}'),
(223, 31, 82, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\" with a bid of $4359.97.', 1, '2026-03-11 14:50:02', NULL),
(224, 22, 82, 'auction_ended', 'Auction Ended', 'Your auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\" has ended. Winner: User_bidder004 with $4359.97.', 1, '2026-03-11 14:50:02', NULL),
(225, 22, NULL, 'withdrawal_created', 'ส่งคำขอถอนเงินเรียบร้อย', 'คำขอถอนเงิน ฿520.00 ถูกส่งแล้ว (ค่าธรรมเนียม ฿20.00) สถานะ: รอตรวจสอบ', 1, '2026-03-11 15:38:27', '{\"requestId\":1,\"amount\":520,\"fee\":20,\"payoutAmount\":500}'),
(226, 22, NULL, 'withdrawal_approved', 'ถอนเงินสำเร็จ', 'คำขอถอนเงิน ฿520.00 ได้รับการอนุมัติแล้ว (ค่าธรรมเนียม ฿20.00)', 1, '2026-03-11 15:38:51', '{\"requestId\":1,\"amount\":520,\"fee\":20,\"payoutAmount\":500,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1773218331464-811183345.jpg\",\"note\":null}'),
(227, 22, NULL, 'withdrawal_created', 'ส่งคำขอถอนเงินเรียบร้อย', 'คำขอถอนเงิน ฿520.00 ถูกส่งแล้ว (ค่าธรรมเนียม ฿20.00) สถานะ: รอตรวจสอบ', 1, '2026-03-11 15:41:50', '{\"requestId\":2,\"amount\":520,\"fee\":20,\"payoutAmount\":500}'),
(228, 22, NULL, 'withdrawal_rejected', 'คำขอถอนเงินถูกปฏิเสธ', 'คำขอถอนเงิน ฿520.00 ถูกปฏิเสธ ยอดเงินถูกคืนเข้าบัญชีของคุณแล้ว', 1, '2026-03-11 15:42:31', '{\"requestId\":2,\"amount\":520,\"note\":null}'),
(229, 22, 81, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"Audemars Piguet Royal Oak Chronograph Green Dial 26240ST\" has ended with no bids.', 1, '2026-03-13 00:39:46', NULL),
(230, 32, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿500000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-03-13 00:42:47', '{\"requestId\":8,\"amount\":500000}'),
(231, 32, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿500000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-03-13 00:45:09', '{\"requestId\":8,\"amount\":500000,\"note\":\"เติมด่วนแอด\"}'),
(232, 32, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿35000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-03-18 13:44:27', '{\"requestId\":9,\"amount\":35000}'),
(233, 32, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿35000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-03-18 13:45:14', '{\"requestId\":9,\"amount\":35000,\"note\":null}'),
(234, 32, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿5000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-03-18 13:46:27', '{\"requestId\":10,\"amount\":5000}'),
(235, 32, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿5000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-03-18 13:46:40', '{\"requestId\":10,\"amount\":5000,\"note\":null}'),
(236, 32, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿5000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-03-18 13:52:59', '{\"requestId\":11,\"amount\":5000}'),
(237, 32, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿5000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-03-18 13:53:06', '{\"requestId\":11,\"amount\":5000,\"note\":null}'),
(238, 32, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿900.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-03-18 13:54:05', '{\"requestId\":12,\"amount\":900}'),
(239, 32, NULL, 'topup_rejected', 'คำขอเติมเงินถูกปฏิเสธ', 'ขออภัย คำขอเติมเงินจำนวน ฿900.00 ถูกปฏิเสธ กรุณาตรวจสอบหมายเหตุและส่งใหม่อีกครั้ง', 1, '2026-03-18 13:54:40', '{\"requestId\":12,\"amount\":900,\"note\":null}'),
(240, 31, 88, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาไหน้ำ\" with a bid of $4300.00.', 1, '2026-03-18 14:15:09', NULL),
(241, 29, 88, 'auction_ended', 'Auction Ended', 'Your auction \"กาไหน้ำ\" has ended. Winner: User_bidder004 with $4300.00.', 1, '2026-03-18 14:15:09', NULL),
(242, 31, 89, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\" with a bid of $5100.00.', 1, '2026-03-18 14:33:25', NULL),
(243, 29, 89, 'auction_ended', 'Auction Ended', 'Your auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\" has ended. Winner: User_bidder004 with $5100.00.', 1, '2026-03-18 14:33:25', NULL),
(244, 31, 90, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ของเล่นไทย\" with a bid of $4550.00.', 1, '2026-03-18 14:46:09', NULL),
(245, 29, 90, 'auction_ended', 'Auction Ended', 'Your auction \"ของเล่นไทย\" has ended. Winner: User_bidder004 with $4550.00.', 1, '2026-03-18 14:46:09', NULL),
(246, 31, 91, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ตากี้\" with a bid of $6000.00.', 1, '2026-03-18 14:53:10', NULL),
(247, 29, 91, 'auction_ended', 'Auction Ended', 'Your auction \"ตากี้\" has ended. Winner: User_bidder004 with $6000.00.', 1, '2026-03-18 14:53:10', NULL),
(248, 34, 92, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"สร้อยแหวนรวมกันมันส์กว่า\" has ended with no bids.', 1, '2026-04-05 15:47:23', NULL),
(249, 23, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿500.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 0, '2026-04-06 03:38:31', '{\"requestId\":13,\"amount\":500}'),
(250, 35, 94, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"กาน้ำร้อน\" has ended with no bids.', 1, '2026-04-06 20:50:20', NULL),
(251, 23, 95, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กาน้ำร้อน\" with a bid of $6500.00.', 0, '2026-04-06 21:29:14', NULL),
(252, 35, 95, 'auction_ended', 'Auction Ended', 'Your auction \"กาน้ำร้อน\" has ended. Winner: User_bidder001 with $6500.00.', 1, '2026-04-06 21:29:14', NULL),
(253, 27, 93, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"นาฬิกา 26351\" with a bid of $30000.00.', 1, '2026-04-08 15:29:23', NULL),
(254, 22, 93, 'auction_ended', 'Auction Ended', 'Your auction \"นาฬิกา 26351\" has ended. Winner: User_bidder002 with $30000.00.', 0, '2026-04-08 15:29:23', NULL),
(255, 32, 96, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"แหวนหยก\" with a bid of $3200.00.', 1, '2026-04-08 15:35:23', NULL),
(256, 35, 96, 'auction_ended', 'Auction Ended', 'Your auction \"แหวนหยก\" has ended. Winner: User_bidder005 with $3200.00.', 1, '2026-04-08 15:35:23', NULL),
(257, 27, 99, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กำไลทอง\" with a bid of $45000.00.', 1, '2026-04-08 16:18:20', NULL),
(258, 35, 99, 'auction_ended', 'Auction Ended', 'Your auction \"กำไลทอง\" has ended. Winner: User_bidder002 with $45000.00.', 1, '2026-04-08 16:18:20', NULL),
(259, 32, 97, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"หยกใหม่\" with a bid of $5400.00.', 1, '2026-04-08 17:37:21', NULL),
(260, 35, 97, 'auction_ended', 'Auction Ended', 'Your auction \"หยกใหม่\" has ended. Winner: User_bidder005 with $5400.00.', 1, '2026-04-08 17:37:21', NULL),
(261, 27, 100, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"รองเท้า\" with a bid of $3500.00.', 1, '2026-04-08 18:31:08', NULL),
(262, 35, 100, 'auction_ended', 'Auction Ended', 'Your auction \"รองเท้า\" has ended. Winner: User_bidder002 with $3500.00.', 1, '2026-04-08 18:31:08', NULL),
(263, 27, 101, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"รองเท้าA\" with a bid of $4000.00.', 1, '2026-04-08 18:36:00', NULL),
(264, 35, 101, 'auction_ended', 'Auction Ended', 'Your auction \"รองเท้าA\" has ended. Winner: User_bidder002 with $4000.00.', 1, '2026-04-08 18:36:00', NULL),
(265, 32, 101, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"รองเท้าA\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ (ผู้ชนะ: User_bidder002).', 1, '2026-04-08 18:36:00', NULL),
(266, 35, 98, 'auction_ended', 'Auction Ended - No Bids', 'Your auction \"กีต้า\" has ended with no bids.', 1, '2026-04-09 15:32:58', NULL),
(267, 27, 103, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"นาฬิกานาฬิกานาฬิกา\" with a bid of $9500.00.', 1, '2026-04-09 15:41:13', NULL),
(268, 35, 103, 'auction_ended', 'Auction Ended', 'Your auction \"นาฬิกานาฬิกานาฬิกา\" has ended.', 1, '2026-04-09 15:41:13', NULL),
(269, 32, 103, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"นาฬิกานาฬิกานาฬิกา\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ', 1, '2026-04-09 15:41:13', NULL),
(270, 32, 104, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"นาฬิกานาฬิกานาฬิกา\" with a bid of $6000.00.', 1, '2026-04-09 15:55:13', NULL),
(271, 35, 104, 'auction_ended', 'Auction Ended', 'Your auction \"นาฬิกานาฬิกานาฬิกา\" has ended.', 1, '2026-04-09 15:55:13', NULL),
(272, 27, 104, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"นาฬิกานาฬิกานาฬิกา\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ', 1, '2026-04-09 15:55:13', NULL),
(273, 27, 105, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"แพ็คการ์ด\" with a bid of $5500.00.', 1, '2026-04-09 15:58:13', NULL),
(274, 35, 105, 'auction_ended', 'Auction Ended', 'Your auction \"แพ็คการ์ด\" has ended.', 1, '2026-04-09 15:58:13', NULL),
(275, 32, 105, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"แพ็คการ์ด\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ', 1, '2026-04-09 15:58:13', NULL),
(276, 27, 106, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"กีต้า\" with a bid of $6500.00.', 1, '2026-04-09 16:10:00', NULL),
(277, 35, 106, 'auction_ended', 'Auction Ended', 'Your auction \"กีต้า\" has ended.', 1, '2026-04-09 16:10:00', NULL),
(278, 32, 106, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"กีต้า\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ', 1, '2026-04-09 16:10:00', NULL),
(279, 27, 107, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"ประมูลไหโบราณ\" with a bid of $6600.00.', 1, '2026-04-09 16:16:00', NULL),
(280, 35, 107, 'auction_ended', 'Auction Ended', 'Your auction \"ประมูลไหโบราณ\" has ended. Winner: User_bidder002 with $6600.00.', 1, '2026-04-09 16:16:00', NULL),
(281, 32, 107, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"ประมูลไหโบราณ\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ', 0, '2026-04-09 16:16:00', NULL),
(282, 27, 108, 'auction_won', '🎉 You Won an Auction!', 'Congratulations! You won the auction \"จานโบราณทรงสวย\" with a bid of $7000.00.', 1, '2026-04-09 16:22:00', NULL),
(283, 35, 108, 'auction_ended', 'Auction Ended', 'Your auction \"จานโบราณทรงสวย\" has ended. Winner: User_bidder002 with $7000.00.', 1, '2026-04-09 16:22:00', NULL),
(284, 32, 108, 'auction_lost', '❌ แพ้การประมูล', 'การประมูล \"จานโบราณทรงสวย\" สิ้นสุดแล้ว คุณไม่ได้เป็นผู้ชนะ', 0, '2026-04-09 16:22:00', NULL),
(285, 27, NULL, 'withdrawal_created', 'ส่งคำขอถอนเงินเรียบร้อย', 'คำขอถอนเงิน ฿100.00 ถูกส่งแล้ว (ค่าธรรมเนียม ฿20.00) สถานะ: รอตรวจสอบ', 1, '2026-04-10 00:13:48', '{\"requestId\":3,\"amount\":100,\"fee\":20,\"payoutAmount\":80}'),
(286, 27, NULL, 'withdrawal_approved', 'ถอนเงินสำเร็จ', 'คำขอถอนเงิน ฿100.00 ได้รับการอนุมัติแล้ว (ค่าธรรมเนียม ฿20.00)', 1, '2026-04-10 00:14:10', '{\"requestId\":3,\"amount\":100,\"fee\":20,\"payoutAmount\":80,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1775754850370-865328615.jpg\",\"note\":null}'),
(287, 35, NULL, 'withdrawal_created', 'ส่งคำขอถอนเงินเรียบร้อย', 'คำขอถอนเงิน ฿1000.00 ถูกส่งแล้ว (ค่าธรรมเนียม ฿20.00) สถานะ: รอตรวจสอบ', 0, '2026-04-10 00:52:32', '{\"requestId\":4,\"amount\":1000,\"fee\":20,\"payoutAmount\":980}'),
(288, 1, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿1000.00 รอตรวจสอบ', 0, '2026-04-10 00:52:32', '{\"requestId\":4,\"amount\":1000,\"fromUserId\":35}'),
(289, 26, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿1000.00 รอตรวจสอบ', 0, '2026-04-10 00:52:32', '{\"requestId\":4,\"amount\":1000,\"fromUserId\":35}'),
(290, 2, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿1000.00 รอตรวจสอบ', 0, '2026-04-10 00:52:32', '{\"requestId\":4,\"amount\":1000,\"fromUserId\":35}'),
(291, 8, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿1000.00 รอตรวจสอบ', 0, '2026-04-10 00:52:32', '{\"requestId\":4,\"amount\":1000,\"fromUserId\":35}'),
(292, 25, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿1000.00 รอตรวจสอบ', 0, '2026-04-10 00:52:32', '{\"requestId\":4,\"amount\":1000,\"fromUserId\":35}'),
(293, 35, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿500.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 0, '2026-04-10 00:58:37', '{\"requestId\":14,\"amount\":500}'),
(294, 1, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 00:58:37', '{\"requestId\":14,\"amount\":500,\"fromUserId\":35}'),
(295, 26, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 00:58:37', '{\"requestId\":14,\"amount\":500,\"fromUserId\":35}'),
(296, 8, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 00:58:37', '{\"requestId\":14,\"amount\":500,\"fromUserId\":35}'),
(297, 25, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 00:58:37', '{\"requestId\":14,\"amount\":500,\"fromUserId\":35}'),
(298, 2, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 00:58:37', '{\"requestId\":14,\"amount\":500,\"fromUserId\":35}'),
(299, 34, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿500.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-04-10 07:48:44', '{\"requestId\":15,\"amount\":500}'),
(300, 25, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 07:48:44', '{\"requestId\":15,\"amount\":500,\"fromUserId\":34}'),
(301, 2, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 07:48:44', '{\"requestId\":15,\"amount\":500,\"fromUserId\":34}'),
(302, 26, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 07:48:44', '{\"requestId\":15,\"amount\":500,\"fromUserId\":34}'),
(303, 1, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 07:48:44', '{\"requestId\":15,\"amount\":500,\"fromUserId\":34}'),
(304, 8, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 07:48:44', '{\"requestId\":15,\"amount\":500,\"fromUserId\":34}'),
(305, 34, NULL, 'topup_created', 'ส่งคำขอเติมเงินเรียบร้อย', 'เรารับคำขอเติมเงินจำนวน ฿10000.00 แล้ว กรุณารอเจ้าหน้าที่ตรวจสอบ', 1, '2026-04-10 07:54:59', '{\"requestId\":16,\"amount\":10000}'),
(306, 26, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿10000.00 รอตรวจสอบ', 0, '2026-04-10 07:54:59', '{\"requestId\":16,\"amount\":10000,\"fromUserId\":34}'),
(307, 25, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿10000.00 รอตรวจสอบ', 0, '2026-04-10 07:54:59', '{\"requestId\":16,\"amount\":10000,\"fromUserId\":34}'),
(308, 8, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿10000.00 รอตรวจสอบ', 0, '2026-04-10 07:54:59', '{\"requestId\":16,\"amount\":10000,\"fromUserId\":34}'),
(309, 1, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿10000.00 รอตรวจสอบ', 0, '2026-04-10 07:54:59', '{\"requestId\":16,\"amount\":10000,\"fromUserId\":34}'),
(310, 2, NULL, 'topup_created', 'มีคำขอเติมเงินใหม่', 'มีผู้ใช้ส่งคำขอเติมเงิน ฿10000.00 รอตรวจสอบ', 0, '2026-04-10 07:54:59', '{\"requestId\":16,\"amount\":10000,\"fromUserId\":34}'),
(311, 34, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿10000.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-04-10 07:55:54', '{\"requestId\":16,\"amount\":10000,\"note\":\"10000\"}'),
(312, 34, NULL, 'topup_approved', 'คำขอเติมเงินได้รับการอนุมัติ', 'คำขอเติมเงินจำนวน ฿500.00 ได้รับการอนุมัติแล้ว ยอดเงินถูกเพิ่มในบัญชีของคุณ', 1, '2026-04-10 07:55:56', '{\"requestId\":15,\"amount\":500,\"note\":\"โอนแล้วครับ\"}'),
(313, 35, NULL, 'withdrawal_created', 'ส่งคำขอถอนเงินเรียบร้อย', 'คำขอถอนเงิน ฿500.00 ถูกส่งแล้ว (ค่าธรรมเนียม ฿20.00) สถานะ: รอตรวจสอบ', 0, '2026-04-10 08:35:18', '{\"requestId\":5,\"amount\":500,\"fee\":20,\"payoutAmount\":480}'),
(314, 2, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 08:35:18', '{\"requestId\":5,\"amount\":500,\"fromUserId\":35}'),
(315, 26, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 08:35:18', '{\"requestId\":5,\"amount\":500,\"fromUserId\":35}'),
(316, 25, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 08:35:18', '{\"requestId\":5,\"amount\":500,\"fromUserId\":35}'),
(317, 8, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 08:35:18', '{\"requestId\":5,\"amount\":500,\"fromUserId\":35}'),
(318, 1, NULL, 'withdrawal_created', 'มีคำขอถอนเงินใหม่', 'มีผู้ใช้ส่งคำขอถอนเงิน ฿500.00 รอตรวจสอบ', 0, '2026-04-10 08:35:18', '{\"requestId\":5,\"amount\":500,\"fromUserId\":35}'),
(319, 35, NULL, 'withdrawal_approved', 'ถอนเงินสำเร็จ', 'คำขอถอนเงิน ฿1000.00 ได้รับการอนุมัติแล้ว (ค่าธรรมเนียม ฿20.00)', 0, '2026-04-10 08:35:31', '{\"requestId\":4,\"amount\":1000,\"fee\":20,\"payoutAmount\":980,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1775784931200-79703688.jpg\",\"note\":null}');

-- --------------------------------------------------------

--
-- Table structure for table `payment_escrow`
--

CREATE TABLE `payment_escrow` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `escrow_amount` decimal(12,2) NOT NULL,
  `platform_fee` decimal(12,2) DEFAULT 0.00,
  `seller_amount` decimal(12,2) NOT NULL,
  `status` enum('held','released','refunded') NOT NULL DEFAULT 'held',
  `held_at` datetime NOT NULL DEFAULT current_timestamp(),
  `released_at` datetime DEFAULT NULL,
  `refunded_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_escrow`
--

INSERT INTO `payment_escrow` (`id`, `transaction_id`, `escrow_amount`, `platform_fee`, `seller_amount`, `status`, `held_at`, `released_at`, `refunded_at`) VALUES
(1, 1, 12000.00, 600.00, 11400.00, 'held', '2025-10-19 04:51:48', NULL, NULL),
(2, 2, 2300.00, 115.00, 2185.00, 'held', '2025-10-19 04:51:48', NULL, NULL),
(3, 3, 3000.00, 150.00, 2850.00, 'held', '2025-10-19 04:51:48', NULL, NULL),
(4, 4, 3000.00, 150.00, 2850.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(5, 5, 200000.00, 10000.00, 190000.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(6, 6, 400000.00, 20000.00, 380000.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(7, 7, 300000.00, 15000.00, 285000.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(8, 8, 2200.00, 110.00, 2090.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(9, 9, 2000.00, 100.00, 1900.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(10, 10, 30000.00, 1500.00, 28500.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(11, 11, 500000.00, 25000.00, 475000.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(12, 12, 35000.00, 1750.00, 33250.00, 'released', '2025-10-19 05:13:45', '2025-10-19 05:20:38', NULL),
(13, 13, 45000.00, 2250.00, 42750.00, 'released', '2025-10-19 05:13:45', '2025-10-19 05:28:39', NULL),
(14, 14, 2500.00, 125.00, 2375.00, 'released', '2025-10-19 05:13:45', '2025-10-19 05:28:34', NULL),
(15, 15, 5050.01, 252.50, 4797.51, 'released', '2025-10-19 05:13:45', '2025-10-19 05:28:37', NULL),
(16, 16, 2600.00, 130.00, 2470.00, 'released', '2025-10-19 05:13:45', '2025-10-19 05:28:31', NULL),
(17, 17, 250000.00, 12500.00, 237500.00, 'held', '2025-10-19 05:13:45', NULL, NULL),
(18, 18, 25000.00, 1250.00, 23750.00, 'released', '2025-10-19 05:13:45', '2025-10-19 05:21:59', NULL),
(19, 19, 1500.00, 75.00, 1425.00, 'released', '2025-10-19 05:13:45', '2025-10-19 05:28:41', NULL),
(20, 20, 25000.00, 1250.00, 23750.00, 'released', '2025-10-19 05:26:48', '2025-10-19 05:27:53', NULL),
(21, 22, 1500.00, 75.00, 1425.00, 'released', '2025-10-19 06:02:25', '2025-10-19 06:11:03', NULL),
(22, 23, 30000.00, 1500.00, 28500.00, 'released', '2025-10-19 06:06:20', '2025-10-19 06:06:36', NULL),
(23, 24, 30000.00, 1500.00, 28500.00, 'released', '2025-10-19 06:19:06', '2025-10-19 06:20:05', NULL),
(24, 25, 35000.00, 1750.00, 33250.00, 'released', '2025-10-19 06:27:06', '2025-10-19 06:27:17', NULL),
(25, 26, 55000.00, 2750.00, 52250.00, 'released', '2025-10-19 07:05:23', '2025-10-19 07:05:40', NULL),
(26, 27, 25000.00, 1250.00, 23750.00, 'held', '2025-10-19 07:37:01', NULL, NULL),
(27, 28, 650000.00, 32500.00, 617500.00, 'released', '2025-10-25 19:09:34', '2025-10-25 19:10:01', NULL),
(28, 29, 255000.00, 12750.00, 242250.00, 'released', '2025-10-25 19:22:29', '2025-10-25 19:22:55', NULL),
(29, 30, 260000.00, 13000.00, 247000.00, 'released', '2025-10-25 20:38:00', '2025-10-25 20:39:57', NULL),
(30, 31, 260000.00, 13000.00, 247000.00, 'released', '2025-10-25 20:47:23', NULL, NULL),
(31, 32, 300000.00, 15000.00, 285000.00, 'released', '2025-10-30 14:51:19', NULL, NULL),
(32, 33, 270000.00, 13500.00, 256500.00, 'released', '2025-11-04 16:02:04', NULL, NULL),
(33, 34, 300000.00, 15000.00, 285000.00, 'held', '2025-11-04 16:13:55', NULL, NULL),
(34, 35, 300000.00, 15000.00, 285000.00, 'released', '2025-11-04 16:14:46', NULL, NULL),
(35, 36, 230000.00, 11500.00, 218500.00, 'released', '2025-11-04 16:28:55', NULL, NULL),
(36, 37, 300000.00, 15000.00, 285000.00, 'released', '2025-11-04 16:37:03', NULL, NULL),
(37, 38, 300000.00, 15000.00, 285000.00, 'released', '2025-11-04 16:47:54', NULL, NULL),
(38, 39, 300000.00, 15000.00, 285000.00, 'released', '2025-11-04 17:00:17', NULL, NULL),
(39, 40, 1200000.00, 60000.00, 1140000.00, 'released', '2025-11-04 18:08:23', NULL, NULL),
(40, 41, 300000.00, 15000.00, 285000.00, 'released', '2025-11-05 16:56:15', NULL, NULL),
(41, 42, 1200000.00, 60000.00, 1140000.00, 'held', '2025-11-05 17:00:39', NULL, NULL),
(42, 43, 420000.00, 21000.00, 399000.00, 'held', '2025-11-05 17:09:18', NULL, NULL),
(43, 44, 800000.00, 40000.00, 760000.00, 'held', '2025-11-05 17:15:05', NULL, NULL),
(44, 45, 820000.00, 41000.00, 779000.00, 'held', '2025-11-05 17:22:24', NULL, NULL),
(45, 46, 850000.00, 42500.00, 807500.00, 'held', '2025-11-05 17:29:39', NULL, NULL),
(46, 47, 5000.00, 250.00, 4750.00, 'held', '2025-11-05 17:37:22', NULL, NULL),
(47, 48, 400000.00, 20000.00, 380000.00, 'held', '2025-11-05 17:54:32', NULL, NULL),
(48, 49, 400000.00, 20000.00, 380000.00, 'held', '2025-11-05 17:59:05', NULL, NULL),
(49, 50, 50000.00, 2500.00, 47500.00, 'held', '2025-11-05 18:04:53', NULL, NULL),
(50, 51, 400000.00, 20000.00, 380000.00, 'held', '2025-11-05 18:08:49', NULL, NULL),
(51, 52, 500000.00, 25000.00, 475000.00, 'held', '2025-11-05 18:11:43', NULL, NULL),
(52, 53, 800000.00, 40000.00, 760000.00, 'held', '2025-11-05 18:14:44', NULL, NULL),
(53, 54, 50000.00, 2500.00, 47500.00, 'held', '2025-11-05 18:18:14', NULL, NULL),
(54, 55, 90000.00, 4500.00, 85500.00, 'held', '2025-11-05 18:23:15', NULL, NULL),
(55, 56, 80000.00, 4000.00, 76000.00, 'held', '2025-11-05 18:28:14', NULL, NULL),
(56, 57, 400000.00, 20000.00, 380000.00, 'held', '2025-11-05 19:09:26', NULL, NULL),
(57, 58, 21000.00, 1050.00, 19950.00, 'held', '2025-11-05 19:11:13', NULL, NULL),
(58, 59, 90000.00, 4500.00, 85500.00, 'held', '2025-11-07 21:08:07', NULL, NULL),
(59, 60, 4000.00, 200.00, 3800.00, 'held', '2025-11-07 21:10:23', NULL, NULL),
(60, 61, 3500.00, 175.00, 3325.00, 'held', '2025-11-07 21:19:04', NULL, NULL),
(61, 62, 60000.00, 3000.00, 57000.00, 'held', '2025-11-07 23:39:28', NULL, NULL),
(62, 63, 36000.00, 1800.00, 34200.00, 'released', '2025-11-08 03:09:00', NULL, NULL),
(63, 64, 500000.00, 25000.00, 475000.00, 'released', '2025-11-08 03:39:15', NULL, NULL),
(64, 65, 34000.00, 1700.00, 32300.00, 'released', '2025-11-08 04:21:28', NULL, NULL),
(65, 66, 3000.00, 150.00, 2850.00, 'held', '2025-11-08 04:26:01', NULL, NULL),
(66, 67, 400000.00, 20000.00, 380000.00, 'released', '2025-11-08 05:07:21', NULL, NULL),
(67, 68, 4359.97, 218.00, 4141.97, 'released', '2026-03-11 14:50:02', NULL, NULL),
(68, 69, 4300.00, 215.00, 4085.00, 'released', '2026-03-18 14:15:09', NULL, NULL),
(69, 70, 5100.00, 255.00, 4845.00, 'released', '2026-03-18 14:33:25', NULL, NULL),
(70, 71, 4550.00, 227.50, 4322.50, 'released', '2026-03-18 14:46:09', NULL, NULL),
(71, 72, 6000.00, 300.00, 5700.00, 'released', '2026-03-18 14:53:10', NULL, NULL),
(72, 73, 6500.00, 325.00, 6175.00, 'held', '2026-04-06 21:29:14', NULL, NULL),
(73, 74, 30000.00, 1500.00, 28500.00, 'held', '2026-04-08 15:29:23', NULL, NULL),
(74, 75, 3200.00, 160.00, 3040.00, 'held', '2026-04-08 15:35:23', NULL, NULL),
(75, 76, 45000.00, 2250.00, 42750.00, 'released', '2026-04-08 16:18:20', NULL, NULL),
(76, 77, 5400.00, 270.00, 5130.00, 'held', '2026-04-08 17:37:21', NULL, NULL),
(77, 78, 3500.00, 175.00, 3325.00, 'held', '2026-04-08 18:31:08', NULL, NULL),
(78, 79, 4000.00, 200.00, 3800.00, 'held', '2026-04-08 18:36:00', NULL, NULL),
(79, 80, 9500.00, 475.00, 9025.00, 'held', '2026-04-09 15:41:13', NULL, NULL),
(80, 81, 6000.00, 300.00, 5700.00, 'held', '2026-04-09 15:55:13', NULL, NULL),
(81, 82, 5500.00, 275.00, 5225.00, 'held', '2026-04-09 15:58:13', NULL, NULL),
(82, 83, 6500.00, 325.00, 6175.00, 'held', '2026-04-09 16:10:00', NULL, NULL),
(83, 84, 6600.00, 330.00, 6270.00, 'released', '2026-04-09 16:16:00', NULL, NULL),
(84, 85, 7000.00, 350.00, 6650.00, 'released', '2026-04-09 16:22:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payment_notifications`
--

CREATE TABLE `payment_notifications` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('payment_pending','payment_received','item_shipped','item_delivered','payment_released','payment_refunded') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_notifications`
--

INSERT INTO `payment_notifications` (`id`, `transaction_id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 1, 2, 'payment_received', 'Payment Received', 'Payment of $12000.00 has been received for auction \"11111\". You can now ship the item.', 0, '2025-10-19 04:55:56'),
(2, 1, 3, 'payment_received', 'Payment Received', 'Payment of $12000.00 has been processed for auction \"11111\". Waiting for seller to ship the item.', 0, '2025-10-19 04:55:56'),
(3, 4, 6, 'payment_pending', 'Payment Pending', 'Payment of $3000.00 is pending for auction \"The Card\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(4, 4, 3, 'payment_pending', 'Payment Pending', 'Payment of $3000.00 is pending for auction \"The Card\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(5, 5, 7, 'payment_pending', 'Payment Pending', 'Payment of $200000.00 is pending for auction \"qweq\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(6, 5, 2, 'payment_pending', 'Payment Pending', 'Payment of $200000.00 is pending for auction \"qweq\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(7, 6, 2, 'payment_pending', 'Payment Pending', 'Payment of $400000.00 is pending for auction \"The Best\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(8, 6, 2, 'payment_pending', 'Payment Pending', 'Payment of $400000.00 is pending for auction \"The Best\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(9, 7, 2, 'payment_pending', 'Payment Pending', 'Payment of $300000.00 is pending for auction \"EWWW\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(10, 7, 2, 'payment_pending', 'Payment Pending', 'Payment of $300000.00 is pending for auction \"EWWW\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(11, 8, 4, 'payment_pending', 'Payment Pending', 'Payment of $2200.00 is pending for auction \"MYMY\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(12, 8, 2, 'payment_pending', 'Payment Pending', 'Payment of $2200.00 is pending for auction \"MYMY\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(13, 9, 2, 'payment_pending', 'Payment Pending', 'Payment of $2000.00 is pending for auction \"UMAN\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(14, 9, 4, 'payment_pending', 'Payment Pending', 'Payment of $2000.00 is pending for auction \"UMAN\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(15, 10, 8, 'payment_pending', 'Payment Pending', 'Payment of $30000.00 is pending for auction \"QQQ\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(16, 10, 4, 'payment_pending', 'Payment Pending', 'Payment of $30000.00 is pending for auction \"QQQ\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(17, 11, 2, 'payment_pending', 'Payment Pending', 'Payment of $500000.00 is pending for auction \"Test\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(18, 11, 8, 'payment_pending', 'Payment Pending', 'Payment of $500000.00 is pending for auction \"Test\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(19, 12, 14, 'payment_pending', 'Payment Pending', 'Payment of $35000.00 is pending for auction \"ถ้วยน้ำชาโบราณ\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(20, 12, 12, 'payment_pending', 'Payment Pending', 'Payment of $35000.00 is pending for auction \"ถ้วยน้ำชาโบราณ\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(21, 13, 14, 'payment_pending', 'Payment Pending', 'Payment of $45000.00 is pending for auction \"กาน้ำร้อนโบราณ\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(22, 13, 12, 'payment_pending', 'Payment Pending', 'Payment of $45000.00 is pending for auction \"กาน้ำร้อนโบราณ\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(23, 14, 14, 'payment_pending', 'Payment Pending', 'Payment of $2500.00 is pending for auction \"ถ้วยน้ำร้อน\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(24, 14, 12, 'payment_pending', 'Payment Pending', 'Payment of $2500.00 is pending for auction \"ถ้วยน้ำร้อน\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(25, 15, 14, 'payment_pending', 'Payment Pending', 'Payment of $5050.01 is pending for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(26, 15, 12, 'payment_pending', 'Payment Pending', 'Payment of $5050.01 is pending for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(27, 16, 14, 'payment_pending', 'Payment Pending', 'Payment of $2600.00 is pending for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(28, 16, 12, 'payment_pending', 'Payment Pending', 'Payment of $2600.00 is pending for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(29, 17, 14, 'payment_pending', 'Payment Pending', 'Payment of $250000.00 is pending for auction \"151515\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(30, 17, 12, 'payment_pending', 'Payment Pending', 'Payment of $250000.00 is pending for auction \"151515\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(31, 18, 14, 'payment_pending', 'Payment Pending', 'Payment of $25000.00 is pending for auction \"131313\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(32, 18, 12, 'payment_pending', 'Payment Pending', 'Payment of $25000.00 is pending for auction \"131313\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(33, 19, 14, 'payment_pending', 'Payment Pending', 'Payment of $1500.00 is pending for auction \"1411414\". Please complete the payment to proceed.', 0, '2025-10-19 05:13:45'),
(34, 19, 12, 'payment_pending', 'Payment Pending', 'Payment of $1500.00 is pending for auction \"1411414\". Waiting for winner to complete payment.', 0, '2025-10-19 05:13:45'),
(35, 17, 12, 'payment_received', 'Payment Received', 'Payment of $250000.00 has been received for auction \"151515\". You can now ship the item.', 0, '2025-10-19 05:15:32'),
(36, 17, 14, 'payment_received', 'Payment Received', 'Payment of $250000.00 has been processed for auction \"151515\". Waiting for seller to ship the item.', 0, '2025-10-19 05:15:32'),
(37, 12, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"ถ้วยน้ำชาโบราณ\": $33250.00 (Platform fee: $1750.00)', 0, '2025-10-19 05:20:38'),
(38, 18, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"131313\": $23750.00 (Platform fee: $1250.00)', 0, '2025-10-19 05:21:59'),
(39, 18, 14, 'payment_received', 'Payment Processed', 'Payment of $25000.00 has been processed for auction \"131313\". Waiting for seller to ship the item.', 0, '2025-10-19 05:21:59'),
(40, 20, 14, 'payment_pending', 'Payment Pending', 'Payment of $25000.00 is pending for auction \"ถ้วยกาแฟไร\". Please complete the payment to proceed.', 0, '2025-10-19 05:26:48'),
(41, 20, 12, 'payment_pending', 'Payment Pending', 'Payment of $25000.00 is pending for auction \"ถ้วยกาแฟไร\". Waiting for winner to complete payment.', 0, '2025-10-19 05:26:48'),
(42, 20, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"ถ้วยกาแฟไร\": $23750.00 (Platform fee: $1250.00)', 0, '2025-10-19 05:27:53'),
(43, 20, 14, 'payment_received', 'Payment Processed', 'Payment of $25000.00 has been processed for auction \"ถ้วยกาแฟไร\". Waiting for seller to ship the item.', 0, '2025-10-19 05:27:53'),
(44, 16, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\": $2470.00 (Platform fee: $130.00)', 0, '2025-10-19 05:28:31'),
(45, 16, 14, 'payment_received', 'Payment Processed', 'Payment of $2600.00 has been processed for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อน\". Waiting for seller to ship the item.', 0, '2025-10-19 05:28:31'),
(46, 14, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"ถ้วยน้ำร้อน\": $2375.00 (Platform fee: $125.00)', 0, '2025-10-19 05:28:34'),
(47, 14, 14, 'payment_received', 'Payment Processed', 'Payment of $2500.00 has been processed for auction \"ถ้วยน้ำร้อน\". Waiting for seller to ship the item.', 0, '2025-10-19 05:28:34'),
(48, 15, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน\": $4797.51 (Platform fee: $252.50)', 0, '2025-10-19 05:28:37'),
(49, 15, 14, 'payment_received', 'Payment Processed', 'Payment of $5050.01 has been processed for auction \"ถ้วยน้ำร้อนถ้วยน้ำร้อนถ้วยน้ำร้อน\". Waiting for seller to ship the item.', 0, '2025-10-19 05:28:37'),
(50, 13, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"กาน้ำร้อนโบราณ\": $42750.00 (Platform fee: $2250.00)', 0, '2025-10-19 05:28:39'),
(51, 13, 14, 'payment_received', 'Payment Processed', 'Payment of $45000.00 has been processed for auction \"กาน้ำร้อนโบราณ\". Waiting for seller to ship the item.', 0, '2025-10-19 05:28:39'),
(52, 19, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"1411414\": $1425.00 (Platform fee: $75.00)', 0, '2025-10-19 05:28:41'),
(53, 19, 14, 'payment_received', 'Payment Processed', 'Payment of $1500.00 has been processed for auction \"1411414\". Waiting for seller to ship the item.', 0, '2025-10-19 05:28:41'),
(54, 20, 14, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ถ้วยกาแฟไร\" has been shipped! Tracking: TRK123456. Please confirm delivery when you receive it.', 0, '2025-10-19 05:50:36'),
(55, 20, 12, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ถ้วยกาแฟไร\". Tracking: TRK123456. Waiting for buyer confirmation.', 0, '2025-10-19 05:50:36'),
(56, 20, 12, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ถ้วยกาแฟไร\". Payment of $23750.00 has been released to your account.', 0, '2025-10-19 05:51:32'),
(57, 20, 14, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ถ้วยกาแฟไร\". The seller has been notified and payment has been released.', 0, '2025-10-19 05:51:32'),
(58, 20, 12, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ถ้วยกาแฟไร\" has been completed successfully.', 0, '2025-10-19 05:51:35'),
(59, 20, 14, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ถ้วยกาแฟไร\" has been completed successfully.', 0, '2025-10-19 05:51:35'),
(60, 19, 14, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"1411414\" has been shipped! Tracking: TRK123456. Please confirm delivery when you receive it.', 0, '2025-10-19 05:52:51'),
(61, 19, 12, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"1411414\". Tracking: TRK123456. Waiting for buyer confirmation.', 0, '2025-10-19 05:52:51'),
(62, 22, 15, 'payment_pending', 'Payment Required', 'You won the auction \"Test Auction for Payment System\" for $1500.00. Please proceed to payment.', 0, '2025-10-19 06:02:25'),
(63, 22, 12, 'payment_pending', 'Payment Pending', 'Your auction \"Test Auction for Payment System\" was won for $1500.00. Waiting for payment from the winner.', 0, '2025-10-19 06:02:25'),
(64, 23, 16, 'payment_pending', 'Payment Required', 'You won the auction \"ไก่กา\" for $30000.00. Please proceed to payment.', 0, '2025-10-19 06:06:20'),
(65, 23, 17, 'payment_pending', 'Payment Pending', 'Your auction \"ไก่กา\" was won for $30000.00. Waiting for payment from the winner.', 0, '2025-10-19 06:06:20'),
(66, 23, 17, 'payment_received', 'Payment Received', 'Payment received for auction \"ไก่กา\": $28500.00 (Platform fee: $1500.00)', 0, '2025-10-19 06:06:36'),
(67, 23, 16, 'payment_received', 'Payment Processed', 'Payment of $30000.00 has been processed for auction \"ไก่กา\". Waiting for seller to ship the item.', 0, '2025-10-19 06:06:36'),
(68, 23, 16, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ไก่กา\" has been shipped! Tracking: 12121212. Please confirm delivery when you receive it.', 0, '2025-10-19 06:07:12'),
(69, 23, 17, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ไก่กา\". Tracking: 12121212. Waiting for buyer confirmation.', 0, '2025-10-19 06:07:12'),
(70, 22, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"Test Auction for Payment System\": $1425.00 (Platform fee: $75.00)', 0, '2025-10-19 06:11:03'),
(71, 22, 15, 'payment_received', 'Payment Processed', 'Payment of $1500.00 has been processed for auction \"Test Auction for Payment System\". Waiting for seller to ship the item.', 0, '2025-10-19 06:11:03'),
(72, 22, 15, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"Test Auction for Payment System\" has been shipped! Tracking: TH123456789. Please confirm delivery when you receive it.', 0, '2025-10-19 06:11:13'),
(73, 22, 12, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"Test Auction for Payment System\". Tracking: TH123456789. Waiting for buyer confirmation.', 0, '2025-10-19 06:11:13'),
(74, 24, 19, 'payment_pending', 'Payment Required', 'You won the auction \"ไก่กาอาราเร่\" for $30000.00. Please proceed to payment.', 0, '2025-10-19 06:19:06'),
(75, 24, 18, 'payment_pending', 'Payment Pending', 'Your auction \"ไก่กาอาราเร่\" was won for $30000.00. Waiting for payment from the winner.', 0, '2025-10-19 06:19:06'),
(76, 24, 18, 'payment_received', 'Payment Received', 'Payment received for auction \"ไก่กาอาราเร่\": $28500.00 (Platform fee: $1500.00)', 0, '2025-10-19 06:20:05'),
(77, 24, 19, 'payment_received', 'Payment Processed', 'Payment of $30000.00 has been processed for auction \"ไก่กาอาราเร่\". Waiting for seller to ship the item.', 0, '2025-10-19 06:20:05'),
(78, 24, 19, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ไก่กาอาราเร่\" has been shipped! Tracking: THAD293838123123. Please confirm delivery when you receive it.', 0, '2025-10-19 06:20:48'),
(79, 24, 18, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ไก่กาอาราเร่\". Tracking: THAD293838123123. Waiting for buyer confirmation.', 0, '2025-10-19 06:20:48'),
(80, 24, 18, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ไก่กาอาราเร่\". Payment of $28500.00 has been released to your account.', 0, '2025-10-19 06:21:17'),
(81, 24, 19, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ไก่กาอาราเร่\". The seller has been notified and payment has been released.', 0, '2025-10-19 06:21:17'),
(82, 24, 18, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ไก่กาอาราเร่\" has been completed successfully.', 0, '2025-10-19 06:21:20'),
(83, 24, 19, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ไก่กาอาราเร่\" has been completed successfully.', 0, '2025-10-19 06:21:20'),
(84, 25, 19, 'payment_pending', 'Payment Required', 'You won the auction \"กาอะไรเนี่ยสวยจัง\" for $35000.00. Please proceed to payment.', 0, '2025-10-19 06:27:06'),
(85, 25, 21, 'payment_pending', 'Payment Pending', 'Your auction \"กาอะไรเนี่ยสวยจัง\" was won for $35000.00. Waiting for payment from the winner.', 0, '2025-10-19 06:27:06'),
(86, 25, 21, 'payment_received', 'Payment Received', 'Payment received for auction \"กาอะไรเนี่ยสวยจัง\": $33250.00 (Platform fee: $1750.00)', 0, '2025-10-19 06:27:17'),
(87, 25, 19, 'payment_received', 'Payment Processed', 'Payment of $35000.00 has been processed for auction \"กาอะไรเนี่ยสวยจัง\". Waiting for seller to ship the item.', 0, '2025-10-19 06:27:17'),
(88, 26, 19, 'payment_pending', 'Payment Required', 'You won the auction \"ยังไงๆๆ\" for $55000.00. Please proceed to payment.', 0, '2025-10-19 07:05:23'),
(89, 26, 21, 'payment_pending', 'Payment Pending', 'Your auction \"ยังไงๆๆ\" was won for $55000.00. Waiting for payment from the winner.', 0, '2025-10-19 07:05:23'),
(90, 26, 21, 'payment_received', 'Payment Received', 'Payment received for auction \"ยังไงๆๆ\": $52250.00 (Platform fee: $2750.00)', 0, '2025-10-19 07:05:40'),
(91, 26, 19, 'payment_received', 'Payment Processed', 'Payment of $55000.00 has been processed for auction \"ยังไงๆๆ\". Waiting for seller to ship the item.', 0, '2025-10-19 07:05:40'),
(92, 26, 19, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ยังไงๆๆ\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2025-10-19 07:09:44'),
(93, 26, 21, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ยังไงๆๆ\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2025-10-19 07:09:44'),
(94, 25, 19, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กาอะไรเนี่ยสวยจัง\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2025-10-19 07:10:04'),
(95, 25, 21, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กาอะไรเนี่ยสวยจัง\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2025-10-19 07:10:04'),
(96, 26, 21, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ยังไงๆๆ\". Payment of $52250.00 has been released to your account.', 0, '2025-10-19 07:10:23'),
(97, 26, 19, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ยังไงๆๆ\". The seller has been notified and payment has been released.', 0, '2025-10-19 07:10:23'),
(98, 26, 21, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ยังไงๆๆ\" has been completed successfully.', 0, '2025-10-19 07:10:27'),
(99, 26, 19, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ยังไงๆๆ\" has been completed successfully.', 0, '2025-10-19 07:10:27'),
(100, 25, 21, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กาอะไรเนี่ยสวยจัง\". Payment of $33250.00 has been released to your account.', 0, '2025-10-19 07:11:43'),
(101, 25, 19, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กาอะไรเนี่ยสวยจัง\". The seller has been notified and payment has been released.', 0, '2025-10-19 07:11:43'),
(102, 25, 21, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาอะไรเนี่ยสวยจัง\" has been completed successfully.', 0, '2025-10-19 07:11:45'),
(103, 25, 19, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาอะไรเนี่ยสวยจัง\" has been completed successfully.', 0, '2025-10-19 07:11:45'),
(104, 27, 19, 'payment_pending', 'Payment Required', 'You won the auction \"asdasdasd\" for $25000.00. Please proceed to payment.', 0, '2025-10-19 07:37:01'),
(105, 27, 21, 'payment_pending', 'Payment Pending', 'Your auction \"asdasdasd\" was won for $25000.00. Waiting for payment from the winner.', 0, '2025-10-19 07:37:01'),
(106, 22, 12, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"Test Auction for Payment System\". Payment of $1425.00 has been released to your account.', 0, '2025-10-25 08:53:03'),
(107, 22, 15, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"Test Auction for Payment System\". The seller has been notified and payment has been released.', 0, '2025-10-25 08:53:03'),
(108, 22, 12, 'payment_released', 'Transaction Completed', 'Transaction for auction \"Test Auction for Payment System\" has been completed successfully.', 0, '2025-10-25 08:53:06'),
(109, 22, 15, 'payment_released', 'Transaction Completed', 'Transaction for auction \"Test Auction for Payment System\" has been completed successfully.', 0, '2025-10-25 08:53:06'),
(110, 21, 12, 'payment_received', 'Payment Received', 'Payment received for auction \"กาไรปะ\": $null (Platform fee: $null)', 0, '2025-10-25 08:53:09'),
(111, 21, 15, 'payment_received', 'Payment Processed', 'Payment of $30000.00 has been processed for auction \"กาไรปะ\". Waiting for seller to ship the item.', 0, '2025-10-25 08:53:09'),
(112, 21, 15, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กาไรปะ\" has been shipped! Tracking: TH789345. Please confirm delivery when you receive it.', 0, '2025-10-25 08:53:47'),
(113, 21, 12, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กาไรปะ\". Tracking: TH789345. Waiting for buyer confirmation.', 0, '2025-10-25 08:53:47'),
(114, 21, 12, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาไรปะ\" has been completed successfully.', 0, '2025-10-25 08:57:09'),
(115, 21, 15, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาไรปะ\" has been completed successfully.', 0, '2025-10-25 08:57:09'),
(116, 19, 12, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"1411414\". Payment of $1425.00 has been released to your account.', 0, '2025-10-25 09:12:30'),
(117, 19, 14, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"1411414\". The seller has been notified and payment has been released.', 0, '2025-10-25 09:12:30'),
(118, 19, 12, 'payment_released', 'Transaction Completed', 'Transaction for auction \"1411414\" has been completed successfully.', 0, '2025-10-25 09:12:35'),
(119, 19, 14, 'payment_released', 'Transaction Completed', 'Transaction for auction \"1411414\" has been completed successfully.', 0, '2025-10-25 09:12:35'),
(120, 28, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"นาฬิกา PATEK PHILIPPE\": $617500.00 (Platform fee: $32500.00)', 0, '2025-10-25 19:10:01'),
(121, 28, 23, 'payment_received', 'Payment Processed', 'Payment of $650000.00 has been processed for auction \"นาฬิกา PATEK PHILIPPE\". Waiting for seller to ship the item.', 0, '2025-10-25 19:10:01'),
(122, 28, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"นาฬิกา PATEK PHILIPPE\" has been shipped! Tracking: THSX123455679. Please confirm delivery when you receive it.', 0, '2025-10-25 19:14:24'),
(123, 28, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"นาฬิกา PATEK PHILIPPE\". Tracking: THSX123455679. Waiting for buyer confirmation.', 0, '2025-10-25 19:14:24'),
(124, 28, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"นาฬิกา PATEK PHILIPPE\". Payment of $617500.00 has been released to your account.', 0, '2025-10-25 19:15:04'),
(125, 28, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"นาฬิกา PATEK PHILIPPE\". The seller has been notified and payment has been released.', 0, '2025-10-25 19:15:04'),
(126, 28, 22, 'payment_released', 'Transaction Completed', 'Transaction for auction \"นาฬิกา PATEK PHILIPPE\" has been completed successfully.', 0, '2025-10-25 19:16:39'),
(127, 28, 23, 'payment_released', 'Transaction Completed', 'Transaction for auction \"นาฬิกา PATEK PHILIPPE\" has been completed successfully.', 0, '2025-10-25 19:16:39'),
(128, 29, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"ล้อแม็ก YOKOHAMA iceGUARD7\": $242250.00 (Platform fee: $12750.00)', 0, '2025-10-25 19:22:55'),
(129, 29, 23, 'payment_received', 'Payment Processed', 'Payment of $255000.00 has been processed for auction \"ล้อแม็ก YOKOHAMA iceGUARD7\". Waiting for seller to ship the item.', 0, '2025-10-25 19:22:55'),
(130, 29, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ล้อแม็ก YOKOHAMA iceGUARD7\" has been shipped! Tracking: TRK87172824. Please confirm delivery when you receive it.', 0, '2025-10-25 19:29:54'),
(131, 29, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ล้อแม็ก YOKOHAMA iceGUARD7\". Tracking: TRK87172824. Waiting for buyer confirmation.', 0, '2025-10-25 19:29:54'),
(132, 29, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ล้อแม็ก YOKOHAMA iceGUARD7\". Payment of $242250.00 has been released to your account.', 0, '2025-10-25 19:30:21'),
(133, 29, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ล้อแม็ก YOKOHAMA iceGUARD7\". The seller has been notified and payment has been released.', 0, '2025-10-25 19:30:21'),
(134, 29, 22, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ล้อแม็ก YOKOHAMA iceGUARD7\" has been completed successfully.', 0, '2025-10-25 19:30:23'),
(135, 29, 23, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ล้อแม็ก YOKOHAMA iceGUARD7\" has been completed successfully.', 0, '2025-10-25 19:30:23'),
(136, 30, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"กีต้าร์ YAMAHA FG-301\": $247000.00 (Platform fee: $13000.00)', 0, '2025-10-25 20:39:57'),
(137, 30, 23, 'payment_received', 'Payment Processed', 'Payment of $260000.00 has been processed for auction \"กีต้าร์ YAMAHA FG-301\". Waiting for seller to ship the item.', 0, '2025-10-25 20:39:57'),
(138, 30, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กีต้าร์ YAMAHA FG-301\" has been shipped! Tracking: TRK29281723123. Please confirm delivery when you receive it.', 0, '2025-10-25 20:40:33'),
(139, 30, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กีต้าร์ YAMAHA FG-301\". Tracking: TRK29281723123. Waiting for buyer confirmation.', 0, '2025-10-25 20:40:33'),
(140, 30, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กีต้าร์ YAMAHA FG-301\". Payment of $247000.00 has been released to your account.', 0, '2025-10-25 20:41:06'),
(141, 30, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กีต้าร์ YAMAHA FG-301\". The seller has been notified and payment has been released.', 0, '2025-10-25 20:41:06'),
(142, 30, 22, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กีต้าร์ YAMAHA FG-301\" has been completed successfully.', 0, '2025-10-25 20:41:10'),
(143, 30, 23, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กีต้าร์ YAMAHA FG-301\" has been completed successfully.', 0, '2025-10-25 20:41:10'),
(144, 31, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"กาน้ำร้อนโปราณหายาก\": $247000.00 (Platform fee: $13000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-10-25 20:47:40'),
(145, 31, 23, 'payment_received', 'Payment Processed', 'Payment of $260000.00 has been processed for auction \"กาน้ำร้อนโปราณหายาก\". Waiting for seller to ship the item.', 0, '2025-10-25 20:47:40'),
(146, 31, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กาน้ำร้อนโปราณหายาก\" has been shipped! Tracking: TRK298123123. Please confirm delivery when you receive it.', 0, '2025-10-25 20:48:18'),
(147, 31, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กาน้ำร้อนโปราณหายาก\". Tracking: TRK298123123. Waiting for buyer confirmation.', 0, '2025-10-25 20:48:18'),
(148, 31, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กาน้ำร้อนโปราณหายาก\". Payment of $247000.00 has been released to your account.', 0, '2025-10-25 20:48:34'),
(149, 31, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กาน้ำร้อนโปราณหายาก\". The seller has been notified and payment has been released.', 0, '2025-10-25 20:48:34'),
(150, 31, 22, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาน้ำร้อนโปราณหายาก\" has been completed successfully.', 0, '2025-10-25 20:48:38'),
(151, 31, 23, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาน้ำร้อนโปราณหายาก\" has been completed successfully.', 0, '2025-10-25 20:48:38'),
(152, 32, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"แมวน้ำมูกไหล\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-10-30 14:55:22'),
(153, 32, 23, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"แมวน้ำมูกไหล\". Waiting for seller to ship the item.', 0, '2025-10-30 14:55:22'),
(154, 32, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"แมวน้ำมูกไหล\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2025-10-30 14:55:58'),
(155, 32, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"แมวน้ำมูกไหล\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2025-10-30 14:55:58'),
(156, 32, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"แมวน้ำมูกไหล\". Payment of $285000.00 has been released to your account.', 0, '2025-11-04 15:57:02'),
(157, 32, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"แมวน้ำมูกไหล\". The seller has been notified and payment has been released.', 0, '2025-11-04 15:57:02'),
(158, 33, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\": $256500.00 (Platform fee: $13500.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 16:02:48'),
(159, 33, 23, 'payment_received', 'Payment Processed', 'Payment of $270000.00 has been processed for auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\". Waiting for seller to ship the item.', 0, '2025-11-04 16:02:48'),
(160, 33, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\" has been shipped! Tracking: TRK8727827. Please confirm delivery when you receive it.', 0, '2025-11-04 16:03:29'),
(161, 33, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\". Tracking: TRK8727827. Waiting for buyer confirmation.', 0, '2025-11-04 16:03:29'),
(162, 33, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\". Payment of $256500.00 has been released to your account.', 0, '2025-11-04 16:03:43'),
(163, 33, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"限定 日産 GT-R 2台セット NISMO R34 ＆ R35 トミカプレミアム 新品未開封 トミカ\". The seller has been notified and payment has been released.', 0, '2025-11-04 16:03:43'),
(164, 35, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 16:24:02'),
(165, 35, 27, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". Waiting for seller to ship the item.', 0, '2025-11-04 16:24:02'),
(166, 35, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\" has been shipped! Tracking: TYFG123123. Please confirm delivery when you receive it.', 0, '2025-11-04 16:24:29'),
(167, 35, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". Tracking: TYFG123123. Waiting for buyer confirmation.', 0, '2025-11-04 16:24:29'),
(168, 35, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". Payment of $285000.00 has been released to your account.', 0, '2025-11-04 16:24:41'),
(169, 35, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". The seller has been notified and payment has been released.', 0, '2025-11-04 16:24:41'),
(170, 36, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\": $218500.00 (Platform fee: $11500.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 16:32:57'),
(171, 36, 27, 'payment_received', 'Payment Processed', 'Payment of $230000.00 has been processed for auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\". Waiting for seller to ship the item.', 0, '2025-11-04 16:32:57'),
(172, 36, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\" has been shipped! Tracking: THR23123. Please confirm delivery when you receive it.', 0, '2025-11-04 16:33:52'),
(173, 36, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\". Tracking: THR23123. Waiting for buyer confirmation.', 0, '2025-11-04 16:33:52'),
(174, 36, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\". Payment of $218500.00 has been released to your account.', 0, '2025-11-04 16:34:06'),
(175, 36, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"K18 ゴールド 1.90g 石種不明 0.02ct刻印 リング 指輪\". The seller has been notified and payment has been released.', 0, '2025-11-04 16:34:06'),
(176, 34, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 16:34:08'),
(177, 34, 27, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"YAMAHA ヤマハ FG-401B パッシブピックアップ付き アコギ エレアコギター 日本製 Serial No.81107 ナチュラル系 ★簡易検査品\". Waiting for seller to ship the item.', 0, '2025-11-04 16:34:08'),
(178, 37, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"กาน้ำ\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 16:37:51'),
(179, 37, 23, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"กาน้ำ\". Waiting for seller to ship the item.', 0, '2025-11-04 16:37:51'),
(180, 37, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กาน้ำ\" has been shipped! Tracking: TH232323. Please confirm delivery when you receive it.', 0, '2025-11-04 16:38:13'),
(181, 37, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กาน้ำ\". Tracking: TH232323. Waiting for buyer confirmation.', 0, '2025-11-04 16:38:13'),
(182, 37, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กาน้ำ\". Payment of $285000.00 has been released to your account.', 0, '2025-11-04 16:42:45'),
(183, 37, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กาน้ำ\". The seller has been notified and payment has been released.', 0, '2025-11-04 16:42:45'),
(184, 38, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"รถประกอบ\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 16:55:04'),
(185, 38, 27, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"รถประกอบ\". Waiting for seller to ship the item.', 0, '2025-11-04 16:55:04'),
(186, 38, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"รถประกอบ\" has been shipped! Tracking: TRK123123123. Please confirm delivery when you receive it.', 0, '2025-11-04 16:55:43'),
(187, 38, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"รถประกอบ\". Tracking: TRK123123123. Waiting for buyer confirmation.', 0, '2025-11-04 16:55:43'),
(188, 38, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"รถประกอบ\". Payment of $285000.00 has been released to your account.', 0, '2025-11-04 16:56:11'),
(189, 38, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"รถประกอบ\". The seller has been notified and payment has been released.', 0, '2025-11-04 16:56:11'),
(190, 39, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"น้ำกา\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 17:02:30'),
(191, 39, 27, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"น้ำกา\". Waiting for seller to ship the item.', 0, '2025-11-04 17:02:30'),
(192, 39, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"น้ำกา\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2025-11-04 17:03:00'),
(193, 39, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"น้ำกา\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2025-11-04 17:03:00'),
(194, 39, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"น้ำกา\". Payment of $285000.00 has been released to your account.', 0, '2025-11-04 17:03:19'),
(195, 39, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"น้ำกา\". The seller has been notified and payment has been released.', 0, '2025-11-04 17:03:19'),
(196, 40, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\": $1140000.00 (Platform fee: $60000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-04 18:11:44'),
(197, 40, 27, 'payment_received', 'Payment Processed', 'Payment of $1200000.00 has been processed for auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\". Waiting for seller to ship the item.', 0, '2025-11-04 18:11:44'),
(198, 40, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\" has been shipped! Tracking: TRK123901i23. Please confirm delivery when you receive it.', 0, '2025-11-04 18:12:52'),
(199, 40, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\". Tracking: TRK123901i23. Waiting for buyer confirmation.', 0, '2025-11-04 18:12:52'),
(200, 40, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\". Payment of $1140000.00 has been released to your account.', 0, '2025-11-04 18:18:35'),
(201, 40, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"GIGABYTE Z790 AORUS MASTER X おまけ　intel CPU 14900K　EK Quantum Velocity2 水枕付き\". The seller has been notified and payment has been released.', 0, '2025-11-04 18:18:35'),
(202, 41, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"กล้อง V2\": $285000.00 (Platform fee: $15000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-05 16:57:39'),
(203, 41, 23, 'payment_received', 'Payment Processed', 'Payment of $300000.00 has been processed for auction \"กล้อง V2\". Waiting for seller to ship the item.', 0, '2025-11-05 16:57:39'),
(204, 41, 23, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กล้อง V2\" has been shipped! Tracking: TH12312312312. Please confirm delivery when you receive it.', 0, '2025-11-05 16:58:48'),
(205, 41, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กล้อง V2\". Tracking: TH12312312312. Waiting for buyer confirmation.', 0, '2025-11-05 16:58:48'),
(206, 41, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กล้อง V2\". Payment of $285000.00 has been released to your account.', 0, '2025-11-05 16:58:59'),
(207, 41, 23, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กล้อง V2\". The seller has been notified and payment has been released.', 0, '2025-11-05 16:58:59'),
(208, 61, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"123456789\": $3325.00 (Platform fee: $175.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-07 23:27:01'),
(209, 61, 27, 'payment_received', 'Payment Processed', 'Payment of $3500.00 has been processed for auction \"123456789\". Waiting for seller to ship the item.', 0, '2025-11-07 23:27:01'),
(210, 61, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"123456789\" has been shipped! Tracking: TH123123123123. Please confirm delivery when you receive it.', 0, '2025-11-07 23:27:37'),
(211, 61, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"123456789\". Tracking: TH123123123123. Waiting for buyer confirmation.', 0, '2025-11-07 23:27:37'),
(212, 63, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"สร้อย AEC\": $34200.00 (Platform fee: $1800.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-08 03:16:01'),
(213, 63, 30, 'payment_received', 'Payment Processed', 'Payment of $36000.00 has been processed for auction \"สร้อย AEC\". Waiting for seller to ship the item.', 0, '2025-11-08 03:16:01'),
(214, 63, 30, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"สร้อย AEC\" has been shipped! Tracking: TH2019123123. Please confirm delivery when you receive it.', 0, '2025-11-08 03:17:19'),
(215, 63, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"สร้อย AEC\". Tracking: TH2019123123. Waiting for buyer confirmation.', 0, '2025-11-08 03:17:19'),
(216, 63, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"สร้อย AEC\". Payment of $34200.00 has been released to your account.', 0, '2025-11-08 03:17:46'),
(217, 63, 30, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"สร้อย AEC\". The seller has been notified and payment has been released.', 0, '2025-11-08 03:17:46'),
(218, 64, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"แหวนเพชร 2.99 กะรัต\": ฿475000.00 (Platform fee: ฿25000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-08 03:41:23'),
(219, 64, 30, 'payment_received', 'Payment Processed', 'Payment of ฿500000.00 has been processed for auction \"แหวนเพชร 2.99 กะรัต\". Waiting for seller to ship the item.', 0, '2025-11-08 03:41:23'),
(220, 65, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"รองเท้า\": ฿32300.00 (Platform fee: ฿1700.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-08 04:22:08'),
(221, 65, 30, 'payment_received', 'Payment Processed', 'Payment of ฿34000.00 has been processed for auction \"รองเท้า\". Waiting for seller to ship the item.', 0, '2025-11-08 04:22:08'),
(222, 66, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"การ์ด TCG\": ฿2850.00 (Platform fee: ฿150.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-08 04:38:33'),
(223, 66, 30, 'payment_received', 'Payment Processed', 'Payment of ฿3000.00 has been processed for auction \"การ์ด TCG\". Waiting for seller to ship the item.', 0, '2025-11-08 04:38:33'),
(224, 65, 30, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"รองเท้า\" has been shipped! Tracking: TH12345612312. Please confirm delivery when you receive it.', 0, '2025-11-08 04:41:32'),
(225, 65, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"รองเท้า\". Tracking: TH12345612312. Waiting for buyer confirmation.', 0, '2025-11-08 04:41:32'),
(226, 65, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"รองเท้า\". Payment of $32300.00 has been released to your account.', 0, '2025-11-08 04:41:45'),
(227, 65, 30, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"รองเท้า\". The seller has been notified and payment has been released.', 0, '2025-11-08 04:41:45'),
(228, 64, 30, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"แหวนเพชร 2.99 กะรัต\" has been shipped! Tracking: N/A. Please confirm delivery when you receive it.', 0, '2025-11-08 04:45:47'),
(229, 64, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"แหวนเพชร 2.99 กะรัต\". Tracking: N/A. Waiting for buyer confirmation.', 0, '2025-11-08 04:45:47'),
(230, 64, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"แหวนเพชร 2.99 กะรัต\". Payment of $475000.00 has been released to your account.', 0, '2025-11-08 05:03:15'),
(231, 64, 30, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"แหวนเพชร 2.99 กะรัต\". The seller has been notified and payment has been released.', 0, '2025-11-08 05:03:15'),
(232, 67, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"นาฬิกา\": ฿380000.00 (Platform fee: ฿20000.00). Money is held in escrow until buyer confirms delivery.', 0, '2025-11-08 05:09:10'),
(233, 67, 30, 'payment_received', 'Payment Processed', 'Payment of ฿400000.00 has been processed for auction \"นาฬิกา\". Waiting for seller to ship the item.', 0, '2025-11-08 05:09:10'),
(234, 67, 30, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"นาฬิกา\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2025-11-08 05:09:43'),
(235, 67, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"นาฬิกา\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2025-11-08 05:09:43'),
(236, 67, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"นาฬิกา\". Payment of $380000.00 has been released to your account.', 0, '2025-11-08 05:10:09'),
(237, 67, 30, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"นาฬิกา\". The seller has been notified and payment has been released.', 0, '2025-11-08 05:10:09'),
(238, 68, 22, 'payment_received', 'Payment Received', 'Payment received for auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\": ฿4141.97 (Platform fee: ฿218.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-03-11 14:56:30'),
(239, 68, 31, 'payment_received', 'Payment Processed', 'Payment of ฿4359.97 has been processed for auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\". Waiting for seller to ship the item.', 0, '2026-03-11 14:56:30'),
(240, 68, 31, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\" has been shipped! Tracking: N/A. Please confirm delivery when you receive it.', 0, '2026-03-11 14:58:42'),
(241, 68, 22, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\". Tracking: N/A. Waiting for buyer confirmation.', 0, '2026-03-11 14:58:42'),
(242, 68, 22, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\". Payment of $4141.97 has been released to your account.', 0, '2026-03-11 14:58:58'),
(243, 68, 31, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"Morris モーリス SPECIAL アコースティックギター アコギ 弦楽器\". The seller has been notified and payment has been released.', 0, '2026-03-11 14:58:58'),
(244, 69, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"กาไหน้ำ\": ฿4085.00 (Platform fee: ฿215.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-03-18 14:15:55'),
(245, 69, 31, 'payment_received', 'Payment Processed', 'Payment of ฿4300.00 has been processed for auction \"กาไหน้ำ\". Waiting for seller to ship the item.', 0, '2026-03-18 14:15:55'),
(246, 69, 31, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กาไหน้ำ\" has been shipped! Tracking: N/A. Please confirm delivery when you receive it.', 0, '2026-03-18 14:16:11'),
(247, 69, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กาไหน้ำ\". Tracking: N/A. Waiting for buyer confirmation.', 0, '2026-03-18 14:16:11'),
(248, 69, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กาไหน้ำ\". Payment of $4085.00 has been released to your account.', 0, '2026-03-18 14:16:36'),
(249, 69, 31, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กาไหน้ำ\". The seller has been notified and payment has been released.', 0, '2026-03-18 14:16:36'),
(250, 69, 29, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาไหน้ำ\" has been completed successfully.', 0, '2026-03-18 14:17:31'),
(251, 69, 31, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กาไหน้ำ\" has been completed successfully.', 0, '2026-03-18 14:17:31'),
(252, 70, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\": ฿4845.00 (Platform fee: ฿255.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-03-18 14:36:30');
INSERT INTO `payment_notifications` (`id`, `transaction_id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(253, 70, 31, 'payment_received', 'Payment Processed', 'Payment of ฿5100.00 has been processed for auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\". Waiting for seller to ship the item.', 0, '2026-03-18 14:36:30'),
(254, 70, 31, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\" has been shipped! Tracking: TH189921321. Please confirm delivery when you receive it.', 0, '2026-03-18 14:36:54'),
(255, 70, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\". Tracking: TH189921321. Waiting for buyer confirmation.', 0, '2026-03-18 14:36:54'),
(256, 70, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\". Payment of $4845.00 has been released to your account.', 0, '2026-03-18 14:37:13'),
(257, 70, 31, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\". The seller has been notified and payment has been released.', 0, '2026-03-18 14:37:13'),
(258, 70, 29, 'payment_released', 'Transaction Completed', 'Transaction for auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\" has been completed successfully.', 0, '2026-03-18 14:37:15'),
(259, 70, 31, 'payment_released', 'Transaction Completed', 'Transaction for auction \"§§【1円スタート】 DAIWA ダイワ 電動リール まとめ ジャンク 6点 801395 全体的に状態が悪い\" has been completed successfully.', 0, '2026-03-18 14:37:15'),
(260, 71, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"ของเล่นไทย\": ฿4322.50 (Platform fee: ฿227.50). Money is held in escrow until buyer confirms delivery.', 0, '2026-03-18 14:46:48'),
(261, 71, 31, 'payment_received', 'Payment Processed', 'Payment of ฿4550.00 has been processed for auction \"ของเล่นไทย\". Waiting for seller to ship the item.', 0, '2026-03-18 14:46:48'),
(262, 71, 31, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ของเล่นไทย\" has been shipped! Tracking: TH12345567890. Please confirm delivery when you receive it.', 0, '2026-03-18 14:47:15'),
(263, 71, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ของเล่นไทย\". Tracking: TH12345567890. Waiting for buyer confirmation.', 0, '2026-03-18 14:47:15'),
(264, 71, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ของเล่นไทย\". Payment of $4322.50 has been released to your account.', 0, '2026-03-18 14:47:22'),
(265, 71, 31, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ของเล่นไทย\". The seller has been notified and payment has been released.', 0, '2026-03-18 14:47:22'),
(266, 71, 29, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ของเล่นไทย\" has been completed successfully.', 0, '2026-03-18 14:47:22'),
(267, 71, 31, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ของเล่นไทย\" has been completed successfully.', 0, '2026-03-18 14:47:22'),
(268, 72, 29, 'payment_received', 'Payment Received', 'Payment received for auction \"ตากี้\": ฿5700.00 (Platform fee: ฿300.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-03-18 14:53:35'),
(269, 72, 31, 'payment_received', 'Payment Processed', 'Payment of ฿6000.00 has been processed for auction \"ตากี้\". Waiting for seller to ship the item.', 0, '2026-03-18 14:53:35'),
(270, 72, 31, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ตากี้\" has been shipped! Tracking: TH12345678. Please confirm delivery when you receive it.', 0, '2026-03-18 14:53:56'),
(271, 72, 29, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ตากี้\". Tracking: TH12345678. Waiting for buyer confirmation.', 0, '2026-03-18 14:53:56'),
(272, 72, 29, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ตากี้\". Payment of $5700.00 has been released to your account.', 0, '2026-03-18 14:54:09'),
(273, 72, 31, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ตากี้\". The seller has been notified and payment has been released.', 0, '2026-03-18 14:54:09'),
(274, 72, 29, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ตากี้\" has been completed successfully.', 0, '2026-03-18 14:54:09'),
(275, 72, 31, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ตากี้\" has been completed successfully.', 0, '2026-03-18 14:54:09'),
(276, 76, 35, 'payment_received', 'Payment Received', 'Payment received for auction \"กำไลทอง\": ฿42750.00 (Platform fee: ฿2250.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-04-08 16:21:46'),
(277, 76, 27, 'payment_received', 'Payment Processed', 'Payment of ฿45000.00 has been processed for auction \"กำไลทอง\". Waiting for seller to ship the item.', 0, '2026-04-08 16:21:46'),
(278, 76, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"กำไลทอง\" has been shipped! Tracking: TH3081293123. Please confirm delivery when you receive it.', 0, '2026-04-08 16:22:58'),
(279, 76, 35, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"กำไลทอง\". Tracking: TH3081293123. Waiting for buyer confirmation.', 0, '2026-04-08 16:22:58'),
(280, 76, 35, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"กำไลทอง\". Payment of $42750.00 has been released to your account.', 0, '2026-04-08 16:23:18'),
(281, 76, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"กำไลทอง\". The seller has been notified and payment has been released.', 0, '2026-04-08 16:23:18'),
(282, 76, 35, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กำไลทอง\" has been completed successfully.', 0, '2026-04-08 16:23:22'),
(283, 76, 27, 'payment_released', 'Transaction Completed', 'Transaction for auction \"กำไลทอง\" has been completed successfully.', 0, '2026-04-08 16:23:22'),
(284, 85, 35, 'payment_received', 'Payment Received', 'Payment received for auction \"จานโบราณทรงสวย\": ฿6650.00 (Platform fee: ฿350.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-04-09 22:29:45'),
(285, 85, 27, 'payment_received', 'Payment Processed', 'Payment of ฿7000.00 has been processed for auction \"จานโบราณทรงสวย\". Waiting for seller to ship the item.', 0, '2026-04-09 22:29:45'),
(286, 85, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"จานโบราณทรงสวย\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2026-04-09 22:31:35'),
(287, 85, 35, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"จานโบราณทรงสวย\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2026-04-09 22:31:35'),
(288, 84, 35, 'payment_received', 'Payment Received', 'Payment received for auction \"ประมูลไหโบราณ\": ฿6270.00 (Platform fee: ฿330.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-04-09 22:38:16'),
(289, 84, 27, 'payment_received', 'Payment Processed', 'Payment of ฿6600.00 has been processed for auction \"ประมูลไหโบราณ\". Waiting for seller to ship the item.', 0, '2026-04-09 22:38:16'),
(290, 84, 27, 'item_shipped', 'Item Shipped', '📦 Your item from auction \"ประมูลไหโบราณ\" has been shipped! Tracking: TH123123123. Please confirm delivery when you receive it.', 0, '2026-04-09 22:41:20'),
(291, 84, 35, 'item_shipped', 'Item Shipped', '📦 You have shipped the item for auction \"ประมูลไหโบราณ\". Tracking: TH123123123. Waiting for buyer confirmation.', 0, '2026-04-09 22:41:20'),
(292, 84, 35, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"ประมูลไหโบราณ\". Payment of $6270.00 has been released to your account.', 0, '2026-04-09 22:42:24'),
(293, 84, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"ประมูลไหโบราณ\". The seller has been notified and payment has been released.', 0, '2026-04-09 22:42:24'),
(294, 84, 35, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ประมูลไหโบราณ\" has been completed successfully.', 0, '2026-04-09 22:43:08'),
(295, 84, 27, 'payment_released', 'Transaction Completed', 'Transaction for auction \"ประมูลไหโบราณ\" has been completed successfully.', 0, '2026-04-09 22:43:08'),
(296, 85, 35, 'item_delivered', 'Item Delivered', '🎉 Great news! The buyer has confirmed receiving the item from auction \"จานโบราณทรงสวย\". Payment of $6650.00 has been released to your account.', 0, '2026-04-10 08:32:31'),
(297, 85, 27, 'item_delivered', 'Item Delivered', '✅ You have confirmed receipt of the item from auction \"จานโบราณทรงสวย\". The seller has been notified and payment has been released.', 0, '2026-04-10 08:32:31'),
(298, 85, 35, 'payment_released', 'Transaction Completed', 'Transaction for auction \"จานโบราณทรงสวย\" has been completed successfully.', 0, '2026-04-10 08:32:34'),
(299, 85, 27, 'payment_released', 'Transaction Completed', 'Transaction for auction \"จานโบราณทรงสวย\" has been completed successfully.', 0, '2026-04-10 08:32:34'),
(300, 83, 35, 'payment_received', 'Payment Received', 'Payment received for auction \"กีต้า\": ฿6175.00 (Platform fee: ฿325.00). Money is held in escrow until buyer confirms delivery.', 0, '2026-04-10 08:34:22'),
(301, 83, 27, 'payment_received', 'Payment Processed', 'Payment of ฿6500.00 has been processed for auction \"กีต้า\". Waiting for seller to ship the item.', 0, '2026-04-10 08:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(11) NOT NULL,
  `auction_id` int(11) NOT NULL,
  `winner_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','paid','shipped','delivered','completed','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'escrow',
  `payment_reference` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `paid_at` datetime DEFAULT NULL,
  `shipped_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `auction_id`, `winner_id`, `seller_id`, `amount`, `status`, `payment_method`, `payment_reference`, `created_at`, `paid_at`, `shipped_at`, `delivered_at`, `completed_at`) VALUES
(1, 4, 3, 2, 12000.00, 'paid', 'escrow', NULL, '2025-10-19 04:51:48', '2025-10-19 04:55:56', NULL, NULL, NULL),
(2, 6, 6, 5, 2300.00, 'pending', 'escrow', NULL, '2025-10-19 04:51:48', NULL, NULL, NULL, NULL),
(3, 7, 6, 5, 3000.00, 'pending', 'escrow', NULL, '2025-10-19 04:51:48', NULL, NULL, NULL, NULL),
(4, 8, 6, 3, 3000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(5, 9, 7, 2, 200000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(6, 10, 2, 2, 400000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(7, 11, 2, 2, 300000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(8, 12, 4, 2, 2200.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(9, 13, 2, 4, 2000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(10, 14, 8, 4, 30000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(11, 15, 2, 8, 500000.00, 'pending', 'escrow', NULL, '2025-10-19 05:13:45', NULL, NULL, NULL, NULL),
(12, 16, 14, 12, 35000.00, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:20:38', NULL, NULL, NULL),
(13, 17, 14, 12, 45000.00, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:28:39', NULL, NULL, NULL),
(14, 19, 14, 12, 2500.00, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:28:34', NULL, NULL, NULL),
(15, 20, 14, 12, 5050.01, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:28:37', NULL, NULL, NULL),
(16, 25, 14, 12, 2600.00, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:28:31', NULL, NULL, NULL),
(17, 26, 14, 12, 250000.00, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:15:32', NULL, NULL, NULL),
(18, 27, 14, 12, 25000.00, 'paid', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:21:59', NULL, NULL, NULL),
(19, 28, 14, 12, 1500.00, 'completed', 'escrow', NULL, '2025-10-19 05:13:45', '2025-10-19 05:28:41', '2025-10-19 05:52:51', '2025-10-25 09:12:30', '2025-10-25 09:12:35'),
(20, 29, 14, 12, 25000.00, 'completed', 'escrow', NULL, '2025-10-19 05:26:48', '2025-10-19 05:27:53', '2025-10-19 05:50:36', '2025-10-19 05:51:32', '2025-10-19 05:51:35'),
(21, 31, 15, 12, 30000.00, 'completed', 'escrow', NULL, '2025-10-19 05:57:56', '2025-10-25 08:53:09', '2025-10-25 08:53:47', '2025-10-25 08:57:05', '2025-10-25 08:57:09'),
(22, 32, 15, 12, 1500.00, 'completed', 'escrow', NULL, '2025-10-19 06:02:25', '2025-10-19 06:11:03', '2025-10-19 06:11:13', '2025-10-25 08:53:03', '2025-10-25 08:53:06'),
(23, 33, 16, 17, 30000.00, 'shipped', 'escrow', NULL, '2025-10-19 06:06:20', '2025-10-19 06:06:36', '2025-10-19 06:07:12', NULL, NULL),
(24, 34, 19, 18, 30000.00, 'completed', 'escrow', NULL, '2025-10-19 06:19:06', '2025-10-19 06:20:05', '2025-10-19 06:20:48', '2025-10-19 06:21:17', '2025-10-19 06:21:20'),
(25, 35, 19, 21, 35000.00, 'completed', 'escrow', NULL, '2025-10-19 06:27:06', '2025-10-19 06:27:17', '2025-10-19 07:10:04', '2025-10-19 07:11:43', '2025-10-19 07:11:45'),
(26, 36, 19, 21, 55000.00, 'completed', 'escrow', NULL, '2025-10-19 07:05:23', '2025-10-19 07:05:40', '2025-10-19 07:09:44', '2025-10-19 07:10:23', '2025-10-19 07:10:27'),
(27, 37, 19, 21, 25000.00, 'pending', 'escrow', NULL, '2025-10-19 07:37:01', NULL, NULL, NULL, NULL),
(28, 39, 23, 22, 650000.00, 'completed', 'escrow', NULL, '2025-10-25 19:08:26', '2025-10-25 19:10:01', '2025-10-25 19:14:24', '2025-10-25 19:15:04', '2025-10-25 19:16:39'),
(29, 40, 23, 22, 255000.00, 'completed', 'escrow', NULL, '2025-10-25 19:22:29', '2025-10-25 19:22:55', '2025-10-25 19:29:54', '2025-10-25 19:30:21', '2025-10-25 19:30:23'),
(30, 41, 23, 22, 260000.00, 'completed', 'escrow', NULL, '2025-10-25 20:38:00', '2025-10-25 20:39:57', '2025-10-25 20:40:33', '2025-10-25 20:41:06', '2025-10-25 20:41:10'),
(31, 42, 23, 22, 260000.00, 'completed', 'escrow', NULL, '2025-10-25 20:47:23', '2025-10-25 20:47:40', '2025-10-25 20:48:18', '2025-10-25 20:48:34', '2025-10-25 20:48:38'),
(32, 44, 23, 22, 300000.00, 'delivered', 'escrow', NULL, '2025-10-30 14:51:19', '2025-10-30 14:55:22', '2025-10-30 14:55:58', '2025-11-04 15:57:02', NULL),
(33, 45, 23, 22, 270000.00, 'delivered', 'escrow', NULL, '2025-11-04 16:02:04', '2025-11-04 16:02:48', '2025-11-04 16:03:29', '2025-11-04 16:03:43', NULL),
(34, 46, 27, 22, 300000.00, 'paid', 'escrow', NULL, '2025-11-04 16:13:55', '2025-11-04 16:34:08', NULL, NULL, NULL),
(35, 46, 27, 22, 300000.00, 'delivered', 'escrow', NULL, '2025-11-04 16:14:46', '2025-11-04 16:24:02', '2025-11-04 16:24:29', '2025-11-04 16:24:41', NULL),
(36, 47, 27, 22, 230000.00, 'delivered', 'escrow', NULL, '2025-11-04 16:28:55', '2025-11-04 16:32:57', '2025-11-04 16:33:52', '2025-11-04 16:34:06', NULL),
(37, 48, 23, 22, 300000.00, 'delivered', 'escrow', NULL, '2025-11-04 16:37:03', '2025-11-04 16:37:51', '2025-11-04 16:38:13', '2025-11-04 16:42:45', NULL),
(38, 49, 27, 22, 300000.00, 'delivered', 'escrow', NULL, '2025-11-04 16:47:54', '2025-11-04 16:55:04', '2025-11-04 16:55:43', '2025-11-04 16:56:11', NULL),
(39, 50, 27, 22, 300000.00, 'delivered', 'escrow', NULL, '2025-11-04 17:00:17', '2025-11-04 17:02:30', '2025-11-04 17:03:00', '2025-11-04 17:03:19', NULL),
(40, 51, 27, 22, 1200000.00, 'delivered', 'escrow', NULL, '2025-11-04 18:08:23', '2025-11-04 18:11:44', '2025-11-04 18:12:52', '2025-11-04 18:18:35', NULL),
(41, 53, 23, 22, 300000.00, 'delivered', 'escrow', NULL, '2025-11-05 16:56:15', '2025-11-05 16:57:39', '2025-11-05 16:58:48', '2025-11-05 16:58:59', NULL),
(42, 54, 27, 22, 1200000.00, 'pending', 'escrow', NULL, '2025-11-05 17:00:39', NULL, NULL, NULL, NULL),
(43, 55, 27, 22, 420000.00, 'pending', 'escrow', NULL, '2025-11-05 17:09:18', NULL, NULL, NULL, NULL),
(44, 56, 27, 22, 800000.00, 'pending', 'escrow', NULL, '2025-11-05 17:15:05', NULL, NULL, NULL, NULL),
(45, 57, 27, 22, 820000.00, 'pending', 'escrow', NULL, '2025-11-05 17:22:24', NULL, NULL, NULL, NULL),
(46, 58, 23, 22, 850000.00, 'pending', 'escrow', NULL, '2025-11-05 17:29:39', NULL, NULL, NULL, NULL),
(47, 59, 27, 22, 5000.00, 'pending', 'escrow', NULL, '2025-11-05 17:37:22', NULL, NULL, NULL, NULL),
(48, 60, 23, 22, 400000.00, 'pending', 'escrow', NULL, '2025-11-05 17:54:32', NULL, NULL, NULL, NULL),
(49, 61, 27, 22, 400000.00, 'pending', 'escrow', NULL, '2025-11-05 17:59:05', NULL, NULL, NULL, NULL),
(50, 62, 27, 22, 50000.00, 'pending', 'escrow', NULL, '2025-11-05 18:04:52', NULL, NULL, NULL, NULL),
(51, 63, 27, 22, 400000.00, 'pending', 'escrow', NULL, '2025-11-05 18:08:49', NULL, NULL, NULL, NULL),
(52, 64, 23, 22, 500000.00, 'pending', 'escrow', NULL, '2025-11-05 18:11:43', NULL, NULL, NULL, NULL),
(53, 65, 23, 22, 800000.00, 'pending', 'escrow', NULL, '2025-11-05 18:14:44', NULL, NULL, NULL, NULL),
(54, 66, 27, 22, 50000.00, 'pending', 'escrow', NULL, '2025-11-05 18:18:14', NULL, NULL, NULL, NULL),
(55, 67, 27, 22, 90000.00, 'pending', 'escrow', NULL, '2025-11-05 18:23:15', NULL, NULL, NULL, NULL),
(56, 68, 27, 22, 80000.00, 'pending', 'escrow', NULL, '2025-11-05 18:28:14', NULL, NULL, NULL, NULL),
(57, 69, 27, 22, 400000.00, 'pending', 'escrow', NULL, '2025-11-05 19:09:26', NULL, NULL, NULL, NULL),
(58, 70, 27, 22, 21000.00, 'pending', 'escrow', NULL, '2025-11-05 19:11:13', NULL, NULL, NULL, NULL),
(59, 71, 23, 22, 90000.00, 'pending', 'escrow', NULL, '2025-11-07 21:08:07', NULL, NULL, NULL, NULL),
(60, 72, 27, 22, 4000.00, 'pending', 'escrow', NULL, '2025-11-07 21:10:23', NULL, NULL, NULL, NULL),
(61, 73, 27, 22, 3500.00, 'shipped', 'escrow', NULL, '2025-11-07 21:19:04', '2025-11-07 23:27:01', '2025-11-07 23:27:37', NULL, NULL),
(62, 74, 27, 22, 60000.00, 'pending', 'escrow', NULL, '2025-11-07 23:39:28', NULL, NULL, NULL, NULL),
(63, 76, 30, 29, 36000.00, 'delivered', 'escrow', NULL, '2025-11-08 03:09:00', '2025-11-08 03:16:01', '2025-11-08 03:17:19', '2025-11-08 03:17:46', NULL),
(64, 77, 30, 29, 500000.00, 'delivered', 'escrow', NULL, '2025-11-08 03:39:15', '2025-11-08 03:41:23', '2025-11-08 04:45:47', '2025-11-08 05:03:15', NULL),
(65, 78, 30, 29, 34000.00, 'delivered', 'escrow', NULL, '2025-11-08 04:21:28', '2025-11-08 04:22:08', '2025-11-08 04:41:32', '2025-11-08 04:41:45', NULL),
(66, 79, 30, 29, 3000.00, 'paid', 'escrow', NULL, '2025-11-08 04:26:01', '2025-11-08 04:38:33', NULL, NULL, NULL),
(67, 80, 30, 29, 400000.00, 'delivered', 'escrow', NULL, '2025-11-08 05:07:21', '2025-11-08 05:09:10', '2025-11-08 05:09:43', '2025-11-08 05:10:09', NULL),
(68, 82, 31, 22, 4359.97, 'delivered', 'escrow', NULL, '2026-03-11 14:50:02', '2026-03-11 14:56:30', '2026-03-11 14:58:42', '2026-03-11 14:58:58', NULL),
(69, 88, 31, 29, 4300.00, 'completed', 'escrow', NULL, '2026-03-18 14:15:09', '2026-03-18 14:15:55', '2026-03-18 14:16:11', '2026-03-18 14:16:36', '2026-03-18 14:17:31'),
(70, 89, 31, 29, 5100.00, 'completed', 'escrow', NULL, '2026-03-18 14:33:25', '2026-03-18 14:36:30', '2026-03-18 14:36:54', '2026-03-18 14:37:13', '2026-03-18 14:37:15'),
(71, 90, 31, 29, 4550.00, 'completed', 'escrow', NULL, '2026-03-18 14:46:09', '2026-03-18 14:46:48', '2026-03-18 14:47:15', '2026-03-18 14:47:22', '2026-03-18 14:47:22'),
(72, 91, 31, 29, 6000.00, 'completed', 'escrow', NULL, '2026-03-18 14:53:10', '2026-03-18 14:53:35', '2026-03-18 14:53:56', '2026-03-18 14:54:09', '2026-03-18 14:54:09'),
(73, 95, 23, 35, 6500.00, 'pending', 'escrow', NULL, '2026-04-06 21:29:14', NULL, NULL, NULL, NULL),
(74, 93, 27, 22, 30000.00, 'pending', 'escrow', NULL, '2026-04-08 15:29:23', NULL, NULL, NULL, NULL),
(75, 96, 32, 35, 3200.00, 'pending', 'escrow', NULL, '2026-04-08 15:35:23', NULL, NULL, NULL, NULL),
(76, 99, 27, 35, 45000.00, 'completed', 'escrow', NULL, '2026-04-08 16:18:20', '2026-04-08 16:21:46', '2026-04-08 16:22:58', '2026-04-08 16:23:18', '2026-04-08 16:23:22'),
(77, 97, 32, 35, 5400.00, 'pending', 'escrow', NULL, '2026-04-08 17:37:21', NULL, NULL, NULL, NULL),
(78, 100, 27, 35, 3500.00, 'pending', 'escrow', NULL, '2026-04-08 18:31:08', NULL, NULL, NULL, NULL),
(79, 101, 27, 35, 4000.00, 'pending', 'escrow', NULL, '2026-04-08 18:36:00', NULL, NULL, NULL, NULL),
(80, 103, 27, 35, 9500.00, 'pending', 'escrow', NULL, '2026-04-09 15:41:13', NULL, NULL, NULL, NULL),
(81, 104, 32, 35, 6000.00, 'pending', 'escrow', NULL, '2026-04-09 15:55:13', NULL, NULL, NULL, NULL),
(82, 105, 27, 35, 5500.00, 'pending', 'escrow', NULL, '2026-04-09 15:58:13', NULL, NULL, NULL, NULL),
(83, 106, 27, 35, 6500.00, 'paid', 'escrow', NULL, '2026-04-09 16:10:00', '2026-04-10 08:34:22', NULL, NULL, NULL),
(84, 107, 27, 35, 6600.00, 'completed', 'escrow', NULL, '2026-04-09 16:16:00', '2026-04-09 22:38:16', '2026-04-09 22:41:20', '2026-04-09 22:42:24', '2026-04-09 22:43:08'),
(85, 108, 27, 35, 7000.00, 'completed', 'escrow', NULL, '2026-04-09 16:22:00', '2026-04-09 22:29:45', '2026-04-09 22:31:35', '2026-04-10 08:32:31', '2026-04-10 08:32:34');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(11) NOT NULL,
  `auction_id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `order_id`, `auction_id`, `seller_id`, `buyer_id`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
(1, 69, 88, 29, 31, 5, NULL, '2026-03-18 07:29:07', '2026-03-18 07:29:07'),
(2, 70, 89, 29, 31, 5, NULL, '2026-03-18 07:37:23', '2026-03-18 07:37:23'),
(3, 71, 90, 29, 31, 4, 'แพ็คไม่ดี', '2026-03-18 07:47:42', '2026-03-18 07:47:42'),
(4, 72, 91, 29, 31, 5, NULL, '2026-03-18 07:57:32', '2026-03-18 07:57:32'),
(5, 76, 99, 35, 27, 4, 'ให้คำอธิบายดี', '2026-04-08 09:23:42', '2026-04-08 09:23:42'),
(6, 84, 107, 35, 27, 5, NULL, '2026-04-09 15:46:13', '2026-04-09 15:46:13');

--
-- Triggers `reviews`
--
DELIMITER $$
CREATE TRIGGER `trg_reviews_after_insert` AFTER INSERT ON `reviews` FOR EACH ROW UPDATE users u
      SET
        u.average_rating = (
          SELECT IFNULL(AVG(r.rating), 0)
          FROM reviews r
          JOIN payment_transactions pt ON pt.id = r.order_id
          WHERE r.seller_id = NEW.seller_id AND pt.status = 'completed'
        ),
        u.review_count = (
          SELECT COUNT(*)
          FROM reviews r
          JOIN payment_transactions pt ON pt.id = r.order_id
          WHERE r.seller_id = NEW.seller_id AND pt.status = 'completed'
        )
      WHERE u.id = NEW.seller_id
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_info`
--

CREATE TABLE `shipping_info` (
  `id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `recipient_name` varchar(100) DEFAULT NULL,
  `recipient_phone` varchar(20) DEFAULT NULL,
  `shipping_address` text NOT NULL,
  `shipping_method` varchar(100) DEFAULT 'standard',
  `tracking_number` varchar(255) DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `actual_delivery` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shipping_info`
--

INSERT INTO `shipping_info` (`id`, `transaction_id`, `recipient_name`, `recipient_phone`, `shipping_address`, `shipping_method`, `tracking_number`, `estimated_delivery`, `actual_delivery`, `notes`, `created_at`, `updated_at`) VALUES
(1, 20, NULL, NULL, '123 Test Street, Bangkok', 'standard', 'TRK123456', '2025-10-25', NULL, 'Test shipment', '2025-10-19 05:50:36', '2025-10-19 05:50:36'),
(2, 19, NULL, NULL, '123 Test Street, Bangkok', 'standard', 'TRK123456', '2025-10-25', NULL, 'Test shipment', '2025-10-19 05:52:51', '2025-10-19 05:52:51'),
(3, 23, NULL, NULL, '29/7', 'standard', '12121212', '2025-10-22', NULL, 'เรียบร้อยครับ', '2025-10-19 06:07:12', '2025-10-19 06:07:12'),
(4, 22, NULL, NULL, '123 Test Street, Bangkok, Thailand', 'Express Shipping', 'TH123456789', '2025-10-25', NULL, 'Item will be delivered within 2-3 business days', '2025-10-19 06:11:13', '2025-10-19 06:11:13'),
(5, 24, NULL, NULL, 'Bang kok', 'express', 'THAD293838123123', '2025-10-22', NULL, 'อาจจะล่าช้านะครับ', '2025-10-19 06:20:48', '2025-10-19 06:20:48'),
(6, 26, NULL, NULL, 'THAA', 'express', 'TH123123123', '2025-10-21', NULL, '', '2025-10-19 07:09:44', '2025-10-19 07:09:44'),
(7, 25, NULL, NULL, 'TH123123', 'express', 'TH123123123', '2025-10-22', NULL, '', '2025-10-19 07:10:04', '2025-10-19 07:10:04'),
(8, 21, NULL, NULL, '29 - 817', 'express', 'TH789345', '2025-10-27', NULL, '', '2025-10-25 08:53:47', '2025-10-25 08:53:47'),
(9, 28, NULL, NULL, '29/7 ระยอง', 'express', 'THSX123455679', '2025-10-29', NULL, '', '2025-10-25 19:14:24', '2025-10-25 19:14:24'),
(10, 29, NULL, NULL, '2888- bangkok', 'standard', 'TRK87172824', '2025-10-29', NULL, '', '2025-10-25 19:29:54', '2025-10-25 19:29:54'),
(11, 30, NULL, NULL, '2768', 'standard', 'TRK29281723123', '2025-10-28', NULL, '', '2025-10-25 20:40:33', '2025-10-25 20:40:33'),
(12, 31, NULL, NULL, 'Bangkok 78/2', 'standard', 'TRK298123123', '2025-10-29', NULL, '', '2025-10-25 20:48:18', '2025-10-25 20:48:18'),
(13, 32, NULL, NULL, 'แมวน้ำมูกไหล', 'registered', 'TH123123123', '2025-11-04', NULL, '', '2025-10-30 14:55:58', '2025-10-30 14:55:58'),
(14, 33, NULL, NULL, '132/200 Bangkok', 'standard', 'TRK8727827', '2025-11-20', NULL, 'อาจจะล่าช้า', '2025-11-04 16:03:29', '2025-11-04 16:03:29'),
(15, 35, NULL, NULL, '123', 'express', 'TYFG123123', '2025-11-06', NULL, '', '2025-11-04 16:24:29', '2025-11-04 16:24:29'),
(16, 36, NULL, NULL, '22323', 'standard', 'THR23123', '2025-11-06', NULL, '', '2025-11-04 16:33:52', '2025-11-04 16:33:52'),
(17, 37, NULL, NULL, '213', 'standard', 'TH232323', '2025-11-07', NULL, '', '2025-11-04 16:38:13', '2025-11-04 16:38:13'),
(18, 38, NULL, NULL, '123123', 'express', 'TRK123123123', '2025-11-06', NULL, '', '2025-11-04 16:55:43', '2025-11-04 16:55:43'),
(19, 39, NULL, NULL, '12312312', 'express', 'TH123123123', '2025-11-06', NULL, '', '2025-11-04 17:03:00', '2025-11-04 17:03:00'),
(20, 40, NULL, NULL, '123/8 Bangkok', 'express', 'TRK123901i23', '2025-11-06', NULL, '', '2025-11-04 18:12:52', '2025-11-04 18:12:52'),
(21, 41, NULL, NULL, '123 Bangkok', 'ems', 'TH12312312312', '2025-11-07', NULL, 'OKOK', '2025-11-05 16:58:48', '2025-11-05 16:58:48'),
(22, 61, NULL, NULL, 'Bangkok 789', 'standard', 'TH123123123123', '2025-11-10', NULL, 'อาจจะส่งล่าช้าคั้บ', '2025-11-07 23:27:37', '2025-11-07 23:27:37'),
(23, 63, NULL, NULL, 'Rayong 129/12', 'standard', 'TH2019123123', '2025-11-10', NULL, 'น่าตะส่งล่าช้านะครับ', '2025-11-08 03:17:19', '2025-11-08 03:17:19'),
(24, 64, 'ก้องภพ ใจดี', '0929203291', '39/8 หมู่ 1 ตำบล เพ อำเภอเมืองระยอง', 'standard', 'TH12312312312', '1899-11-29', NULL, NULL, '2025-11-08 03:41:23', '2025-11-08 04:46:07'),
(25, 65, 'สุดหล่อ บ่อกบ', '09292023921', '38/78 หมู่1 ตำบลกระเฏก', 'express', 'TH12345612312', '2025-11-09', NULL, '', '2025-11-08 04:22:08', '2025-11-08 04:41:32'),
(26, 66, 'ทองภู โอเล่', '0999992932', '391/23 หมู่2', 'standard', NULL, NULL, NULL, NULL, '2025-11-08 04:38:33', '2025-11-08 04:38:33'),
(30, 67, 'ไยดี มามะ', '0912939123', '72/1 ม.1 ต.เพ', 'express', 'TH123123123', '1899-11-30', NULL, NULL, '2025-11-08 05:09:10', '2025-11-08 05:09:53'),
(33, 68, 'User_bidder004', '0912882232', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', '', '2026-03-13', NULL, '', '2026-03-11 14:56:30', '2026-03-11 14:58:42'),
(35, 69, 'User_bidder004', '091231923', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH123123123', '2026-03-20', NULL, '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', '2026-03-18 14:15:55', '2026-03-18 14:16:28'),
(38, 70, 'User_bidder004', '0929290321', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH189921321', '2026-03-20', NULL, '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', '2026-03-18 14:36:30', '2026-03-18 14:36:54'),
(40, 71, 'ภูมิรพี', '0929203291', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH12345567890', '2026-03-20', NULL, '', '2026-03-18 14:46:48', '2026-03-18 14:47:15'),
(42, 72, 'ภูมิรพี', '0929203291', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH12345678', '0000-00-00', NULL, '', '2026-03-18 14:53:35', '2026-03-18 14:53:56'),
(44, 76, 'User_bidder002', '0929203291', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH3081293123', '2026-04-13', NULL, '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000\n', '2026-04-08 16:21:46', '2026-04-08 16:22:58'),
(46, 85, 'User_bidder002', '0929203291', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH123123123', '2026-04-09', NULL, '', '2026-04-09 22:29:45', '2026-04-09 22:31:35'),
(48, 84, 'User_bidder002', '0929203291', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', 'TH123123123', '2026-04-17', NULL, '', '2026-04-09 22:38:16', '2026-04-09 22:41:20'),
(50, 83, 'User_bidder002', '0929203291', '123/45 หมู่บ้านฟ้าใส ซอย 7 ถนนสายรุ้ง ตำบลตัวอย่าง อำเภอเมือง จังหวัดชลบุรี 20000', 'standard', NULL, NULL, NULL, 'โทรมาด้วยครับ', '2026-04-10 08:34:22', '2026-04-10 08:34:22');

-- --------------------------------------------------------

--
-- Table structure for table `top_up_requests`
--

CREATE TABLE `top_up_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `slip_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `processed_by` int(10) UNSIGNED DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `top_up_requests`
--

INSERT INTO `top_up_requests` (`id`, `user_id`, `amount`, `slip_url`, `status`, `note`, `processed_by`, `processed_at`, `created_at`) VALUES
(1, 27, 500.00, '/uploads/topups/topup-1762538268340-998011051.jpg', 'approved', NULL, 25, '2025-11-08 01:02:37', '2025-11-08 00:57:48'),
(2, 27, 2000.00, '/uploads/topups/topup-1762540244242-686916360.jpg', 'rejected', NULL, 25, '2025-11-08 01:37:10', '2025-11-08 01:30:44'),
(3, 27, 2500.00, '/uploads/topups/topup-1762540649678-243422591.jpg', 'approved', NULL, 25, '2025-11-08 01:37:40', '2025-11-08 01:37:29'),
(4, 27, 45000.00, '/uploads/topups/topup-1762541833961-871641075.jpg', 'approved', 'กำลังโอนเงิน', 25, '2025-11-08 02:37:45', '2025-11-08 01:57:13'),
(5, 27, 5000.00, '/uploads/topups/topup-1762545707247-167288755.jpg', 'approved', NULL, 25, '2025-11-08 03:02:07', '2025-11-08 03:01:47'),
(6, 30, 2500000.00, '/uploads/topups/topup-1762545909995-637128599.jpg', 'approved', NULL, 25, '2025-11-08 03:05:49', '2025-11-08 03:05:09'),
(7, 31, 900000.00, '/uploads/topups/topup-1773214750997-859475276.jpg', 'approved', 'ด่วนๆ', 25, '2026-03-11 14:40:01', '2026-03-11 14:39:11'),
(8, 32, 500000.00, '/uploads/topups/topup-1773337367788-623461584.jpg', 'approved', 'เติมด่วนแอด', 25, '2026-03-13 00:45:09', '2026-03-13 00:42:47'),
(9, 32, 35000.00, '/uploads/topups/topup-1773816267814-609396893.jpg', 'approved', NULL, 25, '2026-03-18 13:45:14', '2026-03-18 13:44:27'),
(10, 32, 5000.00, '/uploads/topups/topup-1773816387544-101381764.jpg', 'approved', NULL, 25, '2026-03-18 13:46:40', '2026-03-18 13:46:27'),
(11, 32, 5000.00, '/uploads/topups/topup-1773816779705-79648324.jpg', 'approved', NULL, 25, '2026-03-18 13:53:06', '2026-03-18 13:52:59'),
(12, 32, 900.00, '/uploads/topups/topup-1773816845589-28259044.jpg', 'rejected', NULL, 25, '2026-03-18 13:54:40', '2026-03-18 13:54:05'),
(13, 23, 500.00, '/uploads/topups/topup-1775421511559-29085351.jpg', 'pending', NULL, NULL, NULL, '2026-04-06 03:38:31'),
(14, 35, 500.00, '/uploads/topups/topup-1775757517960-823697417.jpg', 'pending', 'เร่งหน่อย', NULL, NULL, '2026-04-10 00:58:37'),
(15, 34, 500.00, '/uploads/topups/topup-1775782124656-683338986.jpg', 'approved', 'โอนแล้วครับ', 25, '2026-04-10 07:55:56', '2026-04-10 07:48:44'),
(16, 34, 10000.00, '/uploads/topups/topup-1775782499203-278944043.jpg', 'approved', '10000', 25, '2026-04-10 07:55:54', '2026-04-10 07:54:59');

-- --------------------------------------------------------

--
-- Table structure for table `top_up_request_logs`
--

CREATE TABLE `top_up_request_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `actor_id` int(10) UNSIGNED DEFAULT NULL,
  `actor_type` enum('user','admin','system') NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `top_up_request_logs`
--

INSERT INTO `top_up_request_logs` (`id`, `request_id`, `actor_id`, `actor_type`, `action`, `details`, `created_at`) VALUES
(1, 2, 25, 'admin', 'rejected', '{\"note\":null,\"amount\":2000}', '2025-11-08 01:37:10'),
(2, 3, 27, 'user', 'created', '{\"amount\":2500,\"slipUrl\":\"/uploads/topups/topup-1762540649678-243422591.jpg\",\"note\":null}', '2025-11-08 01:37:29'),
(3, 3, 25, 'admin', 'approved', '{\"note\":null,\"amount\":2500}', '2025-11-08 01:37:40'),
(4, 4, 27, 'user', 'created', '{\"amount\":45000,\"slipUrl\":\"/uploads/topups/topup-1762541833961-871641075.jpg\",\"note\":null}', '2025-11-08 01:57:13'),
(5, 4, 25, 'admin', 'approved', '{\"note\":\"กำลังโอนเงิน\",\"amount\":45000}', '2025-11-08 02:37:45'),
(6, 5, 27, 'user', 'created', '{\"amount\":5000,\"slipUrl\":\"/uploads/topups/topup-1762545707247-167288755.jpg\",\"note\":null}', '2025-11-08 03:01:47'),
(7, 5, 25, 'admin', 'approved', '{\"note\":null,\"amount\":5000}', '2025-11-08 03:02:07'),
(8, 6, 30, 'user', 'created', '{\"amount\":2500000,\"slipUrl\":\"/uploads/topups/topup-1762545909995-637128599.jpg\",\"note\":null}', '2025-11-08 03:05:09'),
(9, 6, 25, 'admin', 'approved', '{\"note\":null,\"amount\":2500000}', '2025-11-08 03:05:49'),
(10, 7, 31, 'user', 'created', '{\"amount\":900000,\"slipUrl\":\"/uploads/topups/topup-1773214750997-859475276.jpg\",\"note\":\"ด่วนๆ\"}', '2026-03-11 14:39:11'),
(11, 7, 25, 'admin', 'approved', '{\"note\":\"ด่วนๆ\",\"amount\":900000}', '2026-03-11 14:40:01'),
(12, 8, 32, 'user', 'created', '{\"amount\":500000,\"slipUrl\":\"/uploads/topups/topup-1773337367788-623461584.jpg\",\"note\":\"เติมด่วนแอด\"}', '2026-03-13 00:42:47'),
(13, 8, 25, 'admin', 'approved', '{\"note\":\"เติมด่วนแอด\",\"amount\":500000}', '2026-03-13 00:45:09'),
(14, 9, 32, 'user', 'created', '{\"amount\":35000,\"slipUrl\":\"/uploads/topups/topup-1773816267814-609396893.jpg\",\"note\":null}', '2026-03-18 13:44:27'),
(15, 9, 25, 'admin', 'approved', '{\"note\":null,\"amount\":35000}', '2026-03-18 13:45:14'),
(16, 10, 32, 'user', 'created', '{\"amount\":5000,\"slipUrl\":\"/uploads/topups/topup-1773816387544-101381764.jpg\",\"note\":null}', '2026-03-18 13:46:27'),
(17, 10, 25, 'admin', 'approved', '{\"note\":null,\"amount\":5000}', '2026-03-18 13:46:40'),
(18, 11, 32, 'user', 'created', '{\"amount\":5000,\"slipUrl\":\"/uploads/topups/topup-1773816779705-79648324.jpg\",\"note\":null}', '2026-03-18 13:52:59'),
(19, 11, 25, 'admin', 'approved', '{\"note\":null,\"amount\":5000}', '2026-03-18 13:53:06'),
(20, 12, 32, 'user', 'created', '{\"amount\":900,\"slipUrl\":\"/uploads/topups/topup-1773816845589-28259044.jpg\",\"note\":null}', '2026-03-18 13:54:05'),
(21, 12, 25, 'admin', 'rejected', '{\"note\":null,\"amount\":900}', '2026-03-18 13:54:40'),
(22, 13, 23, 'user', 'created', '{\"amount\":500,\"slipUrl\":\"/uploads/topups/topup-1775421511559-29085351.jpg\",\"note\":null}', '2026-04-06 03:38:31'),
(23, 14, 35, 'user', 'created', '{\"amount\":500,\"slipUrl\":\"/uploads/topups/topup-1775757517960-823697417.jpg\",\"note\":\"เร่งหน่อย\"}', '2026-04-10 00:58:37'),
(24, 15, 34, 'user', 'created', '{\"amount\":500,\"slipUrl\":\"/uploads/topups/topup-1775782124656-683338986.jpg\",\"note\":\"โอนแล้วครับ\"}', '2026-04-10 07:48:44'),
(25, 16, 34, 'user', 'created', '{\"amount\":10000,\"slipUrl\":\"/uploads/topups/topup-1775782499203-278944043.jpg\",\"note\":\"10000\"}', '2026-04-10 07:54:59'),
(26, 16, 25, 'admin', 'approved', '{\"note\":\"10000\",\"amount\":10000}', '2026-04-10 07:55:54'),
(27, 15, 25, 'admin', 'approved', '{\"note\":\"โอนแล้วครับ\",\"amount\":500}', '2026-04-10 07:55:56');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `average_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `review_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `phone`, `email`, `role`, `balance`, `average_rating`, `review_count`) VALUES
(1, '123', '$2a$10$chLU.n7rlwEUt.a/vBhDcuF8kK6ncyeRQZ10CyQ0z6y3uvi3jV2Ca', NULL, NULL, 'admin', 50.00, 0.00, 0),
(2, '1111', '$2a$10$GEzaayidiuVNZ6H/6v0XpugLXyGcpNzYaz.0OpzcqbZiZwzQxeX1y', NULL, NULL, 'admin', 351334.00, 0.00, 0),
(3, '1122', '$2a$10$XLX7ZPrjPtQsl04dsYg3HOdmGIjrF5L1ep4/xovFL2vGMI4EwEMtq', NULL, NULL, 'user', 10222.00, 0.00, 0),
(4, '1133', '$2a$10$H6SUzearU0k/q7tJHNAE/.vB/YVzJjCWGQaFAqOn58L5MKFEo7Zfq', NULL, NULL, 'user', 197800.00, 0.00, 0),
(5, '2222', '$2a$10$WYyKyoLmN47aCOTfV3BwEe7au45GcZ/ECfKdHAMA.eJdQP2xAdB6W', NULL, NULL, 'user', 0.00, 0.00, 0),
(6, '3333', '$2a$10$uEb1Gt8Vw2w9Nmo866q3h.FNT3IHwjJ89EI6ZjOOeDB6HPib2cAY2', NULL, NULL, 'user', 241700.00, 0.00, 0),
(7, '1144', '$2a$10$UElyfEMKBm7h4Sc77mfxkO61dHNajIc1QAyalaGHUkSPZmJBV6ntO', NULL, NULL, 'user', 1800000.00, 0.00, 0),
(8, 'Nongpoom', '$2a$10$vHNvQRMDhEqW2AofgxU9tO9.ESBE4mM/UDlYt/wyWhMR./mml3CIy', NULL, NULL, 'admin', 2670000.00, 0.00, 0),
(9, '6666', '$2a$10$2Vsji.VSIDkFbdub2Htztu70zvn8gAGXo7Z3L2I8lnILcJZhgZwDq', NULL, NULL, 'user', 100000.00, 0.00, 0),
(10, '2555', '$2a$10$DAt89yBx393e4QEAeLu4H.3PA2dNebLLYwNM./F6/qDlpwOaMyT86', NULL, NULL, 'user', 0.00, 0.00, 0),
(11, 'phoomrapee092', '$2a$10$IrepMSVqK2MphxxadiUgVeBS4VON.gdoI5qL.9q.XXtUaGzKmF8l.', NULL, NULL, 'user', 0.00, 0.00, 0),
(12, '1313', '$2a$10$f8DCU4hfQeKZyj5oKGMYw.UQNH8W44xriioUYYZ9MFEf5UkA6EaN.', NULL, NULL, 'user', 1425.00, 0.00, 0),
(13, '1414', '$2a$10$0nhtiwQeN6xN23vUiMIZMe29kmcOaEje1gqxhzws6LCxIbRK5BQrC', NULL, NULL, 'user', 24970000.00, 0.00, 0),
(14, '1515', '$2a$10$5imCc8oP6Z3k8QgE1ZmuT.r0NKiMyvfML1zc8haJZPLkXp7vOH4iy', NULL, NULL, 'user', 24608349.99, 0.00, 0),
(15, '1616', '$2a$10$GfulyGMH4VWna1..ytb8gOdLNBO4ULZY3ozLgMN4vM7VScPX.SLUG', NULL, NULL, 'user', 220000.00, 0.00, 0),
(16, '1717', '$2a$10$PGCjxvdH.NLfro.JGZCuSuRk.Y.LjR4n/2auSn9PdmFtaxkyZdMi6', NULL, NULL, 'user', 24970000.00, 0.00, 0),
(17, '1212', '$2a$10$WJjILhfIZ0m8vUM1RQIHsOo5slastoUkLv6iJXwCyqIHayK9uFZRC', NULL, NULL, 'user', 28500.00, 0.00, 0),
(18, 'Phoompm092', '$2a$10$woSX4xhE3QFt0C8MrOYTnuxZ7orBmdXf1GZbEitqogJzUR8kuPYCi', NULL, NULL, 'user', 57000.00, 0.00, 0),
(19, 'Phoompm920', '$2a$10$nF02yNCu7Ikma.fw.cZPl.chFTev9rin/CznKpNx8kx6P4Uabia5e', NULL, NULL, 'user', 155000.00, 0.00, 0),
(20, 'phoomrapee092920', '$2a$10$wbtil1YlbMab3yRRgkzAxucxSkoTMLU1qJMzKXgwW.x69toEsBuWq', NULL, NULL, 'user', 0.00, 0.00, 0),
(21, 'phoom0929203291', '$2a$10$2UUsNr2.wy.P/7E8nHKRFeWukQ9hQEAK8xWP6hahK4Y8s16HN9KkW', NULL, NULL, 'user', 171000.00, 0.00, 0),
(22, 'user_auctions001', '$2a$10$dZCu2C9yJujoG4G9GEKxou.dlSxBYSUFqfwKQCvZwzssY0q0IWlBu', '0999278237', 'user_auctions001@gmail.com', 'user', 3535621.97, 0.00, 0),
(23, 'User_bidder001', '$2a$10$vz76rPGKIXaVjwJS6mkf9OHAQCvkKsUdSALVDD4yVYxh.Y7fy/ZG.', '0999278348', 'user_bidder001@gmail.com', 'user', 1566500.00, 0.00, 0),
(25, 'Admin001', '$2a$10$y9Q/G3tocVG9i4vHCMxlx.FH.yfkmNc0x/7bdvJdUyLW3wqlT/WdW', '0999238348', 'admin001@gmail.com', 'admin', 0.00, 0.00, 0),
(26, 'admin', '$2a$10$/LysOsb45POnbz920PhhMOBkonARKezcA7GL/baezotIYVxjezY7i', NULL, NULL, 'admin', 10100.00, 0.00, 0),
(27, 'User_bidder002', '$2a$10$45kaY15TQlFkK/tSQaEN.O6rwnxcmJ95vmHG423ynQF90ohn6yTiy', '0999278547', 'user_bidder002@gmail.com', 'user', 242325901.00, 0.00, 0),
(28, 'image_tester', '$2a$10$X4nvpqFsZNUdftVKBGo//ehzfL8Ac8kKNbjBG0831v5b3yRbVbiLy', '0800000000', 'image_tester@example.com', 'user', 0.00, 0.00, 0),
(29, 'User_auctions002', '$2a$10$3hF6VuFBEov/WBdzF8RjlOGiPNYwDTDYHfXOHLNXjIt7hSUQw9fni', '0939278534', 'user_auctions002@gmail.com', 'user', 940452.50, 4.75, 4),
(30, 'User_bidder003', '$2a$10$RQ4tLX8j9lfN60XoaUUsXeu3u1D8Md0oWS9g3A6glU0zFAjRzwv5e', '0969248347', 'user_bidder003@gmail.com', 'user', 1177000.00, 0.00, 0),
(31, 'User_bidder004', '$2a$10$jrP9WxVHApRGbKwTAS7n0OY5z9ILnD3BxGCKZqlczl0uopPla8z9y', '0929203291', 'user_bidder004@gmail.com', 'user', 324690.03, 0.00, 0),
(32, 'User_bidder005', '$2a$10$/Y04H6g4LNOotnJ5IwtAQOhhIFTNYTqsjPMoCmNd1Biszcxqae4mW', '0823391823', 'phoomarr092@gmail.com', 'user', 244501.00, 0.00, 0),
(33, 'User_bidder006', '$2a$10$y1.A2hzDIqOQyxF7uLLdYOOfDszomy.q.g.EgRG0E3Bo.Lshg67iG', '0823391833', 'phoom123123092@gmail.com', 'user', 0.00, 0.00, 0),
(34, 'yourphoom', '$2a$10$hzA6kCWHcPGDKgl9kzK2EO2ItclOeaTo2N24mfFFA6j81t6IqvWSS', '0929203292', 'phoom092@gmail.com', 'user', 4900.00, 0.00, 0),
(35, 'auction001', '$2a$10$zcLrQA7Eolso3klbxbF6aefXMAgabcLSgo0C4PEC1sEYsdTc0AbdG', '0929203293', 'auction001@gmail.com', 'user', 54170.00, 4.50, 2);

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal_requests`
--

CREATE TABLE `withdrawal_requests` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payout_amount` decimal(12,2) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `note` text DEFAULT NULL,
  `slip_url` varchar(255) DEFAULT NULL,
  `processed_by` int(10) UNSIGNED DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdrawal_requests`
--

INSERT INTO `withdrawal_requests` (`id`, `user_id`, `amount`, `fee`, `payout_amount`, `bank_name`, `account_number`, `status`, `note`, `slip_url`, `processed_by`, `processed_at`, `created_at`) VALUES
(1, 22, 520.00, 20.00, 500.00, 'ธนาคารกสิกรไทย', '1231244123123', 'approved', NULL, '/uploads/withdrawals/withdrawal-1773218331464-811183345.jpg', 25, '2026-03-11 15:38:51', '2026-03-11 15:38:27'),
(2, 22, 520.00, 20.00, 500.00, 'ธนาคารไทยพาณิชย์', '123123123123', 'rejected', NULL, NULL, 25, '2026-03-11 15:42:31', '2026-03-11 15:41:50'),
(3, 27, 100.00, 20.00, 80.00, 'ธนาคารกสิกรไทย', '01239123123', 'approved', NULL, '/uploads/withdrawals/withdrawal-1775754850370-865328615.jpg', 25, '2026-04-10 00:14:10', '2026-04-10 00:13:48'),
(4, 35, 1000.00, 20.00, 980.00, 'ธนาคารกสิกรไทย', '12312312312', 'approved', NULL, '/uploads/withdrawals/withdrawal-1775784931200-79703688.jpg', 25, '2026-04-10 08:35:31', '2026-04-10 00:52:32'),
(5, 35, 500.00, 20.00, 480.00, 'ธนาคารกสิกรไทย', '12312312312', 'pending', NULL, NULL, NULL, NULL, '2026-04-10 08:35:18');

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal_request_logs`
--

CREATE TABLE `withdrawal_request_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `request_id` int(10) UNSIGNED NOT NULL,
  `actor_id` int(10) UNSIGNED DEFAULT NULL,
  `actor_type` enum('user','admin','system') NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `withdrawal_request_logs`
--

INSERT INTO `withdrawal_request_logs` (`id`, `request_id`, `actor_id`, `actor_type`, `action`, `details`, `created_at`) VALUES
(1, 1, 22, 'user', 'created', '{\"amount\":520,\"fee\":20,\"payoutAmount\":500,\"bankName\":\"ธนาคารกสิกรไทย\",\"accountNumber\":\"1231244123123\"}', '2026-03-11 15:38:27'),
(2, 1, 25, 'admin', 'approved', '{\"amount\":520,\"fee\":20,\"payoutAmount\":500,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1773218331464-811183345.jpg\",\"note\":null}', '2026-03-11 15:38:51'),
(3, 2, 22, 'user', 'created', '{\"amount\":520,\"fee\":20,\"payoutAmount\":500,\"bankName\":\"ธนาคารไทยพาณิชย์\",\"accountNumber\":\"123123123123\"}', '2026-03-11 15:41:50'),
(4, 2, 25, 'admin', 'rejected', '{\"amount\":520,\"note\":null}', '2026-03-11 15:42:31'),
(5, 3, 27, 'user', 'created', '{\"amount\":100,\"fee\":20,\"payoutAmount\":80,\"bankName\":\"ธนาคารกสิกรไทย\",\"accountNumber\":\"01239123123\"}', '2026-04-10 00:13:48'),
(6, 3, 25, 'admin', 'approved', '{\"amount\":100,\"fee\":20,\"payoutAmount\":80,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1775754850370-865328615.jpg\",\"note\":null}', '2026-04-10 00:14:10'),
(7, 4, 35, 'user', 'created', '{\"amount\":1000,\"fee\":20,\"payoutAmount\":980,\"bankName\":\"ธนาคารกสิกรไทย\",\"accountNumber\":\"12312312312\"}', '2026-04-10 00:52:32'),
(8, 5, 35, 'user', 'created', '{\"amount\":500,\"fee\":20,\"payoutAmount\":480,\"bankName\":\"ธนาคารกสิกรไทย\",\"accountNumber\":\"12312312312\"}', '2026-04-10 08:35:18'),
(9, 4, 25, 'admin', 'approved', '{\"amount\":1000,\"fee\":20,\"payoutAmount\":980,\"slipUrl\":\"/uploads/withdrawals/withdrawal-1775784931200-79703688.jpg\",\"note\":null}', '2026-04-10 08:35:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_audit_logs`
--
ALTER TABLE `admin_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `auctions`
--
ALTER TABLE `auctions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_auctions_end_time` (`end_time`),
  ADD KEY `idx_auctions_user_id` (`user_id`),
  ADD KEY `idx_auctions_status` (`status`);

--
-- Indexes for table `bids`
--
ALTER TABLE `bids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bids_auction_id` (`auction_id`),
  ADD KEY `idx_bids_user_id` (`user_id`),
  ADD KEY `idx_bids_created_at` (`created_at`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_chat_rooms_auction` (`auction_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`,`is_read`),
  ADD KEY `auction_id` (`auction_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `payment_escrow`
--
ALTER TABLE `payment_escrow`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `payment_notifications`
--
ALTER TABLE `payment_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `type` (`type`),
  ADD KEY `is_read` (`is_read`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auction_id` (`auction_id`),
  ADD KEY `winner_id` (`winner_id`),
  ADD KEY `seller_id` (`seller_id`),
  ADD KEY `status` (`status`),
  ADD KEY `idx_payment_transactions_status_created` (`status`,`created_at`),
  ADD KEY `idx_payment_transactions_winner_status` (`winner_id`,`status`),
  ADD KEY `idx_payment_transactions_seller_status` (`seller_id`,`status`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_review_order` (`order_id`),
  ADD UNIQUE KEY `uq_review_auction_buyer` (`auction_id`,`buyer_id`),
  ADD KEY `idx_reviews_auction_id` (`auction_id`),
  ADD KEY `idx_reviews_seller_id` (`seller_id`),
  ADD KEY `idx_reviews_buyer_id` (`buyer_id`),
  ADD KEY `idx_reviews_order_id` (`order_id`);

--
-- Indexes for table `shipping_info`
--
ALTER TABLE `shipping_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_shipping_transaction` (`transaction_id`),
  ADD KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `top_up_requests`
--
ALTER TABLE `top_up_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `status` (`status`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `top_up_request_logs`
--
ALTER TABLE `top_up_request_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actor_id` (`actor_id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `status` (`status`),
  ADD KEY `created_at` (`created_at`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `withdrawal_request_logs`
--
ALTER TABLE `withdrawal_request_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actor_id` (`actor_id`),
  ADD KEY `request_id` (`request_id`),
  ADD KEY `created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_audit_logs`
--
ALTER TABLE `admin_audit_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `auctions`
--
ALTER TABLE `auctions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `bids`
--
ALTER TABLE `bids`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=150;

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=320;

--
-- AUTO_INCREMENT for table `payment_escrow`
--
ALTER TABLE `payment_escrow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT for table `payment_notifications`
--
ALTER TABLE `payment_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=302;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipping_info`
--
ALTER TABLE `shipping_info`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `top_up_requests`
--
ALTER TABLE `top_up_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `top_up_request_logs`
--
ALTER TABLE `top_up_request_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `withdrawal_request_logs`
--
ALTER TABLE `withdrawal_request_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_audit_logs`
--
ALTER TABLE `admin_audit_logs`
  ADD CONSTRAINT `admin_audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auctions`
--
ALTER TABLE `auctions`
  ADD CONSTRAINT `fk_auctions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bids`
--
ALTER TABLE `bids`
  ADD CONSTRAINT `fk_bids_auction` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_bids_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD CONSTRAINT `fk_chat_rooms_auction` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_escrow`
--
ALTER TABLE `payment_escrow`
  ADD CONSTRAINT `payment_escrow_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_notifications`
--
ALTER TABLE `payment_notifications`
  ADD CONSTRAINT `fk_payment_notif_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_auction` FOREIGN KEY (`auction_id`) REFERENCES `auctions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `shipping_info`
--
ALTER TABLE `shipping_info`
  ADD CONSTRAINT `shipping_info_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `payment_transactions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `top_up_requests`
--
ALTER TABLE `top_up_requests`
  ADD CONSTRAINT `top_up_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `top_up_requests_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `top_up_request_logs`
--
ALTER TABLE `top_up_request_logs`
  ADD CONSTRAINT `top_up_request_logs_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `top_up_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `top_up_request_logs_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdrawal_requests_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `withdrawal_request_logs`
--
ALTER TABLE `withdrawal_request_logs`
  ADD CONSTRAINT `withdrawal_request_logs_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `withdrawal_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdrawal_request_logs_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

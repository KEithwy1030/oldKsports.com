-- 表结构: messages
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `recipient_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_recipient` (`recipient_id`),
  KEY `idx_conversation` (`sender_id`,`recipient_id`),
  KEY `idx_read_status` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 表数据: messages
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (1, 12, 15, '["嗨"]', 1, '["2025-09-18 19:27:04"]', '2025-09-18 19:36:39');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (2, 15, 12, '["你好啊"]', 1, '["2025-09-18 19:36:41"]', '2025-09-18 19:36:49');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (3, 12, 15, '["咋样最近"]', 1, '["2025-09-18 19:36:59"]', '2025-09-18 19:37:10');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (4, 12, 15, '["哈哈哈"]', 1, '["2025-09-18 19:37:17"]', '2025-09-18 19:40:08');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (5, 15, 12, '["还行吧"]', 1, '["2025-09-18 19:39:49"]', '2025-09-18 19:40:02');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (6, 15, 12, '["您的"]', 1, '["2025-09-18 19:39:49"]', '2025-09-18 19:40:02');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (7, 12, 15, '["害"]', 1, '["2025-09-18 19:39:59"]', '2025-09-18 19:40:08');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (8, 15, 12, '["你看呢？"]', 1, '["2025-09-18 19:40:14"]', '2025-09-18 20:28:24');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (9, 12, 15, '["不知道"]', 1, '["2025-09-18 19:44:18"]', '2025-09-18 20:28:32');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (10, 15, 12, '["咋样啊？"]', 1, '["2025-09-18 20:17:07"]', '2025-09-18 20:28:24');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (11, 12, 15, '["不行"]', 1, '["2025-09-18 20:17:29"]', '2025-09-18 20:28:32');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (12, 15, 12, '["哈喽"]', 1, '["2025-09-19 08:23:08"]', '2025-09-19 08:23:12');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (13, 12, 15, '["哈哈哈"]', 1, '["2025-09-25 07:17:52"]', '2025-09-25 07:18:00');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (14, 15, 12, '["别来无恙"]', 1, '["2025-09-25 07:18:12"]', '2025-09-25 11:38:32');


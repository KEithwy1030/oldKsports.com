-- 表结构: merchants
DROP TABLE IF EXISTS `merchants`;
CREATE TABLE `merchants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('gold','advertiser','streamer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_info` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `status` enum('active','inactive','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `merchants_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 表数据: merchants
INSERT INTO `merchants` (`id`, `name`, `description`, `category`, `contact_info`, `website`, `logo_url`, `rating`, `status`, `created_by`, `created_at`, `updated_at`) VALUES (7, '如意', '长期收体育粉', 'advertiser', '飞机@Dempsey888', '', '', '0.00', 'active', 12, '2025-09-17 14:23:49', '2025-09-17 14:50:04');
INSERT INTO `merchants` (`id`, `name`, `description`, `category`, `contact_info`, `website`, `logo_url`, `rating`, `status`, `created_by`, `created_at`, `updated_at`) VALUES (8, '大仙', '长期招解盘主播（播抖音/视频号）', 'advertiser', '飞机@ZX9_TG4_1Z_Tanpopo', '', '', '0.00', 'active', 12, '2025-09-17 15:58:31', '2025-09-25 12:32:51');
INSERT INTO `merchants` (`id`, `name`, `description`, `category`, `contact_info`, `website`, `logo_url`, `rating`, `status`, `created_by`, `created_at`, `updated_at`) VALUES (9, '女主播珂珂', '花瓶长相，实力过硬的女主播', 'streamer', '企鹅：2044035086', '', '', '0.00', 'active', 12, '2025-09-17 16:00:03', '2025-09-17 16:00:05');
INSERT INTO `merchants` (`id`, `name`, `description`, `category`, `contact_info`, `website`, `logo_url`, `rating`, `status`, `created_by`, `created_at`, `updated_at`) VALUES (11, '老k', '站长老k，直播/短视频剪辑/公众号推文/建站', 'streamer', '飞机@oldk999', '', '', '0.00', 'active', 12, '2025-09-17 16:03:36', '2025-09-17 16:03:37');

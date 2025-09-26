-- 表结构: blacklist
DROP TABLE IF EXISTS `blacklist`;
CREATE TABLE `blacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merchant_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `violation_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidence_urls` text COLLATE utf8mb4_unicode_ci,
  `severity` enum('low', '["medium"]','high','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `status` enum('pending', '["verified"]','resolved','dismissed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_by` int NOT NULL,
  `verified_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `blacklist_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blacklist_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


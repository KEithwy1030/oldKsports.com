-- 表结构: notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recipient_id` int NOT NULL,
  `sender_id` int DEFAULT NULL,
  `type` enum('reply','mention','message','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `related_post_id` int DEFAULT NULL,
  `related_reply_id` int DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipient` (`recipient_id`),
  KEY `idx_type` (`type`),
  KEY `idx_read_status` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `sender_id` (`sender_id`),
  KEY `related_post_id` (`related_post_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`related_post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 表数据: notifications
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (1, 1, NULL, 'system', '欢迎加入OldkSports体育社区！', '🎉 欢迎加入我们的体育社区！

在这里您可以：
• 📝 发布体育相关的帖子和讨论
• 💬 与其他体育爱好者交流互动  
• 🏆 参与论坛活动，积累积分等级
• 🔍 浏览优质商家和服务信息
• 💌 通过私信功能与其他用户深入交流

点击右上角用户名可以查看通知，点击其他用户头像可以发起私聊。祝您在社区中玩得愉快！', NULL, NULL, 0, '2025-09-19 08:39:47', '2025-09-19 08:39:47');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (2, 8, NULL, 'system', '欢迎加入OldkSports体育社区！', '🎉 欢迎加入我们的体育社区！

在这里您可以：
• 📝 发布体育相关的帖子和讨论
• 💬 与其他体育爱好者交流互动
• 🏆 参与论坛活动，积累积分等级
• 🔍 浏览优质商家和服务信息
• 💌 通过私信功能与其他用户深入交流

点击右上角用户名可以查看通知，点击其他用户头像可以发起私聊。祝您在社区中玩得愉快！', NULL, NULL, 0, '2025-09-19 08:42:18', '2025-09-19 08:42:18');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (3, 12, NULL, 'system', '欢迎加入OldkSports体育社区！', '🎉 欢迎加入我们的体育社区！

在这里您可以：
• 📝 发布体育相关的帖子和讨论
• 💬 与其他体育爱好者交流互动
• 🏆 参与论坛活动，积累积分等级
• 🔍 浏览优质商家和服务信息
• 💌 通过私信功能与其他用户深入交流

点击右上角用户名可以查看通知，点击其他用户头像可以发起私聊。祝您在社区中玩得愉快！', NULL, NULL, 1, '2025-09-19 08:42:18', '2025-09-19 08:46:40');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (4, 15, NULL, 'system', '欢迎加入OldkSports体育社区！', '🎉 欢迎 老k哈哈哈 加入我们的体育社区！

在这里您可以：
• 📝 发布体育相关的帖子和讨论
• 💬 与其他体育爱好者交流互动
• 🏆 参与论坛活动，积累积分等级
• 🔍 浏览优质商家和服务信息
• 💌 通过私信功能与其他用户深入交流

点击右上角用户名可以查看通知，点击其他用户头像可以发起私聊。祝您在社区中玩得愉快！', NULL, NULL, 1, '2025-09-19 09:02:26', '2025-09-19 09:17:10');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (5, 15, NULL, 'system', '欢迎加入OldkSports体育社区！', '🎉 欢迎 老k哈哈哈 加入我们的体育社区！

在这里您可以：
• 📝 发布体育相关的帖子和讨论
• 💬 与其他体育爱好者交流互动
• 🏆 参与论坛活动，积累积分等级
• 🔍 浏览优质商家和服务信息
• 💌 通过私信功能与其他用户深入交流

点击右上角用户名可以查看通知，点击其他用户头像可以发起私聊。祝您在社区中玩得愉快！', NULL, NULL, 1, '2025-09-19 09:19:16', '2025-09-19 09:27:18');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (7, 12, 15, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"测试1454"', 60, 42, 1, '2025-09-24 16:30:55', '2025-09-24 16:43:56');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (8, 15, 12, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"曝光曝光！"', 61, 44, 1, '2025-09-24 17:05:19', '2025-09-24 17:05:42');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (9, 15, 12, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"曝光曝光！"', 61, 45, 1, '2025-09-24 17:05:56', '2025-09-24 17:48:02');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (10, 15, 12, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"曝光曝光！"', 61, 46, 1, '2025-09-24 17:36:09', '2025-09-24 17:48:02');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (11, 15, 12, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"曝光曝光！"', 61, 47, 1, '2025-09-24 17:39:11', '2025-09-24 17:48:02');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (12, 15, 12, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"曝光曝光！"', 61, 48, 1, '2025-09-24 17:42:15', '2025-09-24 17:48:02');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (13, 12, 15, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"测试1454"', 60, 49, 1, '2025-09-24 17:42:31', '2025-09-24 17:47:58');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (14, 15, 12, 'reply', '您的帖子收到新回复', '有人回复了您的帖子"曝光曝光！"', 61, 50, 1, '2025-09-24 17:45:25', '2025-09-24 17:48:02');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (15, 15, 12, 'mention', '有人@了您', '@老k哈哈哈 您在帖子中被提及', 61, 50, 1, '2025-09-24 17:45:25', '2025-09-24 17:47:33');
INSERT INTO `notifications` (`id`, `recipient_id`, `sender_id`, `type`, `title`, `content`, `related_post_id`, `related_reply_id`, `is_read`, `created_at`, `updated_at`) VALUES (16, 12, 15, 'mention', '有人@了您', '@老k 您在帖子中被提及', 61, 51, 1, '2025-09-24 17:47:41', '2025-09-24 17:47:56');

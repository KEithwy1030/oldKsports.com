-- 表结构: forum_replies
DROP TABLE IF EXISTS `forum_replies`;
CREATE TABLE `forum_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `author_id` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `likes` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 表数据: forum_replies
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (35, 55, 12, '["222"]', '2025-09-24 09:08:16', '["2025-09-24 09:08:15"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (36, 55, 12, '["111"]', '2025-09-24 09:11:21', '["2025-09-24 09:11:20"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (37, 55, 12, '["1111"]', '2025-09-24 09:11:24', '["2025-09-24 09:11:24"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (38, 55, 12, '["3123213131"]', '2025-09-24 09:15:39', '["2025-09-24 09:15:38"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (39, 55, 12, '[""123123


<div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit","minmax(200px","1fr)); gap: 8px; margin: 16px 0;">
<img src="/uploads/images/post_1758706622711_769861502.jpg" alt="回复图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
</div>""]', '2025-09-24 09:37:03', '["2025-09-24 09:37:02"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (40, 60, 12, '[""12312313


<div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit","minmax(200px","1fr)); gap: 8px; margin: 16px 0;">
<img src="/uploads/images/post_1758728296654_950044180.jpg" alt="回复图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
</div>""]', '2025-09-24 15:38:17', '["2025-09-24 15:38:16"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (41, 60, 12, '[""非常好啊


<div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit","minmax(200px","1fr)); gap: 8px; margin: 16px 0;">
<img src="/uploads/images/post_1758731390439_516578794.jpg" alt="回复图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
</div>""]', '2025-09-24 16:29:51', '["2025-09-24 16:29:50"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (42, 60, 15, '["我觉得行"]', '2025-09-24 16:30:55', '["2025-09-24 16:30:55"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (43, 61, 15, '["这人不行！"]', '2025-09-24 16:32:12', '["2025-09-24 16:32:11"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (44, 61, 12, '["你曝光我？"]', '2025-09-24 17:05:20', '["2025-09-24 17:05:19"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (45, 61, 12, '["来说说
"]', '2025-09-24 17:05:56', '["2025-09-24 17:05:56"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (46, 61, 12, '["哈哈哈"]', '2025-09-24 17:36:10', '["2025-09-24 17:36:09"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (47, 61, 12, '["真不错"]', '2025-09-24 17:39:12', '["2025-09-24 17:39:11"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (48, 61, 12, '["来对线"]', '2025-09-24 17:42:15', '["2025-09-24 17:42:15"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (49, 60, 15, '["好啊
"]', '2025-09-24 17:42:31', '["2025-09-24 17:42:31"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (50, 61, 12, '["回复 @老k哈哈哈

快来啊"]', '2025-09-24 17:45:26', '["2025-09-24 17:45:25"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (51, 61, 15, '["回复 @老k

别搞我哥"]', '2025-09-24 17:47:41', '["2025-09-24 17:47:41"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (52, 63, 15, '["3213213213"]', '2025-09-25 08:37:05', '["2025-09-25 08:37:04"]', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (53, 63, 15, '["234324242342"]', '2025-09-25 08:37:08', '["2025-09-25 08:37:08"]', 0);


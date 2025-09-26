-- OldKSports 数据库干净导出
-- 导出时间: 2025-09-26T14:21:50.819Z
-- 数据库: old_k_sports

SET FOREIGN_KEY_CHECKS = 0;

-- 表结构: blacklist
DROP TABLE IF EXISTS `blacklist`;
CREATE TABLE `blacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merchant_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `violation_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidence_urls` text COLLATE utf8mb4_unicode_ci,
  `severity` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `status` enum('pending','verified','resolved','dismissed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
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


-- 表结构: forum_posts
DROP TABLE IF EXISTS `forum_posts`;
CREATE TABLE `forum_posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` int NOT NULL,
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `views` int DEFAULT '0',
  `likes` int DEFAULT '0',
  `is_sticky` tinyint(1) DEFAULT '0',
  `is_locked` tinyint(1) DEFAULT '0',
  `author` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_avatar` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `author_id` (`author_id`),
  CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 表数据: forum_posts
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (51, '测试1357', '3232


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758693468089_647171610.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693468092_512550736.jpg" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693468095_514095026.png" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693468098_532213275.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693468101_340902968.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693468104_862409593.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693468105_658949868.jpg" alt="帖子图片 7" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 12, 'general', '2025-09-24 05:57:49', '2025-09-24 05:57:49', 0, 0, 0, 0, '老k', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (52, '测试1405', '31233


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758693970110_845533093.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970112_177895828.jpg" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970114_583424852.png" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970116_209516353.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970119_612396745.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970120_341360926.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970120_735252436.jpg" alt="帖子图片 7" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970122_814306287.jpg" alt="帖子图片 8" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758693970139_348548914.jpg" alt="帖子图片 9" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 12, 'general', '2025-09-24 06:06:12', '2025-09-24 06:06:11', 0, 0, 0, 0, '老k', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (55, '测试1418', '123213


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758694728728_411302871.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758694728729_426043846.png" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758694728731_694710578.jpg" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758694728735_714090158.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758694728736_170640132.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758694728737_278604847.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758694728790_340920476.jpg" alt="帖子图片 7" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 12, 'news', '2025-09-24 06:18:50', '2025-09-24 06:18:49', 0, 0, 0, 0, '老k', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (56, '测试1424', '12313


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758695066452_350760256.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066453_782932016.png" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066454_690753356.jpg" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066456_813942988.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066459_201817790.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066460_109315749.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066460_125822667.jpg" alt="帖子图片 7" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066467_328797035.jpg" alt="帖子图片 8" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695066469_701541517.jpeg" alt="帖子图片 9" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 12, 'general', '2025-09-24 06:24:28', '2025-09-24 06:24:27', 0, 0, 0, 0, '老k', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (59, '测试1436', '3213


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758695806279_837605712.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806280_910226219.png" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806282_82203885.jpg" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806284_703815257.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806285_851254607.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806286_960250329.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806287_274952938.jpg" alt="帖子图片 7" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758695806295_293294188.jpg" alt="帖子图片 8" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 12, 'general', '2025-09-24 06:36:48', '2025-09-24 06:36:47', 0, 0, 0, 0, '老k', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (60, '测试1454', '312312


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758696865997_294025573.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696865998_108867777.png" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696865999_220727492.jpg" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696866001_440579096.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696866002_778361149.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696866002_712221147.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696866003_312299281.jpg" alt="帖子图片 7" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758696866011_235061737.jpg" alt="帖子图片 8" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 12, 'general', '2025-09-24 06:54:28', '2025-09-24 06:54:28', 0, 0, 0, 0, '老k', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (61, '曝光曝光！', '2131231313


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758731503296_316176079.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 15, 'news', '2025-09-24 16:31:45', '2025-09-24 16:31:44', 0, 0, 0, 0, '老k哈哈哈', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (62, '测试0148', '@老k 老好人', 15, 'business', '2025-09-24 17:48:32', '2025-09-24 17:48:31', 0, 0, 0, 0, '老k哈哈哈', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (63, '测试16:34', '3213211141415


          <div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
            <img src="http://localhost:8080/uploads/images/post_1758789301170_456476540.jpg" alt="帖子图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758789301176_832692518.png" alt="帖子图片 2" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758789301180_858592090.jpg" alt="帖子图片 3" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758789301184_682744220.jpg" alt="帖子图片 4" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758789301185_834281281.jpg" alt="帖子图片 5" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" /><img src="http://localhost:8080/uploads/images/post_1758789301186_607659206.jpg" alt="帖子图片 6" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
          </div>
        ', 15, 'business', '2025-09-25 08:35:03', '2025-09-25 08:35:02', 0, 0, 0, 0, '老k哈哈哈', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (66, '测试2058 - 哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈哈', '31232313131', 15, 'general', '2025-09-25 12:58:22', '2025-09-25 12:58:21', 0, 0, 0, 0, '老k哈哈哈', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (67, '啊哈哈哈哈哈哈哈哈哈啊哈哈哈啊哈哈哈哈哈哈', '312321313131', 15, 'general', '2025-09-25 12:58:35', '2025-09-25 12:58:35', 0, 0, 0, 0, '老k哈哈哈', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (68, '测试2100 - 哈哈哈哈啊哈哈哈啊哈哈啊哈哈哈哈啊哈', '31232132131', 15, 'general', '2025-09-25 13:00:17', '2025-09-25 13:00:16', 0, 0, 0, 0, '老k哈哈哈', NULL);
INSERT INTO `forum_posts` (`id`, `title`, `content`, `author_id`, `category`, `created_at`, `updated_at`, `views`, `likes`, `is_sticky`, `is_locked`, `author`, `author_avatar`) VALUES (69, '哈哈哈哈哈哈哈', '打算打撒上的', 15, 'general', '2025-09-25 13:26:16', '2025-09-25 13:26:15', 0, 0, 0, 0, '老k哈哈哈', NULL);

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
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (35, 55, 12, '222', '2025-09-24 09:08:16', '2025-09-24 09:08:15', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (36, 55, 12, '111', '2025-09-24 09:11:21', '2025-09-24 09:11:20', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (37, 55, 12, '1111', '2025-09-24 09:11:24', '2025-09-24 09:11:24', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (38, 55, 12, '3123213131', '2025-09-24 09:15:39', '2025-09-24 09:15:38', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (39, 55, 12, '123123


<div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
<img src="/uploads/images/post_1758706622711_769861502.jpg" alt="回复图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
</div>', '2025-09-24 09:37:03', '2025-09-24 09:37:02', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (40, 60, 12, '12312313


<div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
<img src="/uploads/images/post_1758728296654_950044180.jpg" alt="回复图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
</div>', '2025-09-24 15:38:17', '2025-09-24 15:38:16', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (41, 60, 12, '非常好啊


<div class="post-images-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin: 16px 0;">
<img src="/uploads/images/post_1758731390439_516578794.jpg" alt="回复图片 1" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" class="post-image" />
</div>', '2025-09-24 16:29:51', '2025-09-24 16:29:50', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (42, 60, 15, '我觉得行', '2025-09-24 16:30:55', '2025-09-24 16:30:55', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (43, 61, 15, '这人不行！', '2025-09-24 16:32:12', '2025-09-24 16:32:11', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (44, 61, 12, '你曝光我？', '2025-09-24 17:05:20', '2025-09-24 17:05:19', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (45, 61, 12, '来说说
', '2025-09-24 17:05:56', '2025-09-24 17:05:56', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (46, 61, 12, '哈哈哈', '2025-09-24 17:36:10', '2025-09-24 17:36:09', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (47, 61, 12, '真不错', '2025-09-24 17:39:12', '2025-09-24 17:39:11', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (48, 61, 12, '来对线', '2025-09-24 17:42:15', '2025-09-24 17:42:15', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (49, 60, 15, '好啊
', '2025-09-24 17:42:31', '2025-09-24 17:42:31', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (50, 61, 12, '回复 @老k哈哈哈

快来啊', '2025-09-24 17:45:26', '2025-09-24 17:45:25', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (51, 61, 15, '回复 @老k

别搞我哥', '2025-09-24 17:47:41', '2025-09-24 17:47:41', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (52, 63, 15, '3213213213', '2025-09-25 08:37:05', '2025-09-25 08:37:04', 0);
INSERT INTO `forum_replies` (`id`, `post_id`, `author_id`, `content`, `created_at`, `updated_at`, `likes`) VALUES (53, 63, 15, '234324242342', '2025-09-25 08:37:08', '2025-09-25 08:37:08', 0);

-- 表结构: merchant_reviews
DROP TABLE IF EXISTS `merchant_reviews`;
CREATE TABLE `merchant_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `merchant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_merchant` (`merchant_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `merchant_reviews_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `merchant_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `merchant_reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (1, 12, 15, '嗨', 1, '2025-09-18 19:27:04', '2025-09-18 19:36:39');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (2, 15, 12, '你好啊', 1, '2025-09-18 19:36:41', '2025-09-18 19:36:49');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (3, 12, 15, '咋样最近', 1, '2025-09-18 19:36:59', '2025-09-18 19:37:10');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (4, 12, 15, '哈哈哈', 1, '2025-09-18 19:37:17', '2025-09-18 19:40:08');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (5, 15, 12, '还行吧', 1, '2025-09-18 19:39:49', '2025-09-18 19:40:02');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (6, 15, 12, '您的', 1, '2025-09-18 19:39:49', '2025-09-18 19:40:02');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (7, 12, 15, '害', 1, '2025-09-18 19:39:59', '2025-09-18 19:40:08');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (8, 15, 12, '你看呢？', 1, '2025-09-18 19:40:14', '2025-09-18 20:28:24');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (9, 12, 15, '不知道', 1, '2025-09-18 19:44:18', '2025-09-18 20:28:32');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (10, 15, 12, '咋样啊？', 1, '2025-09-18 20:17:07', '2025-09-18 20:28:24');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (11, 12, 15, '不行', 1, '2025-09-18 20:17:29', '2025-09-18 20:28:32');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (12, 15, 12, '哈喽', 1, '2025-09-19 08:23:08', '2025-09-19 08:23:12');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (13, 12, 15, '哈哈哈', 1, '2025-09-25 07:17:52', '2025-09-25 07:18:00');
INSERT INTO `messages` (`id`, `sender_id`, `recipient_id`, `content`, `is_read`, `created_at`, `updated_at`) VALUES (14, 15, 12, '别来无恙', 1, '2025-09-25 07:18:12', '2025-09-25 11:38:32');

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

-- 表结构: posts
DROP TABLE IF EXISTS `posts`;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `user_id` int NOT NULL,
  `views` int DEFAULT '0',
  `likes` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 表结构: replies
DROP TABLE IF EXISTS `replies`;
CREATE TABLE `replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `replies_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 表结构: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int DEFAULT '0',
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'bronze',
  `join_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` datetime DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `roles` json DEFAULT NULL,
  `img` longtext COLLATE utf8mb4_unicode_ci,
  `avatar` longtext COLLATE utf8mb4_unicode_ci,
  `has_uploaded_avatar` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `total_posts` int DEFAULT '0',
  `total_replies` int DEFAULT '0',
  `consecutive_checkins` int DEFAULT '0',
  `last_checkin_date` date DEFAULT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '用户' COMMENT '身份：主播、甲方、服务商、用户等',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_points` (`points`),
  KEY `idx_level` (`level`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 表数据: users
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (1, 'testuser', '123@temp.com', '$2b$10$PiBcBidJYwN/FZh2kKNs9eubf05DsRwLZJ8PwT8jywNXX4O3FpQaS', 25, 'bronze', '2025-09-09 13:48:40', '2025-09-10 13:28:05', 0, '[]', NULL, 'data:image/jpeg;base64,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', 1, '2025-09-09 13:48:40', '2025-09-16 15:19:45', NULL, NULL, 15, 13, 1, '2025-09-15 16:00:00', '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (3, 'newtest', 'newtest@example.com', '$2b$10$xqbzEueCbCtkln9/Y6i9Te3gBH2ebgtNixWTSfNgy29/hdOuCfx7W', 100, 'bronze', '2025-09-09 14:24:00', NULL, 0, '[]', NULL, NULL, 0, '2025-09-09 14:24:00', '2025-09-11 15:51:16', NULL, NULL, 0, 0, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (5, '老k真不错', 'keithwy10309@2925.com', '$2b$10$RFEcOPzZey.jXJk35OtOpuTxFSlcxrXQsIzMtkenhVHNYwTL55FVC', 20, 'bronze', '2025-09-10 10:47:21', '2025-09-10 10:47:21', 0, '[]', NULL, NULL, 0, '2025-09-10 10:47:21', '2025-09-11 15:51:16', NULL, NULL, 0, 0, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (6, 'newuser', 'newuser@example.com', '$2b$10$tB62CsgXBhajU3uZQHs3uu5NvMbNP5exkNWGAaJHhrzV/4nX5dQly', 20, 'bronze', '2025-09-10 11:02:52', '2025-09-10 11:02:52', 0, '[]', NULL, NULL, 0, '2025-09-10 11:02:52', '2025-09-11 15:51:16', 'adfc2c6a94046194c3c90576eb91505bf7d4825b8a3ad07c24ea8fa228f7fcd9', '2025-09-10 12:24:03', 0, 0, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (8, 'admin', 'admin@oldksports.com', '$2b$10$8tr8vrgRdHBJ42lKB92jl.GJd5Sl9xG8MYZFNBZW58hEqqodCIGC2', 1000, 'diamond', '2025-09-09 01:00:54', '2025-09-10 13:35:14', 1, '["service_provider"]', NULL, '', 0, '2025-09-09 01:00:54', '2025-09-24 18:12:24', NULL, NULL, 0, 0, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (9, '老k测试号', 'wuyong552319164@qq.com', '$2b$10$0G2cb83uq7L2KAwDATKD..wP1ce/x5zTWX0UhCTPCc2jNszvCOEg.', 20, 'bronze', '2025-09-10 12:58:56', '2025-09-10 12:58:56', 0, '[]', NULL, NULL, 0, '2025-09-10 12:58:56', '2025-09-11 15:51:16', NULL, NULL, 0, 0, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (10, '老k好样的', 'keithwy10307@2925.com', '$2b$10$PQFMe8U8uNZa.fF7xNRsG.AnwGKvEoocUfI4U1MWLkTXdiQCxRwFW', 0, 'bronze', '2025-09-11 15:37:55', NULL, 0, '[]', NULL, NULL, 0, '2025-09-11 15:37:55', '2025-09-11 15:52:28', NULL, NULL, 0, 0, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (12, '老k', '552319164@qq.com', '$2b$10$Gj3HQWQQ.aAaAKEj/RHNfOV/FoIANN.KI61KddFIBJ7Q7eFVTCd2i', 490, 'bronze', '2025-09-16 15:44:11', NULL, 1, '["other","streamer"]', NULL, 'data:image/jpeg;base64,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', 1, '2025-09-16 15:44:11', '2025-09-25 05:51:06', NULL, NULL, 24, 16, 0, NULL, '用户');
INSERT INTO `users` (`id`, `username`, `email`, `password`, `points`, `level`, `join_date`, `last_login`, `is_admin`, `roles`, `img`, `avatar`, `has_uploaded_avatar`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`, `total_posts`, `total_replies`, `consecutive_checkins`, `last_checkin_date`, `role`) VALUES (15, '老k哈哈哈', 'keithwy10302@2925.com', '$2b$10$FrFeW510raceWOK4lyojx.nyAzz6pliq/fbX0sMBVpgCcGFjpMlQm', 165, 'bronze', '2025-09-18 17:13:50', NULL, 0, '["streamer","service_provider"]', NULL, 'data:image/jpeg;base64,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', 1, '2025-09-18 17:13:50', '2025-09-25 13:26:16', NULL, NULL, 10, 7, 0, NULL, '用户');


SET FOREIGN_KEY_CHECKS = 1;

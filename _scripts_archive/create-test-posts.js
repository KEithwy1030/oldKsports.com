import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'k19941030',
  database: 'old_k_sports'
});

const testPosts = [
  {
    title: '无图片帖子1：今天的比赛分析',
    content: '今天看了一场精彩的足球比赛，双方实力相当，战术布置都很到位。上半场比较沉闷，但下半场突然变得激烈起来，最后时刻的进球真是太精彩了！这种比赛才是真正的足球魅力所在。期待下周的比赛能有更好的表现。',
    category: 'general',
    author: 'TestUser1',
    author_id: 1
  },
  {
    title: '有图片帖子1：我的运动装备分享',
    content: '最近买了一些新的运动装备，效果很不错，分享给大家看看。<img src="/uploads/images/sample1.jpg" alt="运动装备" />这双鞋子穿起来很舒适，适合长跑。',
    category: 'business',
    author: 'TestUser2',
    author_id: 1
  },
  {
    title: '无图片帖子2：关于健身的一些心得体会',
    content: '健身已经坚持了半年多，从最初的不适应到现在的习惯，真的是一个很大的转变。最重要的是要制定合理的计划，不能急于求成。饮食搭配也很关键，蛋白质的摄入要充足，但也不能忽略碳水化合物。每周至少要有三到四次的训练，每次训练时间控制在一小时左右比较合适。',
    category: 'general',
    author: 'TestUser3',
    author_id: 1
  },
  {
    title: '有图片帖子2：今日训练成果展示',
    content: '今天的训练很充实，分享一下训练现场。<img src="/uploads/images/sample2.jpg" alt="训练现场" /><img src="/uploads/images/sample3.jpg" alt="训练设备" />大家一起加油！',
    category: 'general',
    author: 'TestUser4',
    author_id: 1
  }
];

console.log('开始插入测试帖子...');

let completed = 0;

testPosts.forEach((post, index) => {
  const query = `INSERT INTO forum_posts (title, content, category, author, author_id, timestamp, views, likes) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?)`;
  const values = [
    post.title, 
    post.content, 
    post.category, 
    post.author, 
    post.author_id, 
    Math.floor(Math.random() * 100) + 10, // 10-110 views
    Math.floor(Math.random() * 20) + 1    // 1-21 likes
  ];
  
  db.execute(query, values, (err, result) => {
    if (err) {
      console.error(`插入帖子失败 (${post.title}):`, err);
    } else {
      console.log(`✅ 成功插入帖子: ${post.title}`);
    }
    
    completed++;
    if (completed === testPosts.length) {
      console.log('\n🎉 所有测试帖子插入完成！');
      console.log('现在您可以在前端看到4个测试帖子的效果对比了');
      db.end();
    }
  });
});

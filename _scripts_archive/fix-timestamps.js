// 修复localStorage中的无效时间戳
console.log('开始修复时间戳数据...');

// 获取帖子数据
const postsData = localStorage.getItem('oldksports_forum_posts');
if (!postsData) {
  console.log('没有找到帖子数据');
} else {
  const posts = JSON.parse(postsData);
  console.log('找到', posts.length, '个帖子');
  
  let fixedCount = 0;
  const fixedPosts = posts.map((post, index) => {
    // 检查时间戳是否有效
    const currentTimestamp = post.timestamp;
    const date = new Date(currentTimestamp);
    
    if (!currentTimestamp || isNaN(date.getTime())) {
      console.log(`修复帖子 ${index + 1}: "${post.title}" - 原时间戳: ${currentTimestamp}`);
      
      // 使用ID作为时间戳的基础（ID越大越新）
      const baseTime = new Date();
      const idBasedTime = new Date(baseTime.getTime() - (posts.length - index) * 60000); // 每个帖子间隔1分钟
      
      fixedCount++;
      return {
        ...post,
        timestamp: idBasedTime.toISOString()
      };
    }
    
    return post;
  });
  
  // 保存修复后的数据
  localStorage.setItem('oldksports_forum_posts', JSON.stringify(fixedPosts));
  console.log(`修复完成！共修复了 ${fixedCount} 个帖子的时间戳`);
  console.log('修复后的帖子数据:', fixedPosts.map(p => ({
    id: p.id,
    title: p.title,
    timestamp: p.timestamp,
    isValid: !isNaN(new Date(p.timestamp).getTime())
  })));
}

// 刷新页面以应用修复
console.log('请刷新页面以查看修复效果');

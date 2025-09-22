import axios from 'axios';

// 这段代码确保了无论在开发还是生产环境，都能正确读取 API 地址
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

console.log('Current API Base URL:', API_BASE_URL); // 添加这行日志，用于最终验证

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

export default apiClient;
import axios from 'axios';
import { useUserStore } from '../store/user';

const apiClient = axios.create({
  baseURL: '/api', // 所有请求都将以 /api 开头，由 Vite 代理
  timeout: 10000, // 请求超时时间
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    const token = userStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 后端返回的结构体是 { success, code, message, data }
    // 我们只关心 data 部分，或者在失败时关心 message
    if (response.data.success) {
      return response.data;
    } else {
      // 在这里可以进行统一的错误提示，例如使用一个UI库的Message组件
      console.error('API Error:', response.data.message);
      return Promise.reject(new Error(response.data.message || 'Error'));
    }
  },
  (error) => {
    // 处理网络错误等
    console.error('Network Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient; 
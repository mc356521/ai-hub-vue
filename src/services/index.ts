import axios from 'axios';
import { useUserStore } from '../store/user';

const apiClient = axios.create({
  baseURL: '/api',
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
    if (response.data && response.data.success) {
      return response.data.data;
    } 
    
    // 对于登录请求这种 data 在外层的情况，需要特殊处理
    if(response.data.token) {
      return response.data;
    }

    // 如果 success 字段不存在或为 false
    const errorMessage = response.data ? response.data.message : '请求失败且无错误信息';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage || 'Error'));
  },
  (error) => {
    // 处理网络错误等
    console.error('Network Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient; 
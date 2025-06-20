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
    // 后端可能为某些端点返回原始数据（而不是JSON），例如文件下载。
    // Axios可能将其解析为字符串。如果它不是一个对象，则直接返回。
    if (typeof response.data !== 'object' || response.data === null) {
      return response.data;
    }

    // 标准的后端响应结构: { success, code, message, data }
    // 如果存在 'success' 字段，则根据其值进行处理。
    if ('success' in response.data) {
      if (response.data.success) {
        // 成功：解包并返回实际数据
        return response.data.data;
      } else {
        // 失败：使用后端的错误消息拒绝Promise
        const errorMessage = response.data.message || '请求失败但无具体错误信息';
        console.error('API Error:', errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    }
    
    // 对于不遵循标准结构的响应（例如登录、其他服务）
    // 我们假定整个 response.data 是有效负载。
    // 这将处理登录情况（`{token: ...}`）和其他潜在的直接对象响应。
    return response.data;
  },
  (error) => {
    // 处理网络错误等。
    console.error('发生网络错误或非2xx响应:', error);

    // 尝试从服务器响应中提取更具体的错误消息
    const errorMessage = error.response?.data?.message || error.message || '发生未知网络错误';
    return Promise.reject(new Error(errorMessage));
  }
);

// 导出 API 客户端
export default apiClient;

// 导出各个服务
import * as authService from './authService';
import * as courseService from './courseService';
import * as classService from './classService';
import * as semesterService from './semesterService';
import * as learningProgressService from './learningProgressService';

export {
  authService,
  courseService,
  classService,
  semesterService,
  learningProgressService
}; 
import axios from 'axios';

const service = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api', // Set base URL from env variables or default to /api
  timeout: 10000, // Request timeout
});

// Request interceptor
service.interceptors.request.use(
  (config) => {
    // You can add token to headers here if needed
    // const token = useUserStore().token;
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
service.interceptors.response.use(
  (response) => {
    // You can handle response data here
    return response.data;
  },
  (error) => {
    // You can handle global errors here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default service; 
// 通用的API响应体
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// 注册请求体
export interface RegisterRequest {
  username: string;
  password?: string;
  email: string;
  fullName?: string;
  userCode?: string; // 学号或教师编号
  role: 'student' | 'teacher';
}

// 登录请求体
export interface LoginRequest {
  username: string;
  password?: string;
}

// 登录响应数据
export interface LoginResponseData {
  token: string;
  // 可能还有其他用户数据
  [key: string]: any;
} 
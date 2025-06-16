import apiClient from './index';
import type { LoginRequest, RegisterRequest, ApiResponse, LoginResponseData } from '../types/api';

/**
 * 用户登录
 * @param credentials - 登录凭据 (用户名和密码)
 * @returns - 包含 token 的响应数据
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
  return response.data; // 响应拦截器已经处理了外层的 ApiResponse
};

/**
 * 用户注册
 * @param data - 注册所需信息
 * @returns - 空响应
 */
export const register = async (data: RegisterRequest): Promise<void> => {
  await apiClient.post<ApiResponse<void>>('/auth/register', data);
}; 
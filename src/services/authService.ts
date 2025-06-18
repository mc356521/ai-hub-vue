import apiClient from './index';
import type { LoginRequest, RegisterRequest, LoginResponseData } from '../types/api';

/**
 * 用户登录
 * @param credentials - 登录凭据 (用户名和密码)
 * @returns - 包含 token 的响应数据
 */
export const login = (credentials: LoginRequest): Promise<LoginResponseData> => {
  return apiClient.post('/auth/login', credentials);
};

/**
 * 用户注册
 * @param data - 注册所需信息
 * @returns - 空响应
 */
export const register = (data: RegisterRequest): Promise<void> => {
  return apiClient.post('/auth/register', data);
}; 
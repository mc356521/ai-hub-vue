import api from './index';
import type { ApiResponse, ClassesEntity, ClassesRequest } from '@/types/api';

/**
 * 获取教师管理的所有班级信息
 * @returns Promise<ApiResponse<ClassesEntity[]>>
 */
export function getClasses(): Promise<ApiResponse<ClassesEntity[]>> {
  return api.get('/classes/all');
}

/**
 * 创建新班级
 * @param data - 创建班级所需的数据
 * @returns Promise<ApiResponse<any>>
 */
export function createClass(data: ClassesRequest): Promise<ApiResponse<any>> {
  return api.post('/classes', data);
} 
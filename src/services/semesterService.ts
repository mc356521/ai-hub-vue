import api from './index';
import type { ApiResponse, Semester } from '@/types/api';

/**
 * 获取所有学期列表
 * @returns Promise<ApiResponse<Semester[]>>
 */
export function getSemesters(): Promise<ApiResponse<Semester[]>> {
  return api.get('/semesters/all');
} 
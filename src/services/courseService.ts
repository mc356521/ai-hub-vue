import apiClient from './index';
import type { ApiResponse, Courses, CreateCourseRequest } from '../types/api';

/**
 * 获取当前教师的所有课程
 * @returns 课程列表
 */
export const getMyCourses = async (): Promise<Courses[]> => {
  const response = await apiClient.get<ApiResponse<Courses[]>>('/courses/my');
  return response.data;
};

/**
 * 创建一个新课程
 * @param courseData - 新课程的数据
 * @returns 创建成功后的课程对象
 */
export const createCourse = async (courseData: CreateCourseRequest): Promise<Courses> => {
    const response = await apiClient.post<ApiResponse<Courses>>('/courses', courseData);
    return response.data;
}; 
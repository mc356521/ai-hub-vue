import apiClient from './index';
import type { Courses, CreateCourseRequest } from '../types/api';

/**
 * 获取当前教师的所有课程
 * @returns 课程列表
 */
export const getMyCourses = (): Promise<Courses[]> => {
  return apiClient.get('/courses/my');
};

/**
 * 创建一个新课程
 * @param courseData - 新课程的数据
 * @returns 创建成功后的课程对象
 */
export const createCourse = (courseData: CreateCourseRequest): Promise<Courses> => {
    return apiClient.post('/courses', courseData);
}; 
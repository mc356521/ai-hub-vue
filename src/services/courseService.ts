import apiClient from './index';
import type { Courses, CreateCourseRequest } from '../types/api';

/**
 * 获取当前教师的所有课程
 * @returns 课程列表
 */
export const getMyCourses = (): Promise<Courses[]> => {
  return apiClient.get('/api/courses/my');
};

/**
 * 创建一个新课程
 * @param courseData - 新课程的数据
 * @returns 创建成功后的课程对象
 */
export const createCourse = (courseData: CreateCourseRequest): Promise<Courses> => {
    return apiClient.post('/api/courses', courseData);
};

/**
 * 获取指定课程的Markdown原文
 * @param courseId - 课程ID
 * @returns 课程内容的字符串
 */
export const getCourseContent = (courseId: number): Promise<string> => {
  return apiClient.get(`/api/courses/${courseId}/content`);
};

/**
 * 更新指定课程的Markdown原文
 * @param courseId - 课程ID
 * @param content - 新的Markdown内容
 * @returns 更新结果
 */
export const updateCourseContent = (courseId: number, content: string): Promise<any> => {
  return apiClient.put(`/api/courses/${courseId}/content`, content, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}; 
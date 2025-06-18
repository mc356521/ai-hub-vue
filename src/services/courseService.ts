import api from './index';
import type { Courses, CreateCourseRequest, ApiResponse, StudentCourse } from '@/types/api';

/**
 * 获取当前教师的课程列表
 */
export function getMyCourses(): Promise<Courses[]> {
  return api.get('/courses/my');
}

/**
 * 创建新课程
 * @param data - 创建课程所需的数据
 * @returns Promise<Courses>
 */
export function createCourse(data: CreateCourseRequest): Promise<Courses> {
  return api.post('/courses', data);
}

/**
 * 根据ID获取课程基本信息
 * @param courseId 课程ID
 */
export function getCourseById(courseId: number): Promise<Courses> {
  return api.get(`/courses/${courseId}`);
}

/**
 * 获取课程内容
 * @param courseId 课程ID
 * @returns 课程的Markdown内容
 */
export const getCourseContent = async (courseId: number): Promise<string> => {
  const content = await api.get(`/courses/${courseId}/content`);
  return content as unknown as string;
};

/**
 * 更新课程内容
 * @param courseId 课程ID
 * @param content 课程的Markdown内容
 */
export const updateCourseContent = async (courseId: number, content: string): Promise<void> => {
  await api.put(`/courses/${courseId}/content`, content, {
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8'
    }
  });
};

/**
 * 获取当前学生的课程列表
 */
export function getMyStudentCourses(): Promise<StudentCourse[]> {
  return api.get('/courses/my-student');
} 
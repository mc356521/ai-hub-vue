import api from './index';
import type { 
  Courses, 
  CourseProgressNode, 
  CreateCourseRequest, 
  StudentCourse
} from '@/types/api';

// --- General Course Services ---

/**
 * 获取当前教师的课程列表
 */
export function getMyCourses(): Promise<Courses[]> {
  return api.get('/courses/my');
}

/**
 * 根据ID获取课程基本信息
 * @param courseId 课程ID
 */
export function getCourseById(id: number): Promise<Courses> {
  return api.get(`/courses/${id}`);
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

export function getCourseProgress(id: number): Promise<CourseProgressNode[]> {
  return api.get(`/courses/${id}/progress`);
}

export function getCourseOutline(courseId: number): Promise<any> {
  return api.get(`/courses/${courseId}/outline`);
}

export function updateCourseOutline(courseId: number, content: string): Promise<void> {
  return api.put(`/courses/${courseId}/outline`, content, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

export function getAllCourses(): Promise<Courses[]> {
  return api.get('/courses');
}

// --- Teacher-Specific Services ---

export function getMyTeacherCourses(): Promise<any[]> {
  return api.get('/courses/my-teacher');
}

export function createCourse(data: CreateCourseRequest): Promise<Courses> {
  return api.post('/courses', data);
}

// --- Student-Specific Services ---

/**
 * 获取当前学生的课程列表
 */
export function getMyStudentCourses(): Promise<StudentCourse[]> {
  return api.get('/courses/my-student');
}

/*
 * 获取章节详情内容
 * @param courseId 课程ID
 * @param chapterKey 章节Key
 * @returns 章节详情数据
 */
// export function getChapterDetail(courseId: number, chapterKey: string): Promise<{ chapter: CourseProgressNode }> {
//  return api.get(`/courses/${courseId}/chapters/${chapterKey}`);
// } 
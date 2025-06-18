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

// 课程对象
export interface Courses {
  id: number;
  createTime: string;
  updateTime: string;
  deleted: number;
  title: string;
  description: string;
  teacherId: number;
  filePath: string;
  fileHash: string;
  fileUpdatedAt: string;
  parseStatus: string;
  parseError: string;
  parsedAt: string;
  chapterCount: number;
}

// 创建课程请求体
export interface CreateCourseRequest {
  title: string;
  description?: string;
}

export interface ClassesEntity {
  id: number;
  name: string;
  teacherId?: number;
  courseId?: number;
  semesterId?: number;
  classCode?: string;
  status: 'pending' | 'active' | 'finished' | 'archived';
  createTime: string;
  updateTime?: string;
  deleted?: boolean;
}

export interface MyClassInfo {
  id: number;
  name: string;
  teacherId: number;
  courseId: number;
  semesterId: number;
  classCode: string;
  status: 'pending' | 'active' | 'finished' | 'archived';
  createTime: string;
  updateTime: string;
  deleted: boolean;
}

export interface UserInfo {
    id: number;
    username: string;
    email?: string;
}

export interface CourseInfo {
  id: number;
  title: string;
  description: string;
}

export interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'current' | 'past' | 'future';
}

export interface ClassesRequest {
  id?: number;
  name: string;
  courseId?: number;
  semesterId: string;
  status: 'pending' | 'active' | 'finished' | 'archived';
}

/**
 * @interface StudentCourse
 * @description 学生"我的课程"页面API返回的课程信息结构
 */
export interface StudentCourse {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  teacherName: string;
  teacherAvatar: string | null;
  classStatus: 'pending' | 'active' | 'finished' | 'archived';
  classId: number;
  className: string;
}

/**
 * @interface CourseCardData
 * @description 我的课程页面中，用于UI展示的课程卡片数据结构
 */
export interface CourseCardData {
  id: number;
  name:string;
  description: string;
  teacher: {
    name: string;
    avatar: string;
  };
  status: 'in-progress' | 'completed' | 'not-started' | 'pending';
  progress: number;
  gradientClass: string;
  progressBarClass: string;
  icon: any;
}

// --- Course Detail Page Types ---

export type LessonStatus = 'completed' | 'inprogress' | 'locked' | 'new';

export interface Lesson {
  id: string;
  title: string;
  type: 'document' | 'video';
  duration: string;
  status: LessonStatus;
  content: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseDetails {
  title: string;
  subtitle: string;
  chapters: Chapter[];
} 
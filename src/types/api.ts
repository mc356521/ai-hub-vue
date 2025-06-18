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
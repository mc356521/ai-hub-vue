import axios from 'axios';
import { useUserStore } from '@/store/user';
import apiClient from './index';

/**
 * 学习进度状态枚举
 */
export enum LearningStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * 学习进度记录接口
 */
export interface LearningProgress {
  id?: number;
  userId: string; // 用户标识
  courseId: number;
  chapterKey: string;
  status: LearningStatus;
  progressPercentage: number;
  readingTimeSeconds: number;
  lastReadPosition?: number;
  firstVisitTime?: string;
  lastVisitTime?: string;
  completionTime?: string;
}

/**
 * 更新学习进度的请求参数
 */
export interface UpdateProgressParams {
  courseId: number;
  chapterKey: string;
  status?: LearningStatus;
  progressPercentage?: number;
  readingTimeSeconds?: number;
  lastReadPosition?: number;
  isCompleted?: boolean;
}

/**
 * 获取用户在特定课程中的所有章节学习进度
 * @param courseId 课程ID
 * @returns 学习进度记录数组
 */
export async function getCourseProgress(courseId: number): Promise<LearningProgress[]> {
  const userStore = useUserStore();
  
  if (!userStore.isLoggedIn) {
    throw new Error('用户未登录');
  }
  
  try {
    // 后端会从token中获取当前用户信息，不需要传递userId
    const response = await apiClient.get('/learning-progress', {
      params: { courseId }
    });
    return response as unknown as LearningProgress[];
  } catch (error) {
    console.error('获取学习进度失败:', error);
    throw error;
  }
}

/**
 * 获取用户在特定章节的学习进度
 * @param courseId 课程ID
 * @param chapterKey 章节标识
 * @returns 学习进度记录
 */
export async function getChapterProgress(courseId: number, chapterKey: string): Promise<LearningProgress | null> {
  const userStore = useUserStore();
  
  if (!userStore.isLoggedIn) {
    throw new Error('用户未登录');
  }
  
  try {
    // 后端会从token中获取当前用户信息，不需要传递userId
    const response = await apiClient.get('/learning-progress/chapter', {
      params: { courseId, chapterKey }
    });
    return response as unknown as LearningProgress;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // 章节进度不存在
    }
    console.error('获取章节进度失败:', error);
    throw error;
  }
}

/**
 * 更新学习进度
 * @param params 更新参数
 * @returns 更新后的学习进度记录
 */
export async function updateProgress(params: UpdateProgressParams): Promise<LearningProgress> {
  const userStore = useUserStore();
  
  if (!userStore.isLoggedIn) {
    throw new Error('用户未登录');
  }
  
  try {
    // 后端会从token中获取当前用户信息，不需要传递userId
    const response = await apiClient.post('/learning-progress/update', params);
    return response as unknown as LearningProgress;
  } catch (error) {
    console.error('更新学习进度失败:', error);
    throw error;
  }
}

/**
 * 批量更新学习进度（用于离线同步）
 * @param progressRecords 进度记录数组
 * @returns 更新结果
 */
export async function batchUpdateProgress(progressRecords: UpdateProgressParams[]): Promise<{ success: boolean }> {
  const userStore = useUserStore();
  
  if (!userStore.isLoggedIn) {
    throw new Error('用户未登录');
  }
  
  try {
    // 后端会从token中获取当前用户信息，不需要传递userId
    const response = await apiClient.post('/learning-progress/batch-update', {
      progressRecords
    });
    return response as unknown as { success: boolean };
  } catch (error) {
    console.error('批量更新学习进度失败:', error);
    throw error;
  }
}

/**
 * 标记章节为已完成
 * @param courseId 课程ID
 * @param chapterKey 章节标识
 * @returns 更新后的学习进度记录
 */
export async function markChapterCompleted(courseId: number, chapterKey: string): Promise<LearningProgress> {
  return updateProgress({
    courseId,
    chapterKey,
    status: LearningStatus.COMPLETED,
    progressPercentage: 100,
    isCompleted: true
  });
} 
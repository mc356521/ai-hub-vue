import axios from 'axios';
import { useUserStore } from '@/store/user';

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
  userId: number;
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
  const userId = userStore.user?.id;
  
  if (!userId) {
    throw new Error('用户未登录');
  }
  
  try {
    const response = await axios.get(`/learning-progress`, {
      params: { userId, courseId }
    });
    return response.data;
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
  const userId = userStore.user?.id;
  
  if (!userId) {
    throw new Error('用户未登录');
  }
  
  try {
    const response = await axios.get(`/learning-progress/chapter`, {
      params: { userId, courseId, chapterKey }
    });
    return response.data;
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
  const userId = userStore.user?.id;
  
  if (!userId) {
    throw new Error('用户未登录');
  }
  
  try {
    const response = await axios.post(`/learning-progress/update`, {
      userId,
      ...params
    });
    return response.data;
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
  const userId = userStore.user?.id;
  
  if (!userId) {
    throw new Error('用户未登录');
  }
  
  try {
    const response = await axios.post(`/learning-progress/batch-update`, {
      userId,
      progressRecords
    });
    return response.data;
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
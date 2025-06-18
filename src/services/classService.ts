import api from './index';
import type { ClassesEntity, ClassesRequest, MyClassInfo } from '@/types/api';

/**
 * 获取教师管理的所有班级信息
 * @returns Promise<ClassesEntity[]>
 */
export function getClasses(): Promise<ClassesEntity[]> {
  return api.get('/classes/all');
}

/**
 * 获取当前登录的教师用户下，处于指定状态的所有班级列表
 * @param status The status of the classes to fetch
 * @returns A promise that resolves to an array of class information
 */
export function getMyClasses(status: 'pending' | 'active' | 'finished' | 'archived'): Promise<MyClassInfo[]> {
  return api.get('/classes/my', {
    params: {
      status
    }
  });
}

/**
 * 创建新班级
 * @param data - 创建班级所需的数据
 * @returns Promise<any>
 */
export function createClass(data: ClassesRequest): Promise<any> {
  return api.post('/classes', data);
} 
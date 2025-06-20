import { ref, watch, onMounted, onUnmounted, Ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store/user';
import { 
  getChapterProgress, 
  updateProgress, 
  LearningStatus,
  LearningProgress
} from '@/services/learningProgressService';
import type { NestedOutlineItem } from './useMarkdownProcessor';

// 章节映射类型，用于存储章节ID到章节键的映射
interface ChapterMapping {
  [id: string]: {
    key: string;
    title: string;
    level: number;
  };
}

/**
 * 学习进度跟踪组合式函数
 * @param courseId 课程ID
 * @param outline 课程大纲
 * @param activeAnchorId 当前活跃的锚点ID
 * @returns 学习进度相关的状态和方法
 */
export function useLearningProgress(
  courseId: Ref<number>,
  outline: Ref<NestedOutlineItem[]>,
  activeAnchorId: Ref<string | null>
) {
  const route = useRoute();
  const userStore = useUserStore();
  
  // 学习进度状态
  const currentProgress = ref<LearningProgress | null>(null);
  const readingStartTime = ref<number>(Date.now());
  const readingTimeSeconds = ref<number>(0);
  const isTrackingEnabled = ref<boolean>(true);
  const chapterMapping = ref<ChapterMapping>({});
  const currentChapterKey = ref<string | null>(null);
  const progressUpdateQueue = ref<Array<{ chapterKey: string, seconds: number }>>([]);
  
  // 定期更新计时器
  let progressUpdateInterval: number | null = null;
  
  // 构建章节ID到章节键的映射
  const buildChapterMapping = (items: NestedOutlineItem[], parentKey: string = '') => {
    items.forEach((item, index) => {
      // 生成章节键，例如: "1", "1.1", "1.1.2"
      const key = parentKey ? `${parentKey}.${index + 1}` : `${index + 1}`;
      
      // 存储映射
      chapterMapping.value[item.id] = {
        key,
        title: item.content,
        level: item.level
      };
      
      // 递归处理子章节
      if (item.children && item.children.length > 0) {
        buildChapterMapping(item.children, key);
      }
    });
  };
  
  // 获取当前章节的学习进度
  const fetchCurrentProgress = async (chapterKey: string) => {
    if (!courseId.value || !userStore.isLoggedIn) return;
    
    try {
      const progress = await getChapterProgress(courseId.value, chapterKey);
      if (progress) {
        currentProgress.value = progress;
        readingTimeSeconds.value = progress.readingTimeSeconds || 0;
      } else {
        // 如果没有进度记录，创建一个新的
        currentProgress.value = {
          courseId: courseId.value,
          chapterKey,
          status: LearningStatus.IN_PROGRESS,
          progressPercentage: 0,
          readingTimeSeconds: 0,
          userId: '' // 后端会自动填充，这里只是为了满足类型要求
        };
      }
    } catch (error) {
      console.error('获取章节进度失败:', error);
    }
  };
  
  // 更新学习进度
  const updateReadingProgress = async (force: boolean = false) => {
    if (!isTrackingEnabled.value || !currentChapterKey.value || !courseId.value) return;
    
    // 计算阅读时间增量
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - readingStartTime.value) / 1000);
    readingStartTime.value = now;
    
    if (elapsedSeconds <= 0 && !force) return;
    
    // 累计阅读时间 (仅用于前端显示)
    readingTimeSeconds.value += elapsedSeconds;
    
    // 将更新添加到队列
    progressUpdateQueue.value.push({
      chapterKey: currentChapterKey.value,
      seconds: elapsedSeconds
    });
    
    // 如果强制更新或队列长度达到阈值，执行更新
    if (force || progressUpdateQueue.value.length >= 3) {
      try {
        // 合并相同章节的时间
        const mergedUpdates: Record<string, number> = {};
        progressUpdateQueue.value.forEach(item => {
          mergedUpdates[item.chapterKey] = (mergedUpdates[item.chapterKey] || 0) + item.seconds;
        });
        
        // 更新当前章节的进度
        if (mergedUpdates[currentChapterKey.value]) {
          // 只发送增量时间，而不是累计时间
          const incrementalTime = mergedUpdates[currentChapterKey.value];
          await updateProgress({
            courseId: courseId.value,
            chapterKey: currentChapterKey.value,
            readingTimeSeconds: incrementalTime, // 只发送增量时间
            status: LearningStatus.IN_PROGRESS,
            // 如果阅读时间超过30秒，视为有进度
            progressPercentage: readingTimeSeconds.value > 30 ? 50 : 10
          });
        }
        
        // 清空队列
        progressUpdateQueue.value = [];
      } catch (error) {
        console.error('更新学习进度失败:', error);
      }
    }
  };
  
  // 标记章节为已完成
  const markChapterAsCompleted = async () => {
    if (!currentChapterKey.value || !courseId.value) return;
    
    try {
      // 先确保最新的阅读时间已更新
      await updateReadingProgress(true);
      
      // 然后标记为已完成
      await updateProgress({
        courseId: courseId.value,
        chapterKey: currentChapterKey.value,
        status: LearningStatus.COMPLETED,
        progressPercentage: 100,
        isCompleted: true
      });
    } catch (error) {
      console.error('标记章节完成失败:', error);
    }
  };
  
  // 监听活跃锚点ID的变化
  watch(activeAnchorId, async (newId) => {
    if (!newId || !chapterMapping.value[newId]) return;
    
    // 如果章节变化，先保存当前章节的进度
    if (currentChapterKey.value && currentChapterKey.value !== chapterMapping.value[newId].key) {
      await updateReadingProgress(true);
    }
    
    // 更新当前章节
    currentChapterKey.value = chapterMapping.value[newId].key;
    
    // 获取新章节的进度
    await fetchCurrentProgress(currentChapterKey.value);
    
    // 重置阅读开始时间
    readingStartTime.value = Date.now();
  });
  
  // 监听大纲变化，重建章节映射
  watch(outline, (newOutline) => {
    if (newOutline && newOutline.length > 0) {
      chapterMapping.value = {};
      buildChapterMapping(newOutline);
    }
  }, { immediate: true });
  
  // 组件挂载时设置定期更新
  onMounted(() => {
    // 每60秒更新一次进度
    progressUpdateInterval = window.setInterval(() => {
      updateReadingProgress();
    }, 60000);
  });
  
  // 组件卸载时清理
  onUnmounted(() => {
    // 保存最终进度
    updateReadingProgress(true);
    
    // 清除定时器
    if (progressUpdateInterval) {
      clearInterval(progressUpdateInterval);
    }
  });
  
  return {
    currentProgress,
    readingTimeSeconds,
    isTrackingEnabled,
    currentChapterKey,
    markChapterAsCompleted,
    // 暴露这些方法以便外部调用
    updateReadingProgress,
    toggleTracking: (enabled: boolean) => {
      isTrackingEnabled.value = enabled;
    }
  };
} 
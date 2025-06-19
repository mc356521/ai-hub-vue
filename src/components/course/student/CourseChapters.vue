<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Main content: Markdown preview -->
    <div class="md:col-span-3 relative">
      <div
        ref="contentPanel"
        class="prose max-w-none overflow-y-auto"
        v-html="renderedHtml"
            ></div>
      
      <!-- 学习进度浮动指示器 -->
      <div class="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 flex items-center gap-3 z-10">
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">当前阅读章节</span>
          <span class="font-medium">{{ currentChapterTitle }}</span>
        </div>
        <div class="h-10 w-px bg-gray-200"></div>
        <div class="flex flex-col">
          <span class="text-sm text-gray-500">阅读时长</span>
          <span class="font-medium">{{ formatReadingTime }}</span>
        </div>
        <button 
          @click="markChapterAsCompleted"
          class="ml-2 py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
        >
          标记完成
        </button>
        <!-- 调试按钮 -->
        <button 
          @click="debugProgress"
          class="ml-2 py-1 px-3 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
        >
          调试进度
        </button>
      </div>
    </div>

    <!-- Right sidebar: Course directory -->
    <div class="md:col-span-1">
      <CourseDirectory
        ref="outlinePanel"
        :outline="outline"
        :active-anchor-id="activeAnchorId"
        :chapter-progress="chapterProgressMap"
        @scroll-to-anchor="scrollToAnchor"
      />
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted, PropType } from 'vue';
import { useRoute } from 'vue-router';
import {
  useCourseContent,
  useMarkdownProcessor,
  useScrollSync,
} from '@/composables';
import { useLearningProgress } from '@/composables/useLearningProgress';
// @ts-ignore
import CourseDirectory from './CourseDirectory.vue';
import type { NestedOutlineItem } from '@/composables';
import { LearningStatus } from '@/services/learningProgressService';

// --- Component Refs ---
const contentPanel = ref<HTMLElement | null>(null);
const outlinePanel = ref<{ outlinePanel: HTMLElement | null } | null>(null);

// --- Props ---
const props = defineProps({
  course: {
    type: Object,
    default: () => ({})
  },
  learningProgress: {
    type: Array,
    default: () => []
  }
});

// --- Get Course ID from route ---
const route = useRoute();
const courseId = computed(() => props.course?.id || Number(route.params.id));

// --- Composables ---
const onContentLoaded = async () => {
  parseOutline();
  await nextTick();
  updateAnchorElements();
  setupPreviewScroll();
  
  // 打印大纲信息
  console.log('大纲结构:', outline.value);
  
  // 确保锚点元素被正确处理
  setTimeout(() => {
    updateAnchorElements();
    console.log('延迟更新锚点元素');
  }, 500);
};

const { markdownContent } = useCourseContent(courseId, onContentLoaded);
const { outline, renderedHtml, parseOutline } = useMarkdownProcessor(markdownContent);
const {
  activeAnchorId,
  updateAnchorElements,
  scrollToAnchor,
  setupPreviewScroll,
} = useScrollSync(
  outline,
  ref(false), // isEditing is always false for students
  contentPanel,
  ref(null), // no editor panel for students
  computed(() => outlinePanel.value?.outlinePanel || null),
  { useWindowScroll: true } // Use window scroll for student view
);

// --- 学习进度跟踪 ---
const {
  currentProgress,
  readingTimeSeconds,
  currentChapterKey,
  markChapterAsCompleted,
  updateReadingProgress
} = useLearningProgress(courseId, outline, activeAnchorId);

// 当前章节标题
const currentChapterTitle = computed(() => {
  if (!currentChapterKey.value || !outline.value) return '未知章节';
  
  // 递归查找章节标题
  const findChapterTitle = (items: NestedOutlineItem[], key: string): string => {
    for (const item of items) {
      // 如果找到匹配的章节
      if (item.id === activeAnchorId.value) {
        return item.content;
      }
      // 递归查找子章节
      if (item.children && item.children.length > 0) {
        const result = findChapterTitle(item.children, key);
        if (result !== '未知章节') return result;
      }
    }
    return '未知章节';
  };
  
  return findChapterTitle(outline.value, currentChapterKey.value);
});

// 格式化阅读时间
const formatReadingTime = computed(() => {
  const minutes = Math.floor(readingTimeSeconds.value / 60);
  const seconds = readingTimeSeconds.value % 60;
  return `${minutes}分${seconds}秒`;
});

// 章节进度映射，用于在目录中显示进度状态
const chapterProgressMap = ref<Record<string, LearningStatus>>({});

// 查找最佳匹配的ID
const findBestMatchingId = (items: NestedOutlineItem[], chapter: any): string | null => {
  // 简化版匹配逻辑，避免类型错误
  let bestMatchId: string | null = null;
  let bestScore = 0;
  
  // 递归查找
  const searchItems = (items: NestedOutlineItem[]) => {
    for (const item of items) {
      let score = 0;
      
      // 标题匹配
      if (chapter.title && item.content) {
        const title1 = item.content.toLowerCase().trim();
        const title2 = chapter.title.toLowerCase().trim();
        
        if (title1 === title2) {
          score += 100; // 完全匹配
        } else if (title1.includes(title2) || title2.includes(title1)) {
          score += 50;  // 部分匹配
        }
      }
      
      // 更新最佳匹配
      if (score > bestScore) {
        bestScore = score;
        bestMatchId = item.id;
        console.log(`找到匹配: ${item.id}, 分数: ${score}`);
      }
      
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        searchItems(item.children);
      }
    }
  };
  
  searchItems(items);
  return bestMatchId;
};

// 处理学习进度数据
watch(() => props.learningProgress, (newProgress) => {
  if (!newProgress || newProgress.length === 0) {
    console.log('没有学习进度数据');
    return;
  }
  
  console.log('收到学习进度数据:', newProgress);
  
  // 将学习进度数据转换为章节ID到状态的映射
  const progressMap: Record<string, LearningStatus> = {};
  
  // 构建标题到ID的映射和章节键到ID的映射
  const titleToIdMap: Record<string, string> = {};
  const keyToIdMap: Record<string, string> = {};
  
  // 递归构建映射
  const buildMappings = (items: NestedOutlineItem[], level: number = 1, parentKey: string = '') => {
    items.forEach((item, index) => {
      const normalizedTitle = item.content.toLowerCase().trim();
      titleToIdMap[normalizedTitle] = item.id;
      
      // 生成章节键 (1, 1.1, 1.2, etc.)
      const chapterKey = parentKey ? `${parentKey}.${index + 1}` : `${index + 1}`;
      keyToIdMap[chapterKey] = item.id;
      
      // 特殊处理: 顶级标题使用简单的数字作为键
      if (level === 1 && parentKey === '') {
        keyToIdMap[`${index + 1}`] = item.id;
      }
      
      // 从标题中提取数字部分作为键
      const titleNumbers = item.content.match(/(\d+(\.\d+)*)/);
      if (titleNumbers && titleNumbers[1]) {
        keyToIdMap[titleNumbers[1]] = item.id;
        console.log(`从标题提取的数字键: ${titleNumbers[1]} -> ${item.id}`);
      }
      
      // 处理子节点
      if (item.children && item.children.length > 0) {
        buildMappings(item.children, level + 1, chapterKey);
      }
    });
  };
  
  // 如果大纲存在，构建映射
  if (outline.value && outline.value.length > 0) {
    buildMappings(outline.value);
    console.log('标题到ID的映射:', titleToIdMap);
    console.log('章节键到ID的映射:', keyToIdMap);
  }
  
  // 递归处理章节树，提取状态信息
  const processChapterTree = (chapters: any[]) => {
    if (!chapters || !Array.isArray(chapters)) return;
    
    chapters.forEach(chapter => {
      // 查找对应的章节ID
      if (outline.value) {
        console.log('处理章节:', chapter.chapterKey, chapter.title, chapter.status);
        
        let chapterId = null;
        
        // 1. 首先尝试通过章节键直接匹配
        if (chapter.chapterKey && keyToIdMap[chapter.chapterKey]) {
          chapterId = keyToIdMap[chapter.chapterKey];
          console.log('通过章节键直接匹配到ID:', chapterId);
        }
        // 2. 尝试通过标题匹配
        else if (chapter.title) {
          const normalizedTitle = chapter.title.toLowerCase().trim();
          if (titleToIdMap[normalizedTitle]) {
            chapterId = titleToIdMap[normalizedTitle];
            console.log('通过标题匹配到ID:', chapterId);
          }
        }
        
        // 3. 如果前两种方式都失败，尝试模糊匹配
        if (!chapterId) {
          chapterId = findBestMatchingId(outline.value, chapter);
        }
        
        // 设置章节进度
        if (chapterId && chapter.status) {
          console.log('设置章节进度:', chapterId, chapter.status);
          progressMap[chapterId] = chapter.status as LearningStatus;
        } else if (!chapterId) {
          console.log('未找到匹配的章节ID:', chapter.chapterKey);
        }
      }
      
      // 递归处理子章节
      if (chapter.children && Array.isArray(chapter.children)) {
        processChapterTree(chapter.children);
      }
    });
  };
  
  // 处理章节树
  processChapterTree(newProgress);
  
  console.log('最终章节进度映射:', progressMap);
  
  // 更新章节进度映射
  chapterProgressMap.value = progressMap;
}, { immediate: true, deep: true });

// 定期更新学习进度
let updateInterval: number | null = null;

onMounted(() => {
  // 每5分钟更新一次学习进度
  updateInterval = window.setInterval(() => {
    updateReadingProgress(true);
  }, 5 * 60 * 1000);
  
  // 打印学习进度数据
  console.log('组件挂载时的学习进度数据:', props.learningProgress);
  
  // 延迟初始化进度
  setTimeout(() => {
    initializeProgress();
  }, 1000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
  }
});

// 调试按钮
const debugProgress = () => {
  // 实现调试逻辑
  console.log('调试进度');
  console.log('大纲结构:', outline.value);
  console.log('学习进度数据:', props.learningProgress);
  console.log('章节进度映射:', chapterProgressMap.value);
  
  // 手动创建进度映射
  if (outline.value && outline.value.length > 0) {
    const manualProgressMap: Record<string, LearningStatus> = {};
    
    // 递归设置所有章节的进度
    const setAllProgress = (items: NestedOutlineItem[]) => {
      items.forEach(item => {
        manualProgressMap[item.id] = LearningStatus.IN_PROGRESS;
        
        if (item.children && item.children.length > 0) {
          setAllProgress(item.children);
        }
      });
    };
    
    setAllProgress(outline.value);
    console.log('手动创建的进度映射:', manualProgressMap);
    
    // 应用手动创建的进度映射
    chapterProgressMap.value = manualProgressMap;
  }
};

// 初始化进度
const initializeProgress = () => {
  console.log('初始化进度...');
  
  // 如果进度映射为空，尝试手动初始化
  if (Object.keys(chapterProgressMap.value).length === 0 && outline.value) {
    console.log('进度映射为空，手动初始化');
    
    // 从学习进度数据中提取状态
    const statusMap: Record<string, LearningStatus> = {};
    
    // 递归处理学习进度数据
    const extractStatus = (chapters: any[]) => {
      if (!chapters || !Array.isArray(chapters)) return;
      
      chapters.forEach(chapter => {
        if (chapter.title && chapter.status) {
          statusMap[chapter.title.toLowerCase().trim()] = chapter.status as LearningStatus;
        }
        
        if (chapter.children && Array.isArray(chapter.children)) {
          extractStatus(chapter.children);
        }
      });
    };
    
    // 处理学习进度数据
    if (props.learningProgress && props.learningProgress.length > 0) {
      extractStatus(props.learningProgress);
    }
    
    console.log('提取的状态映射:', statusMap);
    
    // 应用状态到大纲
    const applyStatus = (items: NestedOutlineItem[]) => {
      items.forEach(item => {
        const normalizedTitle = item.content.toLowerCase().trim();
        
        if (statusMap[normalizedTitle]) {
          chapterProgressMap.value[item.id] = statusMap[normalizedTitle];
          console.log(`应用状态: ${item.id} -> ${statusMap[normalizedTitle]}`);
        } else {
          // 默认设置为进行中
          chapterProgressMap.value[item.id] = LearningStatus.IN_PROGRESS;
        }
        
        if (item.children && item.children.length > 0) {
          applyStatus(item.children);
        }
      });
    };
    
    applyStatus(outline.value);
    console.log('初始化后的进度映射:', chapterProgressMap.value);
  }
};
</script>

<style>
/* Basic styling for rendered markdown content */
.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
  scroll-margin-top: 2rem; /* Offset for scroll spy */
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
}
.prose h1 { font-size: 1.5rem; }
.prose h2 { font-size: 1.25rem; }
.prose h3 { font-size: 1.1rem; }
.prose p, .prose ul, .prose ol, .prose pre {
  margin-bottom: 1em;
}
.prose code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}
.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
}
.prose pre code {
  background-color: transparent;
  padding: 0;
}
.prose a {
  color: #3b82f6;
  text-decoration: none;
}
.prose a:hover {
  text-decoration: underline;
}
.prose ul {
  list-style-type: disc;
  padding-left: 1.5em;
}
</style>
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <!-- 左栏：课程大纲 -->
    <div class="md:col-span-1 lg:col-span-1">
      <CourseOutline
        ref="outlineComponent"
        :outline="outline"
        :active-anchor-id="activeAnchorId"
        :expanded-chapters="expandedChapters"
        @scroll-to-anchor="scrollToAnchor"
        @toggle-chapter="toggleChapter"
        @toggle-all="toggleAllChapters"
        @add-chapter="handleAddChapter"
      />
    </div>

    <!-- 中栏：内容编辑器/预览器 -->
    <div class="md:col-span-2 lg:col-span-2">
      <CourseContent
        ref="contentComponent"
        v-model="editableContent"
        :rendered-html="renderedHtml"
        :is-editing="isEditing"
        :is-saving="isSaving"
        @edit="handleEdit"
        @save="handleSave"
        @cancel="handleCancel"
      />
    </div>

    <!-- 右栏：AI 助手 -->
    <div class="md:col-span-3 lg:col-span-1">
      <CourseAIAssistant />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, toRefs } from 'vue';
import { 
  useCourseContent,
  useMarkdownProcessor,
  useScrollSync,
} from '@/composables';
import CourseOutline from './CourseOutline.vue';
import CourseContent from './CourseContent.vue';
import CourseAIAssistant from './CourseAIAssistant.vue';
import type { NestedOutlineItem } from '@/composables';

// --- 组件 props 定义 ---
const props = defineProps<{
  courseId: number | null; // 从父组件传入的课程ID
}>();

const { courseId } = toRefs(props);

// --- 本地响应式状态 ---
const isEditing = ref(false); // 是否处于编辑模式
const expandedChapters = ref<Set<string>>(new Set()); // 存储已展开的章节ID

// --- 子组件引用 ---
const outlineComponent = ref<{ outlinePanel: HTMLElement | null } | null>(null);
const contentComponent = ref<{ previewPanel: HTMLElement | null; editorPanel: HTMLTextAreaElement | null } | null>(null);

// --- COMPOSABLES ---

// 定义一个在课程内容加载或更新后执行的回调函数
const onContentLoaded = async () => {
  parseOutline(); // 重新解析大纲
  await nextTick(); // 等待 DOM 更新
  updateAnchorElements(); // 更新滚动同步所需的锚点元素
  setupPreviewScroll(); // 设置预览区的滚动监听

  // 递归展开所有层级的章节
  const expandAllNodes = (items: NestedOutlineItem[]) => {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        expandedChapters.value.add(item.id); // 添加当前节点到已展开集合
        expandAllNodes(item.children); // 递归展开子节点
      }
    });
  };
  
  // 展开所有章节
  expandAllNodes(outline.value);
};

// 课程内容管理 Composable
const { markdownContent, editableContent, isSaving, saveContent } = useCourseContent(courseId, onContentLoaded);
// Markdown 处理 Composable
const { outline, renderedHtml, parseOutline } = useMarkdownProcessor(markdownContent);

// 通过计算属性动态获取子组件的 DOM 元素引用
const previewPanel = computed(() => contentComponent.value?.previewPanel || null);
const editorPanel = computed(() => contentComponent.value?.editorPanel || null);
const outlinePanel = computed(() => outlineComponent.value?.outlinePanel || null);

// 滚动同步 Composable
const { activeAnchorId, updateAnchorElements, scrollToAnchor, setupPreviewScroll } = useScrollSync(
  outline,
  isEditing,
  previewPanel,
  editorPanel,
  outlinePanel
);

// --- 事件处理器 ---

const handleEdit = () => {
  editableContent.value = markdownContent.value;
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleSave = async () => {
  await saveContent();
  isEditing.value = false;
};

const handleAddChapter = () => {
  // TODO: 实现添加新章节的逻辑
  console.log('Add new chapter clicked');
};

const toggleChapter = (id: string) => {
  if (expandedChapters.value.has(id)) {
    expandedChapters.value.delete(id);
  } else {
    expandedChapters.value.add(id);
  }
};

const areAllExpanded = computed(() => {
  // 计算所有可展开章节的数量
  const allExpandableChapters: string[] = [];
  
  const countExpandable = (items: NestedOutlineItem[]) => {
    items.forEach(item => {
      if (item.children.length > 0) {
        allExpandableChapters.push(item.id);
        countExpandable(item.children);
      }
    });
  };
  
  countExpandable(outline.value);
  
  if (allExpandableChapters.length === 0) return true;
  
  // 检查所有可展开的章节是否都已展开
  return allExpandableChapters.every(id => expandedChapters.value.has(id));
});

const toggleAllChapters = () => {
  if (areAllExpanded.value) {
    expandedChapters.value.clear();
  } else {
    const addAllExpanded = (items: NestedOutlineItem[]) => {
      items.forEach(item => {
        if (item.children.length > 0) {
          expandedChapters.value.add(item.id);
          addAllExpanded(item.children);
        }
      });
    };
    
    addAllExpanded(outline.value);
  }
};

// --- 侦听器 ---

/**
 * 递归查找从根节点到目标ID节点的路径。
 * @param nodes - 当前要搜索的节点数组
 * @param id - 目标节点ID
 * @returns - 包含路径上所有节点ID的数组，如果未找到则返回null
 */
const findPathToNode = (nodes: NestedOutlineItem[], id: string): string[] | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return [node.id];
    }
    if (node.children && node.children.length > 0) {
      const path = findPathToNode(node.children, id);
      if (path) {
        // 如果在子节点中找到了路径，则将当前节点ID前置并返回
        return [node.id, ...path];
      }
    }
  }
  return null;
};

// 当滚动导致 activeAnchorId 变化时，自动展开对应章节及其所有父章节
watch(activeAnchorId, (newId) => {
  if (!newId) return;

  const path = findPathToNode(outline.value, newId);
  if (path) {
    // 将路径中的所有节点ID都添加到展开集合中，以确保其可见性
    path.forEach(nodeId => {
      expandedChapters.value.add(nodeId);
    });
  }
});
</script>

<style>
/* Basic styling for rendered markdown content */
/* 这些样式定义了 `v-html` 渲染出的内容的格式，例如标题、段落、代码块等 */
.prose h1, .prose h2, .prose h3 {
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
  scroll-margin-top: 1rem; /* 为锚点滚动提供顶部边距 */
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

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <!-- Left Column: Outline -->
    <div class="md:col-span-1 lg:col-span-1">
      <div class="bg-white rounded-lg shadow-card p-4 md:h-full md:sticky top-6 md:flex md:flex-col">
        <div class="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 class="text-lg font-semibold text-graphite-black">课程大纲</h2>
          <div class="flex items-center space-x-1">
            <button 
              @click="toggleAllChapters" 
              class="p-1 text-quantum-gray hover:text-wisdom-blue" 
              :title="areAllExpanded ? '全部折叠' : '全部展开'">
              <ArrowsPointingInIcon v-if="areAllExpanded" class="h-5 w-5" />
              <ArrowsPointingOutIcon v-else class="h-5 w-5" />
            </button>
            <button class="p-1 text-quantum-gray hover:text-wisdom-blue" title="添加新章节">
              <PlusIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
        <!-- Outline Tree -->
        <div class="md:flex-1 md:relative">
          <ul ref="outlinePanel" class="space-y-2 pr-2 md:absolute md:inset-0 md:overflow-y-auto">
            <li v-for="item in outline" :key="item.id" class="text-sm">
              <div class="flex justify-between items-center group">
                <a :href="'#' + item.id"
                   @click.prevent="scrollToAnchor(item.id)"
                   :class="[
                     'block transition-colors duration-200 cursor-pointer flex-grow',
                     item.id === activeAnchorId && item.children.length === 0 ? 'text-energy-cyan font-bold' : 
                     (item.level === 1 && (activeAnchorId || '').startsWith(item.id)) ? 'text-wisdom-blue font-semibold' :
                     'text-quantum-gray hover:text-wisdom-blue'
                   ]">
                  {{ item.content }}
                </a>
                <button 
                  v-if="item.children.length > 0" 
                  @click="toggleChapter(item.id)"
                  class="p-1 -mr-1 group-hover:text-wisdom-blue"
                  :class="expandedChapters.has(item.id) ? 'text-wisdom-blue' : 'text-gray-400'"
                  >
                  <ChevronDownIcon 
                    class="h-4 w-4 transition-transform duration-200"
                    :class="{ 'rotate-180': !expandedChapters.has(item.id) }"
                  />
                </button>
              </div>

              <ul 
                :class="{ 'hidden': !expandedChapters.has(item.id) }"
                class="space-y-1 mt-1 pl-3"
                >
                <li v-for="child in item.children" :key="child.id">
                  <a :href="'#' + child.id"
                     @click.prevent="scrollToAnchor(child.id)"
                     :class="[
                       'block transition-colors duration-200 cursor-pointer',
                        activeAnchorId === child.id ? 'text-energy-cyan font-bold' : 'text-quantum-gray hover:text-wisdom-blue'
                     ]">
                    {{ child.content }}
                  </a>
                </li>
              </ul>
            </li>
            <li v-if="!outline.length" class="text-sm text-gray-400">
              暂无大纲
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Center Column: Editor / Preview -->
    <div class="md:col-span-2 lg:col-span-2">
      <div class="bg-white rounded-lg shadow-card p-4 h-full flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-graphite-black">
            {{ isEditing ? '内容编辑' : '内容预览' }}
          </h2>
          <div v-if="!isEditing" class="flex items-center space-x-2">
            <button @click="handleEdit" class="px-3 py-1 bg-energy-cyan text-white rounded-md text-xs font-medium hover:bg-energy-cyan/90 flex items-center">
              <PencilIcon class="h-4 w-4 mr-1" />
              编辑
            </button>
            <button class="px-3 py-1 bg-white border border-gray-200 text-quantum-gray rounded-md text-xs font-medium hover:bg-gray-50 flex items-center">
              <ArrowDownTrayIcon class="h-4 w-4 mr-1" />
              下载
            </button>
          </div>
          <div v-else class="flex items-center space-x-2">
             <button @click="handleSave" :disabled="isSaving" class="px-3 py-1 bg-wisdom-blue text-white rounded-md text-xs font-medium hover:bg-wisdom-blue/90 flex items-center disabled:opacity-50">
              <CheckIcon class="h-4 w-4 mr-1" />
              {{ isSaving ? '保存中...' : '保存' }}
            </button>
            <button @click="handleCancel" class="px-3 py-1 bg-white border border-gray-200 text-quantum-gray rounded-md text-xs font-medium hover:bg-gray-50 flex items-center">
              <XMarkIcon class="h-4 w-4 mr-1" />
              取消
            </button>
          </div>
        </div>
        <!-- Rendered Markdown -->
        <div v-if="!isEditing"
          ref="previewPanel"
          v-html="renderedHtml" 
          class="prose prose-sm max-w-none md:h-[calc(100vh_-_22rem)] min-h-[400px] border border-gray-200 rounded-md p-4 overflow-y-auto">
        </div>
        <div v-else class="flex-1 flex flex-col min-h-[400px]">
          <textarea
            ref="editorPanel"
            v-model="editableContent"
            @scroll.passive="handleEditorScroll"
            class="w-full flex-1 border border-gray-300 rounded-md p-4 font-mono text-sm focus:ring-wisdom-blue focus:border-wisdom-blue resize-none"
            placeholder="在此输入Markdown内容..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Right Column: AI Assistant -->
    <div class="md:col-span-3 lg:col-span-1">
      <div class="bg-white rounded-lg shadow-card p-4 md:sticky top-6">
        <h2 class="text-lg font-semibold text-graphite-black mb-4">AI助手</h2>
        <!-- AI buttons -->
        <div class="text-sm text-gray-500">AI功能...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue';
import { getCourseContent, updateCourseContent } from '@/services/courseService';
import { 
  ArrowDownTrayIcon, PencilIcon, PlusIcon, ChevronDownIcon, 
  ArrowsPointingOutIcon, ArrowsPointingInIcon, CheckIcon, XMarkIcon
} from '@heroicons/vue/24/outline';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

interface OutlineItem {
  level: number;
  content: string;
  id: string;
  lineNumber: number;
}

interface NestedOutlineItem extends OutlineItem {
  children: OutlineItem[];
}

const props = defineProps<{
  courseId: number | null;
}>();

const markdownContent = ref('');
const outline = ref<NestedOutlineItem[]>([]);
const previewPanel = ref<HTMLElement | null>(null);
const editorPanel = ref<HTMLTextAreaElement | null>(null);
const outlinePanel = ref<HTMLElement | null>(null);
const activeAnchorId = ref<string | null>(null);
const expandedChapters = ref<Set<string>>(new Set());
let anchorElements: HTMLElement[] = [];

const isEditing = ref(false);
const editableContent = ref('');
const isSaving = ref(false);
const lineHeight = ref(0);
let editorScrollTimer: number | null = null;

// Function to create a URL-friendly slug
const slugify = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/[?？,，。.]/g, '');

// Initialize markdown-it with the anchor plugin
const md = new MarkdownIt().use(markdownItAnchor, { 
  level: [1, 2, 3, 4, 5, 6],
  slugify: slugify, // Use our custom slugify function
  permalink: markdownItAnchor.permalink.ariaHidden({
    placement: 'before',
    symbol: ''
  })
});

const areAllExpanded = computed(() => {
  const expandableCount = outline.value.filter(c => c.children.length > 0).length;
  if (expandableCount === 0) return true;
  return expandedChapters.value.size === expandableCount;
});

const parseOutline = () => {
  const tokens = md.parse(markdownContent.value, {});
  const result: NestedOutlineItem[] = [];
  let currentH1: NestedOutlineItem | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.substring(1), 10);
      const content = tokens[i + 1]?.content ?? '';
      
      // The markdown-it-anchor plugin adds the ID to the token's attributes
      const id = token.attrGet('id') || slugify(content);
      const lineNumber = token.map ? token.map[0] : 0;

      if (!id) continue;

      const newItem: OutlineItem = { level, content, id, lineNumber };
      if (level === 1) {
        const nestedItem: NestedOutlineItem = { ...newItem, children: [] };
        result.push(nestedItem);
        currentH1 = nestedItem;
      } else if (currentH1 && level > 1) {
        currentH1.children.push(newItem);
      }
      
      // Skip the inline token and heading_close token
      i += 2; 
    }
  }
  outline.value = result;
};

const renderedHtml = computed(() => {
  if (!markdownContent.value) {
    return '<span class="text-sm text-gray-400">正在加载内容...</span>';
  }
  return md.render(markdownContent.value);
});

const toggleChapter = (id: string) => {
  if (expandedChapters.value.has(id)) {
    expandedChapters.value.delete(id);
  } else {
    expandedChapters.value.add(id);
  }
};

const toggleAllChapters = () => {
  if (areAllExpanded.value) {
    expandedChapters.value.clear();
  } else {
    outline.value.forEach(chapter => {
      if (chapter.children.length > 0) {
        expandedChapters.value.add(chapter.id);
      }
    });
  }
};

watch(activeAnchorId, (newId, oldId) => {
  if (!newId) return;

  const newParentChapter = outline.value.find(c => c.children.some(child => child.id === newId) || c.id === newId);
  if (newParentChapter) {
    expandedChapters.value.add(newParentChapter.id);
  }

  nextTick(() => {
    if (!outlinePanel.value) return;
    const linkElement = outlinePanel.value.querySelector(`a[href="#${newId}"]`);

    if (linkElement) {
      const container = outlinePanel.value;
      const containerRect = container.getBoundingClientRect();
      const elementRect = linkElement.getBoundingClientRect();
      
      // Define a buffer zone of roughly 4 items.
      const buffer = 4 * linkElement.clientHeight;

      const isVisible = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom;
      
      if (!isVisible) {
        // If the element is not visible at all, scroll it to the center.
        linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // If the element is visible, only scroll if it enters the buffer zones.
        const isInTopBuffer = elementRect.top < containerRect.top + buffer;
        const isInBottomBuffer = elementRect.bottom > containerRect.bottom - buffer;

        if (isInTopBuffer || isInBottomBuffer) {
          linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  });
});

const handleScroll = () => {
  if (!previewPanel.value) return;

  const previewTop = previewPanel.value.getBoundingClientRect().top;
  const scrollThreshold = previewTop + 80; // 80px offset

  let currentActiveId: string | null = null;
  for (const el of anchorElements) {
    if (el.getBoundingClientRect().top < scrollThreshold) {
      currentActiveId = el.id;
    } else {
      break;
    }
  }

  if (currentActiveId && activeAnchorId.value !== currentActiveId) {
    activeAnchorId.value = currentActiveId;
  }
};

const scrollToAnchor = (id: string) => {
  activeAnchorId.value = id;
  
  const allHeadings = outline.value.reduce((acc, chapter) => {
    acc.push(chapter);
    chapter.children.forEach(child => acc.push(child));
    return acc;
  }, [] as (NestedOutlineItem | OutlineItem)[]);
  const targetItem = allHeadings.find(item => item.id === id);

  if (isEditing.value) {
    if (editorPanel.value && lineHeight.value && targetItem) {
      const targetScrollTop = targetItem.lineNumber * lineHeight.value;
      editorPanel.value.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  } else {
    const element = document.getElementById(id);
    if (element && previewPanel.value && previewPanel.value.contains(element)) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

const handleEdit = () => {
  editableContent.value = markdownContent.value;
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleSave = async () => {
  if (!props.courseId) return;
  isSaving.value = true;
  try {
    await updateCourseContent(props.courseId, editableContent.value);
    markdownContent.value = editableContent.value;
    isEditing.value = false;
    await nextTick();
    parseOutline();
    // Re-initialize anchors after content update
    const flatOutline = outline.value.flatMap(item => [item, ...item.children]);
    anchorElements = flatOutline
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
  } catch (error) {
    console.error('Failed to save course content:', error);
    // You might want to show a notification to the user here
  } finally {
    isSaving.value = false;
  }
};

const handleEditorScroll = () => {
  if (!editorPanel.value || !lineHeight.value) return;

  if (editorScrollTimer) {
    window.cancelAnimationFrame(editorScrollTimer);
  }

  editorScrollTimer = window.requestAnimationFrame(() => {
    const scrollTop = editorPanel.value!.scrollTop;
    const currentTopLine = Math.floor((scrollTop + 5) / lineHeight.value);

    const allHeadings = outline.value.reduce((acc, chapter) => {
      acc.push({ id: chapter.id, lineNumber: chapter.lineNumber });
      chapter.children.forEach(child => {
        acc.push({ id: child.id, lineNumber: child.lineNumber });
      });
      return acc;
    }, [] as { id: string, lineNumber: number }[]);

    let currentActiveId: string | null = null;
    for (const heading of allHeadings) {
      if (heading.lineNumber <= currentTopLine) {
        currentActiveId = heading.id;
      } else {
        break;
      }
    }

    if (currentActiveId && activeAnchorId.value !== currentActiveId) {
      activeAnchorId.value = currentActiveId;
    }
  });
};

watch(isEditing, (editing) => {
  if (editing) {
    nextTick(() => {
      if (editorPanel.value) {
        const style = window.getComputedStyle(editorPanel.value);
        lineHeight.value = parseFloat(style.lineHeight);
      }
    });
  }
});

watch(
  () => props.courseId,
  async (newCourseId) => {
    if (newCourseId) {
      try {
        const content = await getCourseContent(newCourseId);
        if (typeof content === 'string') {
          markdownContent.value = content;
        } else {
          throw new Error('Received content is not a valid string.');
        }
        
        parseOutline();

        await nextTick();
        
        const flatOutline = outline.value.flatMap(item => [item, ...item.children]);
        anchorElements = flatOutline
          .map(item => document.getElementById(item.id))
          .filter((el): el is HTMLElement => el !== null);
        
        previewPanel.value?.addEventListener('scroll', handleScroll);

      } catch (error) {
        console.error('Failed to fetch course content:', error);
        markdownContent.value = '# 加载失败\n\n无法获取课程内容，请检查网络连接或联系管理员。';
        parseOutline();
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // Content loading is now handled by the watcher on `props.courseId`
});

onUnmounted(() => {
  previewPanel.value?.removeEventListener('scroll', handleScroll);
});
</script>

<style>
/* Basic styling for rendered markdown content */
.prose h1, .prose h2, .prose h3 {
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
  scroll-margin-top: 1rem; /* Add top margin for scrolling */
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

<template>
  <div class="lg:flex lg:space-x-8">
    <!-- Main Content Area (Lesson Details or Chapter List on mobile) -->
    <div class="flex-1 min-w-0">
      <!-- Lesson Detail View -->
      <div id="lesson-content-view" v-if="activeLesson">
        <button @click="activeLesson = null" class="inline-flex items-center text-sm text-quantum-gray/80 hover:text-energy-cyan mb-4 transition-colors lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回课程章节
        </button>
        <div class="bg-white p-6 md:p-8 rounded-lg shadow-card prose max-w-none" v-html="activeLesson.content">
        </div>
        <!-- Lesson Navigation -->
        <div class="mt-8 flex justify-between items-center">
          <button @click="goToLesson(getPreviousLesson())" :disabled="!getPreviousLesson()" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-quantum-gray bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
            上一节
          </button>
          <button @click="goToLesson(getNextLesson())" :disabled="!getNextLesson()" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-wisdom-blue hover:bg-wisdom-blue/90 disabled:opacity-50 disabled:cursor-not-allowed">
            下一节
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
          </button>
        </div>
      </div>
      <!-- Fallback to directory view if no lesson is active -->
      <CourseDirectory v-else :chapters="chapters" @view-lesson="viewLesson" />
    </div>

    <!-- Right Sidebar for Desktop -->
    <aside v-if="activeLesson" class="hidden lg:block w-80 flex-shrink-0">
      <div class="sticky top-6">
        <h3 class="text-lg font-semibold mb-4 text-graphite-black">课程目录</h3>
        <div class="overflow-y-auto max-h-[calc(80vh-10rem)] pr-2">
          <CourseDirectory :chapters="chapters" :active-lesson-id="activeLesson?.id" @view-lesson="viewLesson"/>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import type { CourseProgressNode, LessonStatus } from '@/types/api';

const CourseDirectory = defineAsyncComponent(() => import('./CourseDirectory.vue'));

const props = defineProps<{
  chapters: CourseProgressNode[];
}>();

const activeLesson = ref<CourseProgressNode | null>(null);

const flatLessons = computed(() => {
    const lessons: CourseProgressNode[] = [];
    const traverse = (nodes: CourseProgressNode[]) => {
        if (!nodes) return;
        for (const node of nodes) {
            if (node.children && node.children.length > 0) {
                traverse(node.children);
            } else {
                lessons.push(node);
            }
        }
    };
    traverse(props.chapters);
    return lessons;
});

const getChapterProgress = (chapter: CourseProgressNode) => {
  if (!chapter.children || chapter.children.length === 0) return '0/0 节';
  const completed = chapter.children.filter(l => l.status === 'completed').length;
  return `${completed}/${chapter.children.length} 节`;
};

const getChapterStatusText = (chapter: CourseProgressNode) => {
  if (!chapter.children || chapter.children.length === 0) return '未开始';
  const progress = chapter.children.filter(l => l.status === 'completed').length / chapter.children.length;
  if (progress === 1) return '100% 完成';
  if (progress > 0) return `${Math.round(progress * 100)}% 完成`;
  return '未开始';
};

const getChapterStatusClass = (chapter: CourseProgressNode) => {
  if (!chapter.children || chapter.children.length === 0) return 'text-quantum-gray/60';
  const progress = chapter.children.filter(l => l.status === 'completed').length / chapter.children.length;
  if (progress === 1) return 'text-eco-green';
  if (progress > 0) return 'text-wisdom-blue';
  return 'text-quantum-gray/60';
};

const getLessonStatusIcon = (status: LessonStatus) => {
  switch (status) {
    case 'completed': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-eco-green" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
    case 'inprogress': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-wisdom-blue" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l3-4a1 1 0 000-1.664l-3-4zM11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l3-4a1 1 0 000-1.664l-3-4z" /></svg>`;
    case 'not_started': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-wisdom-blue" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l3-4a1 1 0 000-1.664l-3-4zM11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l3-4a1 1 0 000-1.664l-3-4z" /></svg>`;
    default: return `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full text-quantum-gray/40" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 000-2H9V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;
  }
};

const getLessonButtonText = (status: LessonStatus) => {
  switch (status) {
    case 'completed': return '复习';
    case 'inprogress': return '继续学习';
    case 'locked': return '未解锁';
    case 'not_started': return '开始学习';
    default: return '开始学习';
  }
};

const getLessonButtonClass = (lesson: CourseProgressNode) => {
  const base = 'px-3 py-1 rounded-md text-sm font-medium transition-colors';
  if (lesson.status === 'locked') return `${base} bg-gray-200 text-gray-500 cursor-not-allowed`;
  if (lesson.status === 'completed') return `${base} bg-eco-green/10 text-eco-green hover:bg-eco-green/20`;
  if (lesson.status === 'inprogress') return `${base} bg-wisdom-blue text-white hover:bg-wisdom-blue/90`;
  return `${base} bg-wisdom-blue text-white hover:bg-wisdom-blue/90`;
};

const viewLesson = (lesson: CourseProgressNode) => {
  if (lesson.status !== 'locked') {
    activeLesson.value = { 
      ...lesson, 
      content: lesson.content || `<h1>${lesson.title}</h1><p>课程内容正在加载中...</p>` 
    };
    window.scrollTo(0, 0);
  }
};

const getPreviousLesson = () => {
  if (!activeLesson.value) return null;
  const currentIndex = flatLessons.value.findIndex(l => l.id === activeLesson.value?.id);
  return currentIndex > 0 ? flatLessons.value[currentIndex - 1] : null;
};

const getNextLesson = () => {
  if (!activeLesson.value) return null;
  const currentIndex = flatLessons.value.findIndex(l => l.id === activeLesson.value?.id);
  const nextLesson = currentIndex < flatLessons.value.length - 1 ? flatLessons.value[currentIndex + 1] : null;
  if (nextLesson?.status === 'locked') return null;
  return nextLesson;
};

const goToLesson = (lesson: CourseProgressNode | null) => {
  if(lesson && lesson.status !== 'locked') {
    viewLesson(lesson);
  }
};

</script>

<style scoped>
.chapter-accordion[open] summary .arrow-icon {
  transform: rotate(90deg);
}

.prose {
  /* Add any prose-specific styles here if needed */
}
</style>

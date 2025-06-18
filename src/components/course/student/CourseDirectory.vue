<template>
  <div class="space-y-4">
    <details v-for="(chapter, index) in chapters" :key="chapter.id" class="chapter-accordion bg-white rounded-lg shadow-card group" :open="isChapterOpen(chapter, index)">
      <summary class="flex items-center justify-between p-4 cursor-pointer list-none">
        <div class="flex items-center space-x-4 min-w-0">
          <div class="text-energy-cyan font-bold text-lg w-8 text-center flex-shrink-0">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="min-w-0">
            <h3 class="font-semibold text-lg text-graphite-black truncate">{{ chapter.title }}</h3>
            <p class="text-sm text-quantum-gray/70">{{ getChapterProgress(chapter) }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-4 flex-shrink-0">
          <div class="text-sm font-medium" :class="getChapterStatusClass(chapter)">
            {{ getChapterStatusText(chapter) }}
          </div>
          <svg class="arrow-icon w-5 h-5 text-quantum-gray/60 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </summary>
      <div v-if="chapter.children && chapter.children.length" class="px-4 pb-4 border-t border-gray-100">
        <ul class="space-y-2 mt-3">
          <li v-for="lesson in chapter.children" :key="lesson.id" 
              @click="$emit('view-lesson', lesson)"
              class="flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer"
              :class="getLessonItemClass(lesson)">
            <div class="flex items-center min-w-0">
              <div v-html="getLessonStatusIcon(lesson.status)" class="mr-3 flex-shrink-0 w-5 h-5"></div>
              <span class="font-medium truncate" :class="{ 'text-quantum-gray/70': lesson.status === 'locked' }">{{ lesson.title }}</span>
            </div>
            <div class="flex items-center space-x-4 flex-shrink-0">
              <span v-if="lesson.duration" class="text-sm text-quantum-gray/70">{{ lesson.duration }}</span>
              <button :disabled="lesson.status === 'locked'" :class="getLessonButtonClass(lesson)">
                {{ getLessonButtonText(lesson.status) }}
              </button>
            </div>
          </li>
        </ul>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { CourseProgressNode, LessonStatus } from '@/types/api';

const props = defineProps<{
  chapters: CourseProgressNode[];
  activeLessonId?: number | null;
}>();

defineEmits(['view-lesson']);

const isChapterOpen = (chapter: CourseProgressNode, index: number) => {
  if (index === 0) return true; // Always open the first chapter
  if (!props.activeLessonId || !chapter.children) return false;
  return chapter.children.some(lesson => lesson.id === props.activeLessonId);
};

const getLessonItemClass = (lesson: CourseProgressNode) => {
  if (lesson.id === props.activeLessonId) {
    return 'bg-wisdom-blue/10 ring-1 ring-wisdom-blue';
  }
  if (lesson.status === 'inprogress') {
     return 'bg-wisdom-blue/5';
  }
  return 'hover:bg-gray-50';
};

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

</script>

<style scoped>
.chapter-accordion[open] summary .arrow-icon {
  transform: rotate(90deg);
}
</style> 
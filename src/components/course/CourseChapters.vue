<template>
  <div>
    <!-- Chapters/Main View -->
    <div id="course-main-view" v-if="!activeLesson">
      <div>
        <details v-for="(chapter, index) in course.chapters" :key="chapter.id" class="chapter-accordion bg-white rounded-lg shadow-card group" :open="index === 0">
          <summary class="flex items-center justify-between p-4 cursor-pointer list-none">
            <div class="flex items-center space-x-4">
              <div class="text-energy-cyan font-bold text-lg w-8 text-center flex-shrink-0">{{ String(index + 1).padStart(2, '0') }}</div>
              <div>
                <h3 class="font-semibold text-lg text-graphite-black">{{ chapter.title }}</h3>
                <p class="text-sm text-quantum-gray/70">{{ getChapterProgress(chapter) }} | {{ getChapterDuration(chapter) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm font-medium" :class="getChapterStatusClass(chapter)">
                {{ getChapterStatusText(chapter) }}
              </div>
              <svg class="arrow-icon w-5 h-5 text-quantum-gray/60 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </summary>
          <div class="px-4 pb-4 border-t border-gray-100">
            <ul class="space-y-2 mt-3">
              <li v-for="lesson in chapter.lessons" :key="lesson.id" class="flex items-center justify-between p-3 rounded-md transition-colors" :class="lesson.status === 'inprogress' ? 'bg-wisdom-blue/5 ring-1 ring-wisdom-blue' : 'bg-mist-white hover:bg-gray-100'">
                <div class="flex items-center">
                  <div v-html="getLessonStatusIcon(lesson.status)" class="mr-3 flex-shrink-0"></div>
                  <span class="font-medium" :class="{ 'text-quantum-gray/70': lesson.status === 'locked' }">{{ lesson.title }}</span>
                </div>
                <div class="flex items-center space-x-4">
                  <span class="text-sm text-quantum-gray/70">{{ lesson.duration }}</span>
                  <button @click="viewLesson(lesson)" :disabled="lesson.status === 'locked'" :class="getLessonButtonClass(lesson)">
                    {{ getLessonButtonText(lesson.status) }}
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </div>

    <!-- Lesson Detail View -->
    <div id="lesson-content-view" v-else>
      <button @click="activeLesson = null" class="inline-flex items-center text-sm text-quantum-gray/80 hover:text-energy-cyan mb-4 transition-colors">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Lesson, Chapter, LessonStatus } from '@/types/api';

const props = defineProps<{
  course: {
    chapters: Chapter[];
  };
}>();

const activeLesson = ref<Lesson | null>(null);

const flatLessons = computed(() => props.course.chapters.flatMap(c => c.lessons));

const getChapterProgress = (chapter: Chapter) => {
  const completed = chapter.lessons.filter(l => l.status === 'completed').length;
  return `${completed}/${chapter.lessons.length} 节`;
};

const getChapterDuration = (chapter: Chapter) => {
  const totalMinutes = chapter.lessons.reduce((acc, l) => acc + parseInt(l.duration), 0);
  return `${totalMinutes} 分钟`;
};

const getChapterStatusText = (chapter: Chapter) => {
  const progress = chapter.lessons.filter(l => l.status === 'completed').length / chapter.lessons.length;
  if (progress === 1) return '100% 完成';
  if (progress > 0) return `${Math.round(progress * 100)}% 完成`;
  return '未开始';
};

const getChapterStatusClass = (chapter: Chapter) => {
  const progress = chapter.lessons.filter(l => l.status === 'completed').length / chapter.lessons.length;
  if (progress === 1) return 'text-eco-green';
  if (progress > 0) return 'text-wisdom-blue';
  return 'text-quantum-gray/60';
};

const getLessonStatusIcon = (status: LessonStatus) => {
  switch (status) {
    case 'completed': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-eco-green" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`;
    case 'inprogress': return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-wisdom-blue animate-pulse" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832l3-4a1 1 0 000-1.664l-3-4zM11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l3-4a1 1 0 000-1.664l-3-4z" /></svg>`;
    default: return `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-quantum-gray/40" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 000-2H9V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;
  }
};

const getLessonButtonText = (status: LessonStatus) => {
  switch (status) {
    case 'completed': return '复习';
    case 'inprogress': return '继续学习';
    case 'locked': return '未解锁';
    default: return '开始学习';
  }
};

const getLessonButtonClass = (lesson: Lesson) => {
  const base = 'px-3 py-1 rounded-md text-sm font-medium';
  if (lesson.status === 'locked') return `${base} bg-gray-200 text-quantum-gray cursor-not-allowed`;
  if (lesson.status === 'completed') return `${base} bg-eco-green/20 text-eco-green`;
  if (lesson.status === 'inprogress') return `${base} bg-wisdom-blue text-white hover:bg-wisdom-blue/90`;
  return `${base} bg-energy-cyan text-white hover:bg-energy-cyan/90`;
};

const viewLesson = (lesson: Lesson) => {
  if (lesson.status !== 'locked') {
    activeLesson.value = lesson;
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
  // Assuming you can't go to a locked lesson
  if (nextLesson?.status === 'locked') return null;
  return nextLesson;
};

const goToLesson = (lesson: Lesson | null) => {
  if(lesson && lesson.status !== 'locked') {
    activeLesson.value = lesson;
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

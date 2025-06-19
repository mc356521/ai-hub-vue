<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <!-- Main content: Markdown preview -->
    <div
      ref="contentPanel"
      class="md:col-span-3 prose max-w-none overflow-y-auto"
      v-html="renderedHtml"
    ></div>

    <!-- Right sidebar: Course directory -->
    <div class="md:col-span-1">
      <CourseDirectory
        ref="outlinePanel"
        :outline="outline"
        :active-anchor-id="activeAnchorId"
        @scroll-to-anchor="scrollToAnchor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {
  useCourseContent,
  useMarkdownProcessor,
  useScrollSync,
} from '@/composables';
import CourseDirectory from './CourseDirectory.vue';
import type { NestedOutlineItem } from '@/composables';

// --- Component Refs ---
const contentPanel = ref<HTMLElement | null>(null);
const outlinePanel = ref<{ outlinePanel: HTMLElement | null } | null>(null);

// --- Get Course ID from route ---
const route = useRoute();
const courseId = computed(() => Number(route.params.id));

// --- Composables ---
const onContentLoaded = async () => {
  parseOutline();
  await nextTick();
  updateAnchorElements();
  setupPreviewScroll();
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
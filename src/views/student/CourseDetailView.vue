<template>
  <div class="bg-gray-50 min-h-screen">
    <div>
      <!-- Loading and Error States -->
      <div v-if="isLoading" class="text-center p-10">
        <p class="text-lg text-gray-500">正在加载课程...</p>
      </div>
      <div v-else-if="error" class="text-center p-10 bg-red-50 text-red-600 rounded-lg">
        <p class="font-bold">加载失败</p>
        <p>{{ error }}</p>
      </div>
      
      <!-- Course Content -->
      <div v-else-if="course">
        <!-- Course Header -->
        <CourseDetailHeader 
          :title="course.title || ''" 
          :subtitle="course.description || ''"
        />

        <!-- Main content area -->
        <div class="mt-8">
          <div class="bg-white rounded-lg shadow-card">
            <!-- Tabs -->
            <CourseTabs :tabs="tabs" :active-tab="activeTab" @tab-change="activeTab = $event" />

            <!-- Dynamic content based on tab -->
            <div class="p-6">
              <keep-alive>
                <component :is="activeComponent" :course="courseData" />
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file 课程详情视图
 * @description
 * 该视图负责展示单个课程的详细信息。
 * - 它通过路由参数获取课程ID，并从API加载课程数据。
 * - 页面顶部显示课程的标题和描述。
 * - 使用标签页 (Tabs) 在不同的课程内容（章节、任务、讨论等）之间切换。
 * - 大部分子组件都是异步加载的，以优化初始加载性能。
 * - 图标是动态创建并传递给标签页组件的。
 * - 动态组件 `<component :is="...">` 用于根据当前激活的标签页渲染对应的内容组件。
 */
import { ref, computed, h, defineAsyncComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Component } from 'vue';
import type { Chapter, Lesson, Courses, CourseProgressNode } from '@/types/api';
import { getCourseById, getCourseProgress } from '@/services/courseService';

// --- Components ---
const CourseDetailHeader = defineAsyncComponent(() => import('@/components/course/student/CourseDetailHeader.vue'));
const CourseTabs = defineAsyncComponent(() => import('@/components/course/student/CourseTabs.vue'));
const CourseChapters = defineAsyncComponent(() => import('@/components/course/student/CourseChapters.vue'));
const LearningTasks = defineAsyncComponent(() => import('@/components/course/student/LearningTasks.vue'));
const DiscussionForum = defineAsyncComponent(() => import('@/components/course/student/DiscussionForum.vue'));
const Assignments = defineAsyncComponent(() => import('@/components/course/student/Assignments.vue'));
const OnlineExams = defineAsyncComponent(() => import('@/components/course/student/OnlineExams.vue'));
const CourseMaterials = defineAsyncComponent(() => import('@/components/course/student/CourseMaterials.vue'));

// --- State ---
const route = useRoute();
const course = ref<Partial<Courses>>({});
const courseProgress = ref<CourseProgressNode[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref('chapters');


// --- Data Fetching ---
onMounted(async () => {
  const courseId = Number(route.params.id);
  if (isNaN(courseId)) {
    error.value = "无效的课程ID";
    isLoading.value = false;
    return;
  }
  try {
    isLoading.value = true;
    const [courseDetails, progressData] = await Promise.all([
      getCourseById(courseId),
      getCourseProgress(courseId)
    ]);
    course.value = courseDetails;
    courseProgress.value = progressData;
  } catch (e: any) {
    console.error("Failed to fetch course details:", e);
    error.value = e.message || '无法加载课程数据。';
  } finally {
    isLoading.value = false;
  }
});


// --- Mock Data ---
// This will be replaced with data from the API
const courseData = ref({
  chapters: [
    {
      id: 'ch1',
      title: 'JavaScript核心概念',
      lessons: [
        { id: 'l1-1', type: 'document', title: '作用域与作用域链', duration: '15分钟', status: 'completed', content: '<h1>作用域与作用域链</h1><p>详细内容...</p>' },
        { id: 'l1-2', type: 'document', title: '闭包的原理与应用', duration: '20分钟', status: 'completed', content: '<h1>闭包</h1><p>闭包内容...</p>' },
        { id: 'l1-3', type: 'document', title: '原型与原型链', duration: '10分钟', status: 'inprogress', content: '<h1>原型链</h1><p>原型链内容...</p>' },
      ] as Lesson[]
    },
    {
      id: 'ch2',
      title: '异步编程与Promise',
      lessons: [
        { id: 'l2-1', type: 'video', title: '事件循环', duration: '20分钟', status: 'locked', content: '' },
        { id: 'l2-2', type: 'document', title: 'Promise基础', duration: '25分钟', status: 'locked', content: '' },
        { id: 'l2-3', type: 'document', title: 'async/await', duration: '10分钟', status: 'locked', content: '' },
      ] as Lesson[]
    },
    {
      id: 'ch3',
      title: '模块化与工程化',
      lessons: [
        { id: 'l3-1', type: 'document', title: 'CommonJS vs ES Module', duration: '15分钟', status: 'locked', content: '' },
      ] as Lesson[]
    },
  ] as Chapter[]
});


// --- Icons ---
const createIcon = (path: string) => h('svg', { xmlns: 'http://www.w3.org/2000/svg', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: path })]);

const icons = {
  chapters: createIcon('M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4h5m-5 4h5'),
  tasks: createIcon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'),
  discussion: createIcon('M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'),
  assignments: createIcon('M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'),
  exams: createIcon('M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'),
  materials: createIcon('M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'),
};

// --- Tabs ---
const tabs: { key: string; label: string; icon: Component; }[] = [
  { key: 'chapters', label: '课程章节', icon: icons.chapters },
  { key: 'tasks', label: '学习任务', icon: icons.tasks },
  { key: 'discussion', label: '互动讨论', icon: icons.discussion },
  { key: 'assignments', label: '作业提交', icon: icons.assignments },
  { key: 'exams', label: '在线考试', icon: icons.exams },
  { key: 'materials', label: '课程资料', icon: icons.materials },
];

// --- Computed ---
const activeComponent = computed(() => {
  const map = {
    chapters: CourseChapters,
    tasks: LearningTasks,
    discussion: DiscussionForum,
    assignments: Assignments,
    exams: OnlineExams,
    materials: CourseMaterials,
  };
  const component = map[activeTab.value as keyof typeof map];
  
  if (activeTab.value === 'chapters') {
    return h(component, { chapters: courseProgress.value });
  }
  
  // For other tabs, you might pass the main course data
  return h(component, { course: course.value });
});

</script> 
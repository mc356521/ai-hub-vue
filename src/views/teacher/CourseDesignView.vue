<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="mb-6">
      <router-link to="/courses" class="inline-flex items-center text-sm text-quantum-gray/80 hover:text-energy-cyan mb-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        返回课程列表
      </router-link>
      <h1 class="text-2xl font-bold text-graphite-black">{{ course.title }}</h1>
      <p class="text-quantum-gray/70 mt-1">{{ course.description }}</p>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-card flex-grow flex flex-col">
      <!-- Tabs Navigation -->
      <div class="border-b border-gray-200">
        <div class="flex flex-col md:flex-row justify-between md:items-center px-4 gap-4">
          <nav class="flex space-x-2 overflow-x-auto pb-2 -mb-2" aria-label="Tabs">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[activeTab === tab.id ? 'text-energy-cyan border-energy-cyan' : 'text-graphite-black border-transparent hover:text-quantum-gray hover:border-gray-200', 'flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors']">
              <component :is="tab.icon" class="h-5 w-5 mr-2" />
              {{ tab.name }}
            </button>
          </nav>
          <div v-if="tabs.find(t => t.id === activeTab)?.showClassSelector" class="flex-shrink-0">
            <label for="classSelector" class="text-sm font-medium text-quantum-gray mr-2">当前班级:</label>
            <select id="classSelector" class="w-60 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-energy-cyan/50">
              <option value="fe-2023">2023级前端班</option>
              <option value="se-2022">22级软件工程(专升本)2班</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tab Content Area -->
      <div class="p-4 md:p-6 flex-grow">
        <!-- Here we will render the content based on the active tab -->
        <div v-if="activeTab === 'chapters'">
          <CourseChapter :course-id="course.id" />
        </div>
        <div v-if="activeTab === 'tasks'">
          <p>学习任务内容...</p>
        </div>
   
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue';
import { useRoute } from 'vue-router';
import CourseChapter from '../../components/course/CourseChapter.vue';
// import { getCourseById } from '@/services/courseService'; // This service needs to be created
import type { Courses } from '../../types/api';
import { ListBulletIcon, CheckCircleIcon, ChatBubbleLeftRightIcon, PencilSquareIcon, ShieldCheckIcon, FolderIcon } from '@heroicons/vue/24/outline';


const route = useRoute();
const course = ref<Partial<Courses>>({
  title: '加载中...',
  description: '正在获取课程详情...'
});

const activeTab = ref('chapters');
const tabs = shallowRef([
  { id: 'chapters', name: '课程章节', icon: ListBulletIcon, showClassSelector: false },
  { id: 'tasks', name: '学习任务', icon: CheckCircleIcon, showClassSelector: true },
  { id: 'discussion', name: '互动讨论', icon: ChatBubbleLeftRightIcon, showClassSelector: true },
  { id: 'assignments', name: '作业提交', icon: PencilSquareIcon, showClassSelector: true },
  { id: 'exams', name: '在线考试', icon: ShieldCheckIcon, showClassSelector: true },
  { id: 'materials', name: '课程资料', icon: FolderIcon, showClassSelector: false },
]);

onMounted(async () => {
  const courseId = Number(route.params.id);
  if (courseId) {
    try {
      // **Placeholder**: In a real app, you would fetch course data here.
      // const response = await getCourseById(courseId);
      // course.value = response;

      // Using mock data for now - but with the real ID
      course.value = {
        id: courseId,
        title: `课程 ID: ${courseId}`, // Placeholder title
        description: '课程内容正在加载...', // Placeholder description
      };
    } catch (error) {
      console.error('Failed to fetch course data:', error);
      course.value.title = '无法加载课程';
      course.value.description = '请检查网络连接或稍后再试。';
    }
  }
});

</script> 
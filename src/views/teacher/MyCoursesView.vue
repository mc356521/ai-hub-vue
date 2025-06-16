<template>
  <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <h1 class="text-2xl font-bold text-graphite-black">我的课程管理</h1>
    <button @click="isCreateModalVisible = true" class="w-full sm:w-auto justify-center px-4 py-2 bg-wisdom-blue text-white rounded-md text-sm font-medium hover:bg-wisdom-blue/90 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      创建新课程
    </button>
  </div>

  <!-- Loading and Error States -->
  <div v-if="isLoading" class="text-center py-10">
    <p>正在加载课程...</p>
  </div>
  <div v-if="error" class="text-center py-10 text-red-500">
    <p>加载课程失败: {{ error }}</p>
  </div>

  <div v-if="!isLoading && !error" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- 动态课程卡片 -->
    <div v-for="course in courses" :key="course.id" class="bg-white rounded-lg shadow-card overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-1 flex flex-col">
      <div class="h-40 bg-gradient-to-r from-wisdom-blue to-energy-cyan relative">
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="h-20 w-20 text-white opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div class="absolute bottom-4 left-4 right-4 p-2">
          <h3 class="text-white text-xl font-bold font-satoshi">{{ course.title }}</h3>
          <p class="text-white/80 text-sm mt-1">{{ course.chapterCount || 0 }}个章节</p>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-1">
        <div class="text-xs text-quantum-gray/60 mb-3">
          <p>创建: {{ formatDate(course.createTime) }}</p>
          <p class="mt-1">更新: {{ formatDate(course.updateTime) }}</p>
        </div>
        <div class="flex justify-between items-center mt-auto pt-2">
          <router-link :to="`/course-design/${course.id}`" class="px-4 py-2 bg-wisdom-blue text-white rounded-md text-sm font-medium hover:bg-wisdom-blue/90 flex-grow text-center">进入</router-link>
          <div class="flex items-center ml-2">
            <button class="p-2 text-quantum-gray/60 hover:text-wisdom-blue rounded-full hover:bg-wisdom-blue/10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            </button>
            <button class="p-2 text-quantum-gray/60 hover:text-wisdom-blue rounded-full hover:bg-wisdom-blue/10">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <CreateCourseModal v-model:visible="isCreateModalVisible" @create="handleCreateCourse" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyCourses, createCourse } from '../../services/courseService';
import type { Courses } from '../../types/api';
import CreateCourseModal from '../../components/course/CreateCourseModal.vue';

const courses = ref<Courses[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const isCreateModalVisible = ref(false);

const fetchCourses = async () => {
  try {
    isLoading.value = true;
    const response = await getMyCourses();
    courses.value = response;
  } catch (err: any) {
    error.value = err.message || '获取课程列表失败';
  } finally {
    isLoading.value = false;
  }
};

const handleCreateCourse = async (courseData: { title: string; description?: string }) => {
  try {
    // 后端可能不需要 description，但我们以接口定义为准
    const newCourse = await createCourse(courseData);
    courses.value.unshift(newCourse); // 将新课程添加到列表顶部
  } catch (err: any) {
    alert(`创建课程失败: ${err.message}`);
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

onMounted(() => {
  fetchCourses();
});
</script> 
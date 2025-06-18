<template>
  <aside class="bg-quantum-gray text-mist-white w-60 h-full fixed z-10">
    <div class="p-4">
      <div class="flex items-center mb-8">
        <span class="text-energy-cyan text-2xl font-bold mr-2">AI</span>
        <span class="text-white text-lg font-semibold">学习空间</span>
      </div>

      <nav class="space-y-1">
        <router-link 
          to="/student/dashboard" 
          class="flex items-center px-4 py-3 text-white opacity-80 hover:bg-energy-cyan/10 hover:opacity-100 rounded-lg"
          :class="{ 'bg-energy-cyan/20': $route.path.includes('/dashboard') }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>学习仪表盘</span>
        </router-link>

        <router-link 
          to="/student/learning-assistant" 
          class="flex items-center px-4 py-3 text-white opacity-80 hover:bg-energy-cyan/10 hover:opacity-100 rounded-lg"
          :class="{ 'bg-energy-cyan/20': $route.path.includes('/learning-assistant') }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>学习助手</span>
        </router-link>

        <router-link 
          to="/student/practice" 
          class="flex items-center px-4 py-3 text-white opacity-80 hover:bg-energy-cyan/10 hover:opacity-100 rounded-lg"
          :class="{ 'bg-energy-cyan/20': $route.path.includes('/practice') }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span>练习中心</span>
        </router-link>

        <router-link 
          to="/student/my-courses" 
          class="flex items-center px-4 py-3 text-white opacity-80 hover:bg-energy-cyan/10 hover:opacity-100 rounded-lg"
          :class="{ 'bg-energy-cyan/20': $route.path.includes('/my-courses') }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>我的课程</span>
        </router-link>

        <router-link 
          to="/student/practical-projects" 
          class="flex items-center px-4 py-3 text-white opacity-80 hover:bg-energy-cyan/10 hover:opacity-100 rounded-lg"
          :class="{ 'bg-energy-cyan/20': $route.path.includes('/practical-projects') }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          <span>实训项目</span>
        </router-link>

        <router-link 
          to="/student/progress" 
          class="flex items-center px-4 py-3 text-white opacity-80 hover:bg-energy-cyan/10 hover:opacity-100 rounded-lg"
          :class="{ 'bg-energy-cyan/20': $route.path.includes('/progress') }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>学习进度</span>
        </router-link>
      </nav>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-4">
      <div class="flex items-center px-4 py-3">
        <img :src="avatarUrl" class="h-8 w-8 rounded-full mr-3" />
        <div>
          <div class="text-sm font-medium">{{ userName }}</div>
          <a @click.prevent="logout" class="text-xs text-gray-400 hover:text-white cursor-pointer">退出登录</a>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/user';

const router = useRouter();
const userStore = useUserStore();

const userName = computed(() => userStore.username || '学生');
const avatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}&background=00C1D4&color=fff`;
});

const logout = () => {
  userStore.logout();
  router.push('/login');
};
</script> 
<template>
  <aside 
    class="w-60 h-full fixed z-30 bg-quantum-gray text-mist-white transform transition-transform duration-300 ease-in-out -translate-x-full md:translate-x-0"
    :class="{ 'translate-x-0': isMobileOpen }"
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <span class="text-wisdom-blue text-2xl font-bold mr-2">AI</span>
          <span class="text-white text-lg font-semibold">教师工作台</span>
        </div>
        <button @click="$emit('close')" class="md:hidden p-1 text-white opacity-80 hover:opacity-100">
           <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>
      </div>

      <nav class="space-y-1">
        <router-link to="/" class="flex items-center px-4 py-3 text-white rounded-lg opacity-80 hover:bg-wisdom-blue/10 hover:opacity-100" active-class="opacity-100 bg-wisdom-blue/20" exact-active-class="opacity-100 bg-wisdom-blue/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>教师仪表盘</span>
        </router-link>
        <router-link to="/courses" class="flex items-center px-4 py-3 text-white rounded-lg opacity-80 hover:bg-wisdom-blue/10 hover:opacity-100" active-class="opacity-100 bg-wisdom-blue/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>我的课程管理</span>
        </router-link>
        <router-link to="/classes" class="flex items-center px-4 py-3 text-white rounded-lg opacity-80 hover:bg-wisdom-blue/10 hover:opacity-100" active-class="opacity-100 bg-wisdom-blue/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>班级管理</span>
        </router-link>
        <!-- Add other links as needed -->
      </nav>
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-4">
      <div v-if="userStore.isLoggedIn" class="flex items-center px-4 py-3">
        <img :src="`https://ui-avatars.com/api/?name=${userStore.username}&background=2563EB&color=fff`" class="h-8 w-8 rounded-full mr-3" />
        <div>
          <div class="text-sm font-medium">{{ userStore.username }}</div>
          <a @click="handleLogout" class="text-xs text-gray-400 hover:text-white cursor-pointer">退出登录</a>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

defineProps<{
  isMobileOpen: boolean;
}>();

defineEmits(['close']);

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script> 
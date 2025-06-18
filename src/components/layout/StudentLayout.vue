<template>
  <div class="min-h-screen bg-gray-100">
    <StudentSidebar :is-mobile-open="isSidebarOpen" @close="isSidebarOpen = false" />
    <div class="md:ml-60 transition-all duration-300 ease-in-out">
      <!-- Mobile Header -->
      <div class="md:hidden flex justify-between items-center p-4 bg-white shadow-md">
        <button @click.prevent="isSidebarOpen = true">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="text-lg font-semibold">学习空间</div>
      </div>
      
      <main >
        <router-view class="p-4" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';

const StudentSidebar = defineAsyncComponent(() => import('@/components/layout/StudentSidebar.vue'));

const isSidebarOpen = ref(false);
</script> 
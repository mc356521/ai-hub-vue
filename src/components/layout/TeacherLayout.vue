<template>
  <div class="min-h-screen bg-mist-white">
    <!-- Overlay for mobile when sidebar is open -->
    <div
      v-if="isMobileSidebarOpen"
      @click="isMobileSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-20 md:hidden"
    ></div>

    <TeacherSidebar :is-mobile-open="isMobileSidebarOpen" @close="isMobileSidebarOpen = false" />

    <div class="flex-1 flex flex-col md:ml-60">
      <!-- Top bar for mobile with hamburger button -->
      <header class="md:hidden p-4 flex justify-between items-center bg-white shadow-sm">
        <button @click="isMobileSidebarOpen = !isMobileSidebarOpen" class="text-graphite-black">
           <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
           </svg>
        </button>
        <div class="flex items-center">
            <span class="text-wisdom-blue text-lg font-bold mr-1">AI</span>
            <span class="text-graphite-black text-base font-semibold">教师工作台</span>
        </div>
      </header>
      
      <main class="flex-1 p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TeacherSidebar from './TeacherSidebar.vue';

const isMobileSidebarOpen = ref(false);
</script>

<style scoped>
/* Scoped styles if absolutely necessary, but prefer utility classes */
.router-link-exact-active {
  @apply bg-wisdom-blue text-white;
}
</style> 
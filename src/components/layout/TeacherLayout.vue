<template>
  <div class="flex h-screen bg-quantum-gray text-mist-white">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-quantum-gray/80 backdrop-blur-glass p-content">
      <div class="flex items-center justify-center h-16 border-b border-gray-700">
        <h1 class="text-xl font-satoshi font-bold text-transparent bg-clip-text bg-gradient-to-r from-wisdom-blue to-energy-cyan">AI-HUB</h1>
      </div>
      <nav class="mt-module">
        <router-link
          to="/dashboard"
          class="flex items-center px-4 py-2 text-gray-300 hover:bg-wisdom-blue/20 hover:text-white rounded-md"
        >
          工作台
        </router-link>
        <router-link
          to="/course-design"
          class="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-wisdom-blue/20 hover:text-white rounded-md"
        >
          课程设计
        </router-link>
        <!-- Add more links as needed -->
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="flex justify-between items-center p-4 bg-quantum-gray/50 shadow-card">
        <div>
          <!-- Breadcrumbs or page title -->
        </div>
        <div>
          <span class="mr-4">欢迎, {{ userStore.username }}</span>
          <button @click="handleLogout" class="bg-secondary text-white px-3 py-1 rounded-md text-sm hover:bg-energy-cyan/80">
            退出
          </button>
        </div>
      </header>
      
      <!-- Content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-graphite-black/20 p-module">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Scoped styles if absolutely necessary, but prefer utility classes */
.router-link-exact-active {
  @apply bg-wisdom-blue text-white;
}
</style> 
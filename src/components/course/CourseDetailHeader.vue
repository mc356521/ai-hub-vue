<template>
  <div>
    <router-link to="/student/my-courses" class="inline-flex items-center text-sm text-quantum-gray/80 hover:text-energy-cyan mb-2 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      返回我的课程
    </router-link>
    <h1 class="text-2xl font-bold text-graphite-black">{{ title }}</h1>
    <p class="text-quantum-gray/70 mt-1">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
}>();
</script> 
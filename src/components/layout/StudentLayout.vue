<template>
  <div class="flex min-h-screen bg-mist-white">
    <StudentSidebar />
    <main class="ml-60 flex-1 p-6">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import StudentSidebar from '@/components/layout/StudentSidebar.vue';
</script> 
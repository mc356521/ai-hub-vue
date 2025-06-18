<template>
  <div class="border-b border-gray-200">
    <nav class="flex justify-around md:justify-start md:space-x-2 md:px-4" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="$emit('tab-change', tab.key)"
        :class="[
          'flex items-center whitespace-nowrap py-3 px-2 md:px-4 border-b-2 font-medium text-sm',
          activeTab === tab.key
            ? 'text-energy-cyan border-energy-cyan'
            : 'border-transparent hover:text-quantum-gray/80 hover:border-gray-300'
        ]"
        :title="tab.label"
      >
        <component :is="tab.icon" class="h-5 w-5 md:mr-2" />
        <span class="hidden md:inline">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

interface Tab {
  key: string;
  label: string;
  icon: Component;
}

defineProps<{
  tabs: Tab[];
  activeTab: string;
}>();

defineEmits(['tab-change']);
</script> 
<template>
  <div class="border-b border-gray-200">
    <nav class="flex space-x-2 px-4" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="$emit('tab-change', tab.key)"
        :class="[
          'flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm',
          activeTab === tab.key
            ? 'text-energy-cyan border-energy-cyan'
            : 'text-quantum-gray/60 border-transparent hover:text-quantum-gray/80 hover:border-gray-300'
        ]"
      >
        <component :is="tab.icon" class="h-5 w-5 mr-2" />
        {{ tab.label }}
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
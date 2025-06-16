<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    <!-- Left Column: Outline -->
    <div class="md:col-span-1 lg:col-span-1">
      <div class="bg-white rounded-lg shadow-card p-4 h-full">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-graphite-black">课程大纲</h2>
          <button class="p-1 text-quantum-gray hover:text-wisdom-blue">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
        <!-- Outline Tree will go here -->
        <div class="text-sm text-gray-500">大纲内容...</div>
      </div>
    </div>

    <!-- Center Column: Editor -->
    <div class="md:col-span-2 lg:col-span-2">
      <div class="bg-white rounded-lg shadow-card p-4 h-full flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-graphite-black">内容编辑</h2>
          <div class="flex items-center space-x-2">
            <button class="px-3 py-1 bg-energy-cyan text-white rounded-md text-xs font-medium hover:bg-energy-cyan/90 flex items-center">
              <ArrowDownTrayIcon class="h-4 w-4 mr-1" />
              保存
            </button>
            <button class="px-3 py-1 bg-white border border-gray-200 text-quantum-gray rounded-md text-xs font-medium hover:bg-gray-50 flex items-center">
              <EyeIcon class="h-4 w-4 mr-1" />
              预览
            </button>
            <button class="px-3 py-1 bg-white border border-gray-200 text-quantum-gray rounded-md text-xs font-medium hover:bg-gray-50 flex items-center">
              <ArrowDownTrayIcon class="h-4 w-4 mr-1" />
              下载
            </button>
          </div>
        </div>
        <!-- Editor will go here -->
        <div class="border border-gray-200 rounded-md p-4 flex-grow min-h-[400px]">
          <span class="text-sm text-gray-400">编辑器内容...</span>
        </div>
      </div>
    </div>

    <!-- Right Column: AI Assistant -->
    <div class="md:col-span-3 lg:col-span-1">
      <div class="bg-white rounded-lg shadow-card p-4">
        <h2 class="text-lg font-semibold text-graphite-black mb-4">AI助手</h2>
        <!-- AI buttons -->
        <div class="text-sm text-gray-500">AI功能...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ArrowDownTrayIcon, EyeIcon } from '@heroicons/vue/24/outline';

export default defineComponent({
  name: 'CourseChapter',
  components: {
    ArrowDownTrayIcon,
    EyeIcon,
  },
  setup() {
    // This component will manage the state for the chapters view,
    // including the outline, editor content, and AI interactions.
    return {};
  }
});
</script>

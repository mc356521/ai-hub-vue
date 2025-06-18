<template>
  <div class="bg-white rounded-lg shadow-card p-4 h-full flex flex-col">
    <!-- 头部区域，包含标题和操作按钮 -->
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold text-graphite-black">
        {{ isEditing ? '内容编辑' : '内容预览' }}
      </h2>
      <!-- 预览模式下的按钮 -->
      <div v-if="!isEditing" class="flex items-center space-x-2">
        <button @click="$emit('edit')" class="px-3 py-1 bg-energy-cyan text-white rounded-md text-xs font-medium hover:bg-energy-cyan/90 flex items-center">
          <PencilIcon class="h-4 w-4 mr-1" />
          编辑
        </button>
        <button class="px-3 py-1 bg-white border border-gray-200 text-quantum-gray rounded-md text-xs font-medium hover:bg-gray-50 flex items-center">
          <ArrowDownTrayIcon class="h-4 w-4 mr-1" />
          下载
        </button>
      </div>
      <!-- 编辑模式下的按钮 -->
      <div v-else class="flex items-center space-x-2">
          <button @click="$emit('save')" :disabled="isSaving" class="px-3 py-1 bg-wisdom-blue text-white rounded-md text-xs font-medium hover:bg-wisdom-blue/90 flex items-center disabled:opacity-50">
          <CheckIcon class="h-4 w-4 mr-1" />
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
        <button @click="$emit('cancel')" class="px-3 py-1 bg-white border border-gray-200 text-quantum-gray rounded-md text-xs font-medium hover:bg-gray-50 flex items-center">
          <XMarkIcon class="h-4 w-4 mr-1" />
          取消
        </button>
      </div>
    </div>
    <!-- Markdown 内容预览区域 -->
    <div v-if="!isEditing"
      ref="previewPanel"
      v-html="renderedHtml"
      class="prose prose-sm max-w-none md:h-[calc(100vh_-_22rem)] min-h-[400px] border border-gray-200 rounded-md p-4 overflow-y-auto">
    </div>
    <!-- Markdown 内容编辑区域 -->
    <div v-else class="flex-1 flex flex-col min-h-[400px]">
      <textarea
        ref="editorPanel"
        :value="modelValue"
        @input="handleInput"
        class="w-full flex-1 border border-gray-300 rounded-md p-4 font-mono text-sm focus:ring-wisdom-blue focus:border-wisdom-blue resize-none"
        placeholder="在此输入Markdown内容..."
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  ArrowDownTrayIcon, PencilIcon, CheckIcon, XMarkIcon
} from '@heroicons/vue/24/outline';

// --- 组件 props 定义 ---
defineProps<{
  modelValue: string; // 编辑器内容, 通过 v-model 绑定
  renderedHtml: string; // 渲染后的 HTML 内容
  isEditing: boolean; // 是否处于编辑模式
  isSaving: boolean; // 是否正在保存
}>();

// --- 组件事件定义 ---
const emit = defineEmits(['update:modelValue', 'edit', 'save', 'cancel']);

// 处理 textarea 的输入事件，以支持 v-model
const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};

// --- Template Refs ---
// 对预览和编辑面板 DOM 元素的引用
const previewPanel = ref<HTMLElement | null>(null);
const editorPanel = ref<HTMLTextAreaElement | null>(null);

// --- Expose ---
// 暴露 refs，以便父组件可以访问这些 DOM 元素
defineExpose({ previewPanel, editorPanel });
</script> 
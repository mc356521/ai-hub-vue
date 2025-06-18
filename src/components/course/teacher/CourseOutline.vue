<template>
  <div class="bg-white rounded-lg shadow-card p-4 md:h-full md:sticky top-6 md:flex md:flex-col">
    <!-- 头部区域，包含标题和操作按钮 -->
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <h2 class="text-lg font-semibold text-graphite-black">课程大纲</h2>
      <div class="flex items-center space-x-1">
        <!-- 全部展开/折叠按钮 -->
        <button 
          @click="$emit('toggleAll')" 
          class="p-1 text-quantum-gray hover:text-wisdom-blue" 
          :title="areAllExpanded ? '全部折叠' : '全部展开'">
          <ArrowsPointingInIcon v-if="areAllExpanded" class="h-5 w-5" />
          <ArrowsPointingOutIcon v-else class="h-5 w-5" />
        </button>
        <!-- 添加新章节按钮 -->
        <button @click="$emit('addChapter')" class="p-1 text-quantum-gray hover:text-wisdom-blue" title="添加新章节">
          <PlusIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
    <!-- 大纲树形结构 -->
    <div class="md:flex-1 md:relative">
      <ul ref="outlinePanel" class="space-y-2 pr-2 md:absolute md:inset-0 md:overflow-y-auto">
        <!-- 遍历一级标题 (章) -->
        <li v-for="item in outline" :key="item.id" class="text-sm">
          <div class="flex justify-between items-center group">
            <!-- 章节标题链接 -->
            <a :href="'#' + item.id"
               @click.prevent="$emit('scrollToAnchor', item.id)"
               :class="[
                 'block transition-colors duration-200 cursor-pointer flex-grow',
                 item.id === activeAnchorId && item.children.length === 0 ? 'text-energy-cyan font-bold' : 
                 (item.level === 1 && (activeAnchorId || '').startsWith(item.id)) ? 'text-wisdom-blue font-semibold' :
                 'text-quantum-gray hover:text-wisdom-blue'
               ]">
              {{ item.content }}
            </a>
            <!-- 子章节展开/折叠按钮 -->
            <button 
              v-if="item.children.length > 0" 
              @click="$emit('toggleChapter', item.id)"
              class="p-1 -mr-1 group-hover:text-wisdom-blue"
              :class="expandedChapters.has(item.id) ? 'text-wisdom-blue' : 'text-gray-400'"
              >
              <ChevronDownIcon 
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': !expandedChapters.has(item.id) }"
              />
            </button>
          </div>
          <!-- 遍历二级标题 (节) -->
          <ul 
            :class="{ 'hidden': !expandedChapters.has(item.id) }"
            class="space-y-1 mt-1 pl-3"
            >
            <li v-for="child in item.children" :key="child.id">
              <a :href="'#' + child.id"
                 @click.prevent="$emit('scrollToAnchor', child.id)"
                 :class="[
                   'block transition-colors duration-200 cursor-pointer',
                    activeAnchorId === child.id ? 'text-energy-cyan font-bold' : 'text-quantum-gray hover:text-wisdom-blue'
                 ]">
                {{ child.content }}
              </a>
            </li>
          </ul>
        </li>
        <!-- 当没有大纲时的提示信息 -->
        <li v-if="!outline.length" class="text-sm text-gray-400">
          暂无大纲
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { 
  PlusIcon, ChevronDownIcon, 
  ArrowsPointingOutIcon, ArrowsPointingInIcon 
} from '@heroicons/vue/24/outline';
import type { NestedOutlineItem } from '@/composables';

// --- 组件 props 定义 ---
const props = defineProps<{
  outline: NestedOutlineItem[]; // 课程大纲数据
  activeAnchorId: string | null; // 当前滚动到的锚点ID
  expandedChapters: Set<string>; // 展开的章节ID集合
}>();

// --- 组件事件定义 ---
defineEmits(['scrollToAnchor', 'toggleChapter', 'toggleAll', 'addChapter']);

const { outline, expandedChapters } = toRefs(props);
const outlinePanel = ref(null); // 对大纲面板 DOM 元素的引用

// --- 计算属性 ---
// 判断是否所有章节都已展开
const areAllExpanded = computed(() => {
  const expandableCount = outline.value.filter(c => c.children.length > 0).length;
  if (expandableCount === 0) return true; // 如果没有可展开的章节，则视为全部展开
  return expandedChapters.value.size === expandableCount;
});

// --- Expose ---
// 通过 defineExpose 暴露 outlinePanel 引用，以便父组件可以访问
defineExpose({ outlinePanel });
</script> 
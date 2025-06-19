<template>
  <li class="text-sm">
    <div class="flex justify-between items-center group">
      <!-- 章节标题链接 -->
      <a :href="'#' + item.id"
         @click.prevent="handleClick"
         :class="[
           'block transition-colors duration-200 cursor-pointer flex-grow',
           activeAnchorId === item.id ? 'text-energy-cyan font-bold' : 
           isActive ? 'text-wisdom-blue font-semibold' :
           'text-quantum-gray hover:text-wisdom-blue'
         ]"
         :style="{ paddingLeft: indentLevel * 0.5 + 'rem' }">
        {{ item.content }}
      </a>
      <!-- 子章节展开/折叠按钮 -->
      <button 
        v-if="item.children && item.children.length > 0"
        @click="handleToggle"
        class="p-1 -mr-1 group-hover:text-wisdom-blue"
        :class="isExpanded ? 'text-wisdom-blue' : 'text-gray-400'"
        >
        <ChevronDownIcon 
          class="h-4 w-4 transition-transform duration-200"
          :class="{ 'rotate-180': !isExpanded }"
        />
      </button>
    </div>
    <!-- 递归渲染子项 -->
    <ul 
      v-if="item.children && item.children.length > 0"
      :class="{ 'hidden': !isExpanded }"
      class="space-y-1 mt-1 pl-3">
      <outline-item
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :active-anchor-id="activeAnchorId"
        :expanded-chapters="expandedChapters"
        :indent-level="indentLevel + 1"
        @scroll-to-anchor="$emit('scrollToAnchor', $event)"
        @toggle-chapter="$emit('toggleChapter', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import type { NestedOutlineItem } from '@/composables';

// 组件名称，用于递归引用
const name = 'outline-item';

// 定义组件 props
const props = defineProps({
  item: {
    type: Object as () => NestedOutlineItem,
    required: true
  },
  activeAnchorId: {
    type: String,
    default: null
  },
  expandedChapters: {
    type: Object as () => Set<string>,
    required: true
  },
  indentLevel: {
    type: Number,
    default: 0
  }
});

// 定义组件事件
const emit = defineEmits(['scrollToAnchor', 'toggleChapter']);

// 计算当前项是否处于活跃状态（当前项或其子项被选中）
const isActive = computed(() => {
  // 如果当前项就是活跃项，直接返回true
  if (props.activeAnchorId === props.item.id) return true;
  
  // 递归检查子项及其所有后代是否包含活跃项
  const checkChildrenActive = (children: NestedOutlineItem[]): boolean => {
    for (const child of children) {
      if (child.id === props.activeAnchorId) {
        return true;
      }
      if (child.children && child.children.length > 0) {
        if (checkChildrenActive(child.children)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // 检查当前项的所有子项
  return props.item.children && props.item.children.length > 0 
    ? checkChildrenActive(props.item.children) 
    : false;
});

// 计算当前项是否展开
const isExpanded = computed(() => {
  return props.expandedChapters.has(props.item.id);
});

// 处理切换展开/折叠状态
const handleToggle = () => {
  emit('toggleChapter', props.item.id);
};

// 处理点击跳转到锚点
const handleClick = () => {
  emit('scrollToAnchor', props.item.id);
};
</script> 
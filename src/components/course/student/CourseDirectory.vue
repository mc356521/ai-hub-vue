<template>
  <div ref="outlinePanel" class="bg-gray-50 p-4 rounded-lg sticky top-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-base font-semibold text-gray-800">课程目录</h3>
      <button
        @click="toggleAll"
        class="text-xs text-blue-500 hover:text-blue-700"
      >
        {{ areAllExpanded ? '全部折叠' : '全部展开' }}
      </button>
    </div>
    <div class="space-y-1">
      <DirectoryNode
        v-for="item in outline"
        :key="item.id"
        :node="item"
        :active-anchor-id="activeAnchorId"
        :expanded-nodes="expandedNodes"
        @scroll-to-anchor="$emit('scrollToAnchor', $event)"
        @toggle-node="toggleNode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { PropType } from 'vue';
import type { NestedOutlineItem } from '@/composables';
import DirectoryNode from './DirectoryNode.vue';

const props = defineProps({
  outline: {
    type: Array as PropType<NestedOutlineItem[]>,
    required: true,
  },
  activeAnchorId: {
    type: String as PropType<string | null>,
    default: null,
  },
});

defineEmits(['scrollToAnchor']);

const outlinePanel = ref<HTMLElement | null>(null);
const expandedNodes = ref<Set<string>>(new Set());

// --- Expand/Collapse Logic ---
const getAllNodeIds = (nodes: NestedOutlineItem[]): string[] => {
  let ids: string[] = [];
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      ids.push(node.id);
      ids = ids.concat(getAllNodeIds(node.children));
    }
  }
  return ids;
};

const areAllExpanded = computed(() => {
  const allIds = getAllNodeIds(props.outline);
  return allIds.every(id => expandedNodes.value.has(id));
});

const toggleAll = () => {
  if (areAllExpanded.value) {
    expandedNodes.value.clear();
  } else {
    getAllNodeIds(props.outline).forEach(id => expandedNodes.value.add(id));
  }
};

const toggleNode = (id: string) => {
  if (expandedNodes.value.has(id)) {
    expandedNodes.value.delete(id);
  } else {
    expandedNodes.value.add(id);
  }
};

// --- Auto-expand on active anchor change ---
const findPathToNode = (nodes: NestedOutlineItem[], id: string): string[] | null => {
  for (const node of nodes) {
    if (node.id === id) return [node.id];
    if (node.children) {
      const path = findPathToNode(node.children, id);
      if (path) return [node.id, ...path];
    }
  }
  return null;
};

watch(() => props.activeAnchorId, (newId) => {
  if (newId) {
    const path = findPathToNode(props.outline, newId);
    if (path) {
      path.forEach(id => expandedNodes.value.add(id));
    }
  }
}, { immediate: true });

// Expand all by default initially
watch(() => props.outline, (newOutline) => {
  if (newOutline.length > 0) {
    getAllNodeIds(newOutline).forEach(id => expandedNodes.value.add(id));
  }
}, { immediate: true, deep: true });

defineExpose({ outlinePanel });
</script> 
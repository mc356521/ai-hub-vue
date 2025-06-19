<template>
  <div>
    <div
      @click="handleItemClick"
      class="flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors"
      :class="isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
    >
      <span class="text-sm truncate">{{ node.content }}</span>
      <button
        v-if="hasChildren"
        @click.stop="$emit('toggleNode', node.id)"
        class="p-1 rounded-full hover:bg-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 transition-transform"
          :class="{ 'rotate-90': isExpanded }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
    <div v-if="isExpanded && hasChildren" class="mt-1">
      <DirectoryNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :active-anchor-id="activeAnchorId"
        :expanded-nodes="expandedNodes"
        @scroll-to-anchor="$emit('scrollToAnchor', $event)"
        @toggle-node="$emit('toggleNode', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
// Using defineComponent for recursive components in <script> block
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import type { NestedOutlineItem } from '@/composables';

export default defineComponent({
  name: 'DirectoryNode',
  props: {
    node: {
      type: Object as PropType<NestedOutlineItem>,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    activeAnchorId: {
      type: String as PropType<string | null>,
      default: null,
    },
    expandedNodes: {
      type: Set as PropType<Set<string>>,
      required: true,
    },
  },
  emits: ['scrollToAnchor', 'toggleNode'],
  setup(props, { emit }) {
    const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
    const isExpanded = computed(() => props.expandedNodes.has(props.node.id));
    const isActive = computed(() => props.activeAnchorId === props.node.id);

    const handleItemClick = () => {
      emit('scrollToAnchor', props.node.id);
      if (hasChildren.value) {
        emit('toggleNode', props.node.id);
      }
    };

    return {
      hasChildren,
      isExpanded,
      isActive,
      handleItemClick,
    };
  },
});
</script> 
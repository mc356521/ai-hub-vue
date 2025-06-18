import { ref, onUnmounted, nextTick, watch, Ref } from 'vue';
import { NestedOutlineItem } from './useMarkdownProcessor';

/**
 * Composable 函数，用于同步编辑器/预览面板与大纲的滚动位置。
 * @param outline - 包含课程大纲的 ref。
 * @param isEditing - 是否处于编辑模式的 ref。
 * @param previewPanel - 预览面板的 DOM 元素 ref。
 * @param editorPanel - 编辑器面板的 DOM 元素 ref。
 * @param outlinePanel - 大纲面板的 DOM 元素 ref。
 */
export function useScrollSync(
  outline: Ref<NestedOutlineItem[]>,
  isEditing: Ref<boolean>,
  previewPanel: Ref<HTMLElement | null>,
  editorPanel: Ref<HTMLTextAreaElement | null>,
  outlinePanel: Ref<HTMLElement | null>
) {
  const activeAnchorId = ref<string | null>(null); // 当前激活的锚点 ID
  let anchorElements: HTMLElement[] = []; // 预览区中所有锚点元素的集合
  const lineHeight = ref(0); // 编辑器中单行文本的高度
  let editorScrollTimer: number | null = null; // 用于编辑器滚动的 requestAnimationFrame ID

  // 更新预览区中的锚点元素列表
  const updateAnchorElements = () => {
    const flatOutline = outline.value.flatMap(item => [item, ...item.children]);
    anchorElements = flatOutline
      .map(item => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
  };

  // 处理预览面板的滚动事件
  const handlePreviewScroll = () => {
    if (!previewPanel.value) return;

    const previewTop = previewPanel.value.getBoundingClientRect().top;
    const scrollThreshold = previewTop + 80; // 设置一个偏移量，用于判断哪个标题是"当前"

    let currentActiveId: string | null = null;
    for (const el of anchorElements) {
      if (el.getBoundingClientRect().top < scrollThreshold) {
        currentActiveId = el.id;
      } else {
        break;
      }
    }

    if (currentActiveId && activeAnchorId.value !== currentActiveId) {
      activeAnchorId.value = currentActiveId;
    }
  };

  // 处理编辑器面板的滚动事件
  const handleEditorScroll = () => {
    if (!editorPanel.value || !lineHeight.value) return;
  
    if (editorScrollTimer) {
      window.cancelAnimationFrame(editorScrollTimer);
    }
  
    // 使用 requestAnimationFrame 来优化滚动性能
    editorScrollTimer = window.requestAnimationFrame(() => {
      const scrollTop = editorPanel.value!.scrollTop;
      const currentTopLine = Math.floor((scrollTop + 5) / lineHeight.value);
  
      const allHeadings = outline.value.reduce((acc, chapter) => {
        acc.push({ id: chapter.id, lineNumber: chapter.lineNumber });
        chapter.children.forEach(child => {
          acc.push({ id: child.id, lineNumber: child.lineNumber });
        });
        return acc;
      }, [] as { id: string, lineNumber: number }[]);
  
      let currentActiveId: string | null = null;
      for (const heading of allHeadings) {
        if (heading.lineNumber <= currentTopLine) {
          currentActiveId = heading.id;
        } else {
          break;
        }
      }
  
      if (currentActiveId && activeAnchorId.value !== currentActiveId) {
        activeAnchorId.value = currentActiveId;
      }
    });
  };

  // 滚动到指定的锚点
  const scrollToAnchor = (id: string) => {
    activeAnchorId.value = id;

    const allHeadings = outline.value.reduce((acc, chapter) => {
        acc.push(chapter);
        chapter.children.forEach(child => acc.push(child));
        return acc;
    }, [] as any[]); 
    const targetItem = allHeadings.find(item => item.id === id);

    if (isEditing.value) {
      // 在编辑模式下，根据行号滚动
      if (editorPanel.value && lineHeight.value && targetItem) {
          const targetScrollTop = targetItem.lineNumber * lineHeight.value;
          editorPanel.value.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
      }
    } else {
      // 在预览模式下，滚动到对应的 DOM 元素
      const element = document.getElementById(id);
      if (element && previewPanel.value && previewPanel.value.contains(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  // 监听编辑状态的变化，以计算行高并附加/分离滚动监听器
  watch(isEditing, (editing) => {
    if (editing) {
      nextTick(() => {
        if (editorPanel.value) {
          const style = window.getComputedStyle(editorPanel.value);
          lineHeight.value = parseFloat(style.lineHeight);
          editorPanel.value.addEventListener('scroll', handleEditorScroll);
        }
      });
    } else {
      editorPanel.value?.removeEventListener('scroll', handleEditorScroll);
    }
  });

  // 监听当前激活锚点的变化，以自动滚动大纲列表
  watch(activeAnchorId, (newId) => {
    if (!newId || !outlinePanel.value) return;
  
    nextTick(() => {
        const linkElement = outlinePanel.value!.querySelector(`a[href="#${newId}"]`);
        if (linkElement) {
            const container = outlinePanel.value!;
            const containerRect = container.getBoundingClientRect();
            const elementRect = linkElement.getBoundingClientRect();
            const buffer = 4 * linkElement.clientHeight; // 缓冲区，避免频繁滚动
            const isVisible = elementRect.top >= containerRect.top && elementRect.bottom <= containerRect.bottom;
            
            if (!isVisible) {
                linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const isInTopBuffer = elementRect.top < containerRect.top + buffer;
                const isInBottomBuffer = elementRect.bottom > containerRect.bottom - buffer;
                if (isInTopBuffer || isInBottomBuffer) {
                    linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    });
  });

  // 设置预览区的滚动监听器
  const setupPreviewScroll = () => {
    previewPanel.value?.addEventListener('scroll', handlePreviewScroll);
  }

  // 在组件卸载时清理事件监听器
  onUnmounted(() => {
    previewPanel.value?.removeEventListener('scroll', handlePreviewScroll);
    editorPanel.value?.removeEventListener('scroll', handleEditorScroll);
  });

  return {
    activeAnchorId,
    updateAnchorElements,
    scrollToAnchor,
    setupPreviewScroll,
  };
} 
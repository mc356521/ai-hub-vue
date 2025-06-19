import { ref, onUnmounted, nextTick, watch, Ref } from 'vue';
import { NestedOutlineItem } from './useMarkdownProcessor';

/**
 * Composable 函数，用于同步编辑器/预览面板与大纲的滚动位置。
 * @param outline - 包含课程大纲的 ref。
 * @param isEditing - 是否处于编辑模式的 ref。
 * @param previewPanel - 预览面板的 DOM 元素 ref。
 * @param editorPanel - 编辑器面板的 DOM 元素 ref。
 * @param outlinePanel - 大纲面板的 DOM 元素 ref。
 * @param options - 可选参数，包含`useWindowScroll`布尔值。
 */
export function useScrollSync(
  outline: Ref<Readonly<NestedOutlineItem[]>>,
  isEditing: Ref<boolean>,
  previewPanel: Ref<HTMLElement | null>,
  editorPanel: Ref<HTMLTextAreaElement | null>,
  outlinePanel: Ref<HTMLElement | null>,
  options: { useWindowScroll?: boolean } = {}
) {
  const activeAnchorId = ref<string | null>(null); // 当前激活的锚点 ID
  let anchorElements: HTMLElement[] = []; // 预览区中所有锚点元素的集合
  const lineHeight = ref(0); // 编辑器中单行文本的高度
  let editorScrollTimer: number | null = null; // 用于编辑器滚动的 requestAnimationFrame ID

  // 更新预览区中的锚点元素列表
  const updateAnchorElements = () => {
    // 获取所有带有ID的标题元素，并按照它们在文档中的位置排序
    const container = options.useWindowScroll ? document : previewPanel.value;
    if (!container) return;
    
    // 使用querySelectorAll选择所有h1-h6标题，不仅仅是那些在大纲中的
    // 这确保了即使某些标题没有被添加到大纲中，我们仍然可以捕获它们
    const headings = Array.from(container.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'))
      .filter((el): el is HTMLElement => el instanceof HTMLElement);
    
    // 按照它们在文档中的位置排序
    anchorElements = headings.sort((a, b) => {
      const posA = a.getBoundingClientRect().top;
      const posB = b.getBoundingClientRect().top;
      return posA - posB;
    });
    
    // 调试日志，帮助识别问题
    console.log('Found anchor elements:', anchorElements.map(el => ({ 
      id: el.id, 
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 20) 
    })));
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
            
            // Check if element is within the visible viewport of the container
            const isVisible = 
              elementRect.top >= containerRect.top && 
              elementRect.bottom <= containerRect.bottom;
            
            if (!isVisible) {
                linkElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
  });

  // 设置预览区的滚动监听器
  const setupPreviewScroll = () => {
    const scrollContainer = options.useWindowScroll ? window : previewPanel.value;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    onUnmounted(() => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    });
  };

  const handleScroll = () => {
    if (isEditing.value || !anchorElements || anchorElements.length === 0) return;

    if (options.useWindowScroll) {
      // --- Logic for WINDOW SCROLL (Student View) ---

      // Edge case: If scrolled to the absolute bottom of the page.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
        const lastElementId = anchorElements[anchorElements.length - 1].id;
        if (activeAnchorId.value !== lastElementId) {
          activeAnchorId.value = lastElementId;
        }
        return;
      }

      // 使用更精确的激活线，位于视窗的上部
      const activeLine = window.innerHeight * 0.2; // 视窗高度的20%处
      
      // 查找第一个位于激活线下方的元素
      let activeElement = null;
      for (let i = 0; i < anchorElements.length; i++) {
        const el = anchorElements[i];
        const rect = el.getBoundingClientRect();
        
        // 如果元素顶部位于激活线下方，则它是第一个可能的候选
        if (rect.top > activeLine) {
          // 我们找到了第一个在激活线下方的元素
          // 所以前一个元素应该是当前活跃的（如果存在的话）
          activeElement = i > 0 ? anchorElements[i - 1] : null;
          break;
        }
      }
      
      // 如果没有找到任何在激活线下方的元素，则最后一个元素是活跃的
      if (!activeElement && anchorElements.length > 0) {
        activeElement = anchorElements[anchorElements.length - 1];
      }
      
      const newActiveId = activeElement ? activeElement.id : null;
      if (activeAnchorId.value !== newActiveId) {
        activeAnchorId.value = newActiveId;
        console.log('Active anchor changed to:', newActiveId);
      }
    } else {
      // --- Logic for PANEL SCROLL (Teacher View) ---
      // 使用相同的改进逻辑，但针对面板滚动
      const container = previewPanel.value;
      if (!container) return;

      // Edge case: scrolled to the bottom of the container.
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
        const lastElementId = anchorElements[anchorElements.length - 1].id;
        if (activeAnchorId.value !== lastElementId) {
          activeAnchorId.value = lastElementId;
        }
        return;
      }

      // 使用更精确的激活线，位于容器的上部
      const containerTop = container.getBoundingClientRect().top;
      const activeLine = containerTop + container.clientHeight * 0.2;
      
      // 查找第一个位于激活线下方的元素
      let activeElement = null;
      for (let i = 0; i < anchorElements.length; i++) {
        const el = anchorElements[i];
        const rect = el.getBoundingClientRect();
        
        if (rect.top > activeLine) {
          activeElement = i > 0 ? anchorElements[i - 1] : null;
          break;
        }
      }
      
      if (!activeElement && anchorElements.length > 0) {
        activeElement = anchorElements[anchorElements.length - 1];
      }
      
      const newActiveId = activeElement ? activeElement.id : null;
      if (activeAnchorId.value !== newActiveId) {
        activeAnchorId.value = newActiveId;
      }
    }
  };

  return {
    activeAnchorId,
    updateAnchorElements,
    scrollToAnchor,
    setupPreviewScroll,
  };
} 
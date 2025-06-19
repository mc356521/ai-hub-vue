import { ref, computed, Ref } from 'vue';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

// 定义一个函数，用于将字符串转换为 URL 安全的 slug
const slugify = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/[?？,，。.]/g, '');

// 初始化 markdown-it 实例，并使用 anchor 插件
const md = new MarkdownIt().use(markdownItAnchor, { 
  level: [1, 2, 3, 4, 5, 6], // 为 1-6 级标题添加锚点
  slugify: slugify, // 使用自定义的 slugify 函数
  permalink: markdownItAnchor.permalink.ariaHidden({
    placement: 'before', // 在标题前添加链接
    symbol: '' // 不显示符号
  })
});

// 大纲条目的接口定义
export interface OutlineItem {
  level: number; // 标题级别 (h1, h2, etc.)
  content: string; // 标题内容
  id: string; // 锚点 ID
  lineNumber: number; // 在 markdown 源文件中的行号
}

// 包含子项的嵌套大纲条目接口定义
export interface NestedOutlineItem extends OutlineItem {
  children: NestedOutlineItem[]; // 子标题列表（修改为NestedOutlineItem以支持多级嵌套）
}

/**
 * Composable 函数，用于处理 Markdown 的解析和渲染。
 * @param markdownContent - 一个包含 Markdown 字符串的 ref
 * @returns - 包含大纲、渲染后的 HTML 和解析函数的对象
 */
export function useMarkdownProcessor(markdownContent: Ref<string>) {
  // 存储解析后的大纲结构
  const outline = ref<NestedOutlineItem[]>([]);

  // 解析 Markdown 内容以生成大纲
  const parseOutline = () => {
    const tokens = md.parse(markdownContent.value, {});
    const result: NestedOutlineItem[] = [];
    
    // 记录当前处理的各级标题节点
    const currentHeadings: { [key: number]: NestedOutlineItem } = {};
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substring(1), 10);
        const content = tokens[i + 1]?.content ?? '';
        
        // 从 token 属性中获取由 markdown-it-anchor 生成的 ID
        const id = token.attrGet('id') || slugify(content);
        const lineNumber = token.map ? token.map[0] : 0;

        if (!id) continue;

        const newItem: NestedOutlineItem = { 
          level, 
          content, 
          id, 
          lineNumber,
          children: [] 
        };

        // 处理不同级别标题的逻辑
        if (level === 1) {
          // h1 是顶级标题，直接添加到结果数组中
          result.push(newItem);
          currentHeadings[1] = newItem;
          // 清除更深层级的引用
          for (let l = 2; l <= 6; l++) {
            delete currentHeadings[l];
          }
        } else {
          // 对于非 h1 标题，找到它的父级标题
          let parentLevel = level - 1;
          while (parentLevel >= 1 && !currentHeadings[parentLevel]) {
            parentLevel--;
          }

          if (parentLevel >= 1 && currentHeadings[parentLevel]) {
            // 将当前标题添加到其父级标题的 children 数组中
            currentHeadings[parentLevel].children.push(newItem);
            // 更新当前级别的标题引用
            currentHeadings[level] = newItem;
            // 清除更深层级的引用
            for (let l = level + 1; l <= 6; l++) {
              delete currentHeadings[l];
            }
          } else {
            // 如果没有找到父级标题，则作为顶级项添加
            // 之前的代码只处理了h2的特殊情况，现在处理所有级别
            result.push(newItem);
            currentHeadings[level] = newItem;
          }
        }
        
        // 跳过 inline 和 heading_close 标记
        i += 2; 
      }
    }
    outline.value = result;
  };

  // 计算属性，用于将 Markdown 渲染为 HTML
  const renderedHtml = computed(() => {
    if (!markdownContent.value) {
      return '<span class="text-sm text-gray-400">正在加载内容...</span>';
    }
    return md.render(markdownContent.value);
  });

  return {
    outline,
    renderedHtml,
    parseOutline
  };
} 
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
  children: OutlineItem[]; // 子标题列表
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
    let currentH1: NestedOutlineItem | null = null; // 用于跟踪当前的一级标题

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === 'heading_open') {
        const level = parseInt(token.tag.substring(1), 10);
        const content = tokens[i + 1]?.content ?? '';
        
        // 从 token 属性中获取由 markdown-it-anchor 生成的 ID
        const id = token.attrGet('id') || slugify(content);
        const lineNumber = token.map ? token.map[0] : 0;

        if (!id) continue;

        const newItem: OutlineItem = { level, content, id, lineNumber };
        if (level === 1) {
          const nestedItem: NestedOutlineItem = { ...newItem, children: [] };
          result.push(nestedItem);
          currentH1 = nestedItem;
        } else if (currentH1 && level > 1) {
          // 将 h2-h6 添加为当前 h1 的子项
          currentH1.children.push(newItem);
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
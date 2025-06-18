import { ref, watch, Ref, nextTick } from 'vue';
import { getCourseContent, updateCourseContent } from '@/services/courseService';

/**
 * Composable 函数，用于管理课程内容的获取、保存和状态。
 * @param courseId - 包含当前课程 ID 的 ref。
 * @param onContentLoaded - 内容加载或更新后执行的回调函数。
 */
export function useCourseContent(
  courseId: Ref<number | null>, 
  onContentLoaded: () => void
) {
  // 响应式状态
  const markdownContent = ref(''); // 原始 Markdown 内容
  const isSaving = ref(false); // 是否正在保存
  const editableContent = ref(''); // 用于编辑器绑定的可编辑内容

  // 从服务器获取课程内容
  const fetchContent = async (id: number) => {
    try {
      const content = await getCourseContent(id);
      if (typeof content === 'string') {
        markdownContent.value = content;
        editableContent.value = content;
      } else {
        throw new Error('收到的内容不是有效的字符串。');
      }
      onContentLoaded(); // 内容加载成功后调用回调
    } catch (error) {
      console.error('获取课程内容失败:', error);
      markdownContent.value = '# 加载失败\n\n无法获取课程内容，请检查网络连接或联系管理员。';
      onContentLoaded(); // 即使失败也要调用回调，以更新UI状态
    }
  };

  // 保存更新后的课程内容
  const saveContent = async () => {
    if (!courseId.value) return;
    isSaving.value = true;
    try {
      await updateCourseContent(courseId.value, editableContent.value);
      markdownContent.value = editableContent.value;
      await nextTick();
      onContentLoaded(); // 内容保存成功后调用回调
    } catch (error) {
      console.error('保存课程内容失败:', error);
      // 在这里可以向用户显示一个通知
    } finally {
      isSaving.value = false;
    }
  };

  // 监视 courseId 的变化，并在变化时获取新的课程内容
  watch(courseId, (newCourseId) => {
    if (newCourseId) {
      fetchContent(newCourseId);
    }
  }, { immediate: true }); // immediate: true 确保在组件初始化时立即执行一次

  return {
    markdownContent,
    editableContent,
    isSaving,
    saveContent,
    fetchContent,
  };
} 
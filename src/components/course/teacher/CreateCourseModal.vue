<template>
  <Teleport to="body">
    <!-- 
      此组件实现了一个创建新课程的模态框界面。
      - 使用 v-if="visible" 控制模态框的显示与隐藏。
      - @click.self="closeModal" 允许用户点击背景遮罩来关闭模态框。
      - 整个模态框和其内容都应用了平滑的过渡动画效果。
    -->
    <div v-if="visible" @click.self="closeModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300" :class="visible ? 'opacity-100' : 'opacity-0 pointer-events-none'">
      <div class="bg-white rounded-lg shadow-card p-8 w-full max-w-lg transform transition-all duration-300" :class="visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-graphite-black">创建新课程</h2>
          <button @click="closeModal" class="p-1 text-gray-400 hover:text-graphite-black rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wisdom-blue">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <!-- 表单提交时触发 handleSubmit 方法 -->
        <form @submit.prevent="handleSubmit">
          <div class="space-y-6">
            <div>
              <label for="courseName" class="block text-sm font-medium text-gray-700">课程名称</label>
              <input v-model="courseData.title" type="text" id="courseName" name="courseName" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-wisdom-blue focus:border-wisdom-blue" placeholder="例如：现代Web开发实践" required>
            </div>
            <div>
              <label for="courseDescription" class="block text-sm font-medium text-gray-700">课程描述 <span class="text-gray-400">(可选)</span></label>
              <textarea v-model="courseData.description" id="courseDescription" name="courseDescription" rows="4" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-wisdom-blue focus:border-wisdom-blue" placeholder="简要介绍这门课程的目标和内容"></textarea>
            </div>
          </div>
          <div class="mt-8 pt-6 border-t border-gray-200 flex justify-end">
            <button type="button" @click="closeModal" class="px-6 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 mr-3">
              取消
            </button>
            <button type="submit" class="px-6 py-2 bg-wisdom-blue text-white rounded-md text-sm font-medium hover:bg-wisdom-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wisdom-blue">
              创建并开始设计
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue';

export default defineComponent({
  name: 'CreateCourseModal',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['update:visible', 'create'],
  setup(props, { emit }) {
    const courseData = reactive({
      title: '',
      description: '',
    });

    watch(() => props.visible, (newValue) => {
      if (newValue) {
        courseData.title = '';
        courseData.description = '';
      }
    });

    const closeModal = () => {
      emit('update:visible', false);
    };

    const handleSubmit = () => {
      if (courseData.title.trim()) {
        emit('create', { ...courseData });
        closeModal();
      }
    };

    // The template needs access to these, so they must be returned.
    return {
      courseData,
      closeModal,
      handleSubmit,
    };
  },
});
</script> 
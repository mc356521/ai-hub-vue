<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-graphite-black">学习任务管理</h2>
      <button class="px-4 py-2 bg-energy-cyan text-white rounded-md text-sm font-medium hover:bg-energy-cyan/90 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        新建任务
      </button>
    </div>
    <div class="space-y-4">
      <!-- Task Card Loop -->
      <div v-for="task in tasks" :key="task.id" class="bg-mist-white/50 rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-semibold ">{{ task.title }}</h3>
            <p class="text-sm text-quantum-gray mt-1">关联章节: {{ task.associatedChapter }}</p>
          </div>
          <span :class="getStatusClass(task.status)">
            {{ task.status === 'published' ? '已发布' : '草稿' }}
          </span>
        </div>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-sm text-quantum-gray/80">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            截止日期: {{ task.dueDate }}
          </div>
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            提交情况: {{ task.submissions }} / {{ task.totalStudents }} 人
          </div>
          <div class="flex items-center space-x-4 justify-self-end">
            <a href="#" class="font-medium text-energy-cyan hover:underline">查看详情</a>
            <a href="#" class="font-medium text-academic-gold hover:underline">编辑</a>
            <a href="#" class="font-medium text-red-500 hover:underline">删除</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// According to the project specification, this interface should be in `src/types/api.ts`.
// Placing it here as a temporary measure.
interface LearningTask {
  id: number;
  title: string;
  associatedChapter: string;
  status: 'published' | 'draft';
  dueDate: string;
  submissions: number;
  totalStudents: number;
}

const props = defineProps({
  courseId: {
    type: Number,
    required: true,
  },
  classId: {
    type: [Number, String], // Can be '' initially
    required: true,
  }
});

const tasks = ref<LearningTask[]>([]);

const getStatusClass = (status: 'published' | 'draft') => {
  const baseClass = 'text-xs font-medium px-2.5 py-1 rounded-full';
  if (status === 'published') {
    return `${baseClass} bg-eco-green/10 text-eco-green`;
  }
  return `${baseClass} bg-academic-gold/10 text-academic-gold`;
};

// Fetches tasks when the component is mounted or when its props change.
const fetchTasks = async () => {
  if (!props.courseId || !props.classId) {
    tasks.value = [];
    return;
  }
  console.log(`Fetching tasks for course ${props.courseId} and class ${props.classId}`);
  // This is mock data for demonstration purposes.
  // In a real application, you would call a service here to fetch data from the API.
  tasks.value = [
    {
      id: 1,
      title: '任务一：预习闭包概念',
      associatedChapter: '1.1 闭包的概念',
      status: 'published',
      dueDate: '2024-05-10',
      submissions: 45,
      totalStudents: 48,
    },
    {
      id: 2,
      title: '任务二：闭包应用场景分析',
      associatedChapter: '1.3 闭包的应用场景',
      status: 'draft',
      dueDate: '2024-05-15',
      submissions: 0,
      totalStudents: 48,
    }
  ];
};

onMounted(() => {
  fetchTasks();
});

watch([() => props.courseId, () => props.classId], () => {
  fetchTasks();
});

</script> 
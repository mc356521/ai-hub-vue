<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-graphite-black">我的课程</h1>
      <div class="flex items-center space-x-2">
        <div class="relative">
          <input v-model="searchQuery" type="text" placeholder="搜索课程..." class="pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-energy-cyan/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-quantum-gray/50 absolute left-3 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 课程筛选 -->
    <div class="mb-6 flex space-x-2">
      <button 
        @click="currentFilter = 'all'" 
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium',
          currentFilter === 'all' ? 'bg-energy-cyan text-white' : 'border text-quantum-gray hover:bg-gray-50'
        ]">
        全部课程
      </button>
      <button 
        @click="currentFilter = 'in-progress'" 
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium',
          currentFilter === 'in-progress' ? 'bg-energy-cyan text-white' : 'border text-quantum-gray hover:bg-gray-50'
        ]">
        进行中
      </button>
      <button 
        @click="currentFilter = 'completed'" 
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium',
          currentFilter === 'completed' ? 'bg-energy-cyan text-white' : 'border text-quantum-gray hover:bg-gray-50'
        ]">
        已完成
      </button>
      <button 
        @click="currentFilter = 'not-started'" 
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium',
          currentFilter === 'not-started' ? 'bg-energy-cyan text-white' : 'border text-quantum-gray hover:bg-gray-50'
        ]">
        未开始
      </button>
    </div>

    <!-- 加载与错误提示 -->
    <div v-if="isLoading" class="text-center py-10">
      <p>正在加载您的课程...</p>
    </div>
    <div v-else-if="error" class="text-center py-10 bg-red-50 border border-red-200 rounded-md">
      <p class="text-red-600 font-medium">课程加载失败</p>
      <p class="text-red-500 text-sm mt-1">{{ error }}</p>
    </div>

    <!-- 课程列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 课程卡片 -->
      <div v-for="course in filteredCourses" :key="course.id" class="bg-white rounded-lg shadow-card overflow-hidden course-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
        <div :class="['h-40 relative', course.gradientClass]">
          <div class="absolute inset-0 flex items-center justify-center">
            <component :is="course.icon" class="h-20 w-20 text-white opacity-20" />
          </div>
          <div class="absolute bottom-4 left-4 right-4">
            <h3 class="text-white text-xl font-bold">{{ course.name }}</h3>
            <p class="text-white/80 text-sm">{{ course.description }}</p>
          </div>
        </div>
        <div class="p-4">
          <div class="flex justify-between items-center mb-3">
            <div class="flex items-center">
              <img :src="course.teacher.avatar" class="h-8 w-8 rounded-full mr-2" />
              <span class="text-sm text-quantum-gray">{{ course.teacher.name }}</span>
            </div>
            <span :class="[
              'text-xs px-2 py-1 rounded',
              course.status === 'in-progress' ? 'bg-eco-green/10 text-eco-green' :
              course.status === 'completed' ? 'bg-academic-gold/10 text-academic-gold' :
              'bg-energy-cyan/10 text-energy-cyan'
            ]">
              {{ statusText(course.status) }}
            </span>
          </div>
          <div class="mb-4">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-quantum-gray/70">学习进度</span>
              <span class="text-quantum-gray">{{ course.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div :class="['h-2 rounded-full', course.progressBarClass]" :style="{width: `${course.progress}%`}"></div>
            </div>
          </div>
          <div class="flex justify-between">
            <button :class="[
              'px-3 py-1.5 rounded-md text-sm font-medium', 
              course.status === 'completed' ? 'bg-academic-gold/10 text-academic-gold hover:bg-academic-gold/20' :
              'bg-energy-cyan/10 text-energy-cyan hover:bg-energy-cyan/20'
            ]">
              {{ course.status === 'not-started' ? '开始学习' : course.status === 'completed' ? '复习课程' : '继续学习' }}
            </button>
            <router-link 
              :to="`/student/course/${course.id}`" 
              class="px-3 py-1.5 border border-gray-200 text-quantum-gray rounded-md text-sm font-medium hover:bg-gray-50">
              课程详情
            </router-link>
          </div>
        </div>
      </div>

      <!-- 加入新课程卡片 -->
      <div 
        @click="showJoinModal = true" 
        class="bg-white rounded-lg shadow-card overflow-hidden course-card border-2 border-dashed border-quantum-gray/20 flex items-center justify-center h-[277px] cursor-pointer hover:border-energy-cyan hover:text-energy-cyan transition-colors group">
        <div class="text-center">
          <div class="h-12 w-12 bg-energy-cyan/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-energy-cyan/20 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-energy-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p class="text-quantum-gray font-medium group-hover:text-energy-cyan transition-colors">加入新课程</p>
          <p class="text-quantum-gray/60 text-sm mt-1">使用老师提供的口令加入班级</p>
        </div>
      </div>
    </div>

    <!-- 加入课程模态框 -->
    <Teleport to="body">
      <div v-if="showJoinModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" @click.self="showJoinModal = false">
        <div class="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-3 border-b">
            <h3 class="text-lg font-semibold text-graphite-black">加入新课程</h3>
            <button @click="showJoinModal = false" class="cursor-pointer z-50 p-1">
              <svg class="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </button>
          </div>
          <div class="mt-4">
            <label for="courseCodeInput" class="block text-sm font-medium text-quantum-gray mb-2">请输入老师提供的班级口令:</label>
            <input 
              v-model="courseCode" 
              type="text" 
              id="courseCodeInput" 
              placeholder="例如: JS-ADV-23" 
              class="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-energy-cyan/50 font-mono tracking-widest"
              @keyup.enter="joinCourse">
            <p v-if="joinError" class="text-red-500 text-xs mt-1">口令无效，请重新输入。</p>
          </div>
          <div class="flex justify-end pt-4 mt-4 border-t">
            <button @click="joinCourse" class="px-6 py-2 bg-energy-cyan text-white rounded-md hover:bg-energy-cyan/90">确认加入</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getMyStudentCourses } from '@/services/courseService';
import type { StudentCourse, CourseCardData } from '@/types/api';

// 课程图标组件（使用内联SVG模板，方便在v-for中动态渲染）
const CodeIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>`
};

const DatabaseIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>`
};

const AlgorithmIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>`
};

const NetworkIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>`
};

const PythonIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>`
};

// 页面响应式状态
const searchQuery = ref('');
const currentFilter = ref('all');
const showJoinModal = ref(false);
const courseCode = ref('');
const joinError = ref(false);
const courses = ref<CourseCardData[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

// UI相关的辅助数据
const ICONS = [CodeIcon, DatabaseIcon, AlgorithmIcon, NetworkIcon, PythonIcon];
const GRADIENTS = [
  'bg-gradient-to-r from-wisdom-blue to-energy-cyan',
  'bg-gradient-to-r from-academic-gold to-eco-green',
  'bg-gradient-to-r from-aurora-purple to-wisdom-blue',
  'bg-gradient-to-r from-eco-green to-energy-cyan',
  'bg-gradient-to-r from-energy-cyan to-wisdom-blue'
];
const PROGRESS_BAR_COLORS = [
  'bg-wisdom-blue',
  'bg-academic-gold',
  'bg-aurora-purple',
  'bg-eco-green',
  'bg-energy-cyan'
];

/**
 * 将API返回的学生课程数据转换为UI展示所需的课程卡片数据
 * @param studentCourses - API返回的课程列表
 * @returns 可以在UI上渲染的课程卡片数据列表
 */
const mapCoursesToCardData = (studentCourses: StudentCourse[]): CourseCardData[] => {
  return studentCourses.map((course, index) => {
    // 将后端classStatus映射为前端UI状态
    let status: CourseCardData['status'] = 'not-started';
    switch (course.classStatus) {
      case 'active':
        status = 'in-progress';
        break;
      case 'finished':
        status = 'completed';
        break;
      case 'pending':
        status = 'not-started'; // 假设pending是未开始
        break;
    }

    const uiIndex = index % ICONS.length;

    return {
      id: course.courseId,
      name: course.courseTitle,
      description: course.courseDescription,
      teacher: {
        name: course.teacherName,
        avatar: course.teacherAvatar || `https://ui-avatars.com/api/?name=${course.teacherName}&background=random`
      },
      status: status,
      // TODO: 后续对接学习进度API
      progress: status === 'completed' ? 100 : (status === 'not-started' ? 0 : Math.floor(Math.random() * 80) + 10),
      gradientClass: GRADIENTS[uiIndex],
      progressBarClass: PROGRESS_BAR_COLORS[uiIndex],
      icon: ICONS[uiIndex]
    };
  });
};


const fetchCourses = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const studentCourses = await getMyStudentCourses();
    courses.value = mapCoursesToCardData(studentCourses);
  } catch (e: any) {
    console.error('获取学生课程失败:', e);
    error.value = e.message || '无法连接到服务器，请稍后重试。';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCourses();
});

// 有效的课程口令 - 示例数据，实际应用中应由后端API进行验证
const validCodes = ['JS-ADV-23', 'PY-BAS-22', 'DB-PRI-23', 'ALG-BAS-22'];

// 计算属性：根据搜索条件和状态筛选器动态过滤课程列表
const filteredCourses = computed(() => {
  let result = courses.value;
  
  // 搜索过滤：如果搜索查询非空，则过滤课程
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(course => 
      course.name.toLowerCase().includes(query) || 
      course.description.toLowerCase().includes(query) ||
      course.teacher.name.toLowerCase().includes(query)
    );
  }
  
  // 状态过滤：如果筛选器不是'all'，则按课程状态过滤
  if (currentFilter.value !== 'all') {
    result = result.filter(course => course.status === currentFilter.value);
  }
  
  return result;
});

/**
 * @function statusText
 * @description 将课程状态标识符转换为用户友好的中文字符串
 * @param {string} status - 课程状态标识符 ('in-progress', 'completed', 'not-started')
 * @returns {string} 对应的中文状态名
 */
const statusText = (status: string) => {
  switch (status) {
    case 'in-progress':
      return '进行中';
    case 'completed':
      return '已完成';
    case 'not-started':
      return '未开始';
    case 'pending':
      return '待处理'; // 虽然我们映射成了 'not-started'，但为未来扩展保留
    default:
      return '';
  }
};

// 处理加入课程的逻辑
const joinCourse = () => {
  // 对输入值进行 trim 和大小写转换，以提高匹配成功率
  const enteredCode = courseCode.value.trim().toUpperCase();
  if (validCodes.includes(enteredCode)) {
    // TODO: 实际应用中，这里会调用API服务，将当前用户加入指定课程/班级
    alert('成功加入课程！');
    showJoinModal.value = false; // 关闭模态框
    courseCode.value = ''; // 清空输入框
    joinError.value = false; // 重置错误状态
  } else {
    joinError.value = true; // 设置错误状态，UI将显示错误提示
  }
};
</script>

<style scoped>
.course-card {
  transition: all 0.3s ease;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 24px rgba(37, 99, 235, 0.12);
}
</style> 
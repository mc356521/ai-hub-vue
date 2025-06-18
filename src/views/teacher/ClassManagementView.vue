<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-graphite-black">班级管理</h1>
      <router-link to="/create-class" class="px-4 py-2 bg-wisdom-blue text-white rounded-md text-sm font-medium hover:bg-wisdom-blue/90 active:bg-wisdom-blue/80 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg> 新建班级
      </router-link>
    </div>

    <!-- 班级管理选项卡 -->
    <div class="mb-6">
      <div class="bg-white rounded-lg shadow-card">
        <div class="border-b border-gray-200">
          <div class="flex">
            <button 
              @click="activeTab = 'my-classes'" 
              :class="['px-6 py-3 border-b-2 font-medium', activeTab === 'my-classes' ? 'border-wisdom-blue text-wisdom-blue' : 'border-transparent text-quantum-gray hover:text-wisdom-blue']">
              我的班级
            </button>
            <button 
              @click="activeTab = 'archived-classes'" 
              :class="['px-6 py-3 border-b-2 font-medium', activeTab === 'archived-classes' ? 'border-wisdom-blue text-wisdom-blue' : 'border-transparent text-quantum-gray hover:text-wisdom-blue']">
              归档班级
            </button>
          </div>
        </div>

        <div class="p-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex-1 min-w-[200px]">
              <label for="termFilter" class="block text-xs font-medium text-quantum-gray mb-1">学期</label>
              <select v-model="filters.term" id="termFilter" class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
                <option value="all">全部学期</option>
                <option v-for="semester in relevantSemesters" :key="semester.id" :value="semester.id">{{ semester.name }}</option>
              </select>
            </div>

            <div class="flex-1 min-w-[200px]">
              <label for="courseFilter" class="block text-xs font-medium text-quantum-gray mb-1">课程</label>
              <select v-model="filters.course" id="courseFilter" class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
                <option value="all">全部课程</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
              </select>
            </div>

            <div class="flex-1 min-w-[200px]">
              <label for="statusFilter" class="block text-xs font-medium text-quantum-gray mb-1">状态</label>
              <select v-model="filters.status" id="statusFilter" class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
                <option value="all">全部状态</option>
                <option value="active">进行中</option>
                <option value="pending">未开始</option>
                <option value="finished">已结课</option>
              </select>
            </div>

            <div class="flex-1 min-w-[200px] relative">
              <label for="searchClass" class="block text-xs font-medium text-quantum-gray mb-1">搜索</label>
              <input v-model="filters.search" type="text" id="searchClass" placeholder="搜索班级名称" class="w-full px-3 py-2 pl-9 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-quantum-gray/50 absolute bottom-2.5 left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center p-8">
      <p>正在加载班级数据...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center p-8 bg-red-50 text-red-600 rounded-lg">
      <p>加载失败：{{ error }}</p>
      <button @click="fetchData" class="mt-4 px-4 py-2 bg-red-500 text-white rounded-md">重试</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredClasses.length === 0" class="text-center p-8 border-2 border-dashed rounded-lg">
      <p>没有找到符合条件的班级。</p>
    </div>

    <!-- 班级列表 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div v-for="classItem in filteredClasses" :key="classItem.id" class="bg-white rounded-lg shadow-card overflow-hidden">
        <div class="p-5 border-b border-gray-200">
          <div class="flex justify-between">
            <h3 class="text-lg font-semibold text-graphite-black">{{ classItem.name }}</h3>
            <span :class="['text-xs px-2 py-1 rounded-full', classStatus(classItem.status).class]">
              {{ classStatus(classItem.status).text }}
            </span>
          </div>
          <p class="text-sm text-quantum-gray mt-1">{{ classItem.courseName }}</p>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-quantum-gray/70 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm text-quantum-gray">{{ classItem.startDate }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-100">
            <p class="text-xs text-quantum-gray/70 mb-1">班级口令</p>
            <div class="flex items-center justify-between bg-mist-white p-2 rounded-md">
              <span class="font-mono text-sm text-wisdom-blue font-semibold tracking-widest">{{ classItem.classCode }}</span>
              <button @click="copyCode(classItem.classCode)" class="p-1.5 text-quantum-gray/60 hover:text-wisdom-blue rounded-full hover:bg-wisdom-blue/10" title="复制口令">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <div class="flex justify-between items-center mt-4">
            <div>
              <!-- Avatar section removed as it's not in the API response -->
            </div>
            <div>
              <button class="text-wisdom-blue hover:underline text-sm">管理班级</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 新建班级卡片 -->
      <router-link to="/create-class" class="bg-white rounded-lg shadow-card overflow-hidden border-2 border-dashed border-quantum-gray/20 flex items-center justify-center h-[242px] hover:border-wisdom-blue hover:text-wisdom-blue transition-colors group">
        <div class="text-center">
          <div class="h-12 w-12 bg-wisdom-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-wisdom-blue/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-wisdom-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p class="font-medium">新建班级</p>
          <p class="text-sm mt-1 text-current/60">创建新的班级</p>
        </div>
      </router-link>
    </div>

    <!-- 近期活动 -->
    <div class="bg-white rounded-lg shadow-card p-6">
      <h2 class="text-lg font-semibold text-graphite-black mb-4">近期班级活动</h2>
      <div class="space-y-4">
        <div v-for="activity in recentActivities" :key="activity.id" class="flex items-start pb-4 border-b border-gray-100 last:border-b-0">
          <div :class="['p-2 rounded-full mr-3', activity.icon.bgColor]">
            <component :is="activity.icon.component" :class="['h-5 w-5', activity.icon.color]" />
          </div>
          <div class="flex-1">
            <div class="flex justify-between">
              <p class="text-sm font-medium text-graphite-black">{{ activity.title }}</p>
              <span class="text-xs text-quantum-gray/70">{{ activity.time }}</span>
            </div>
            <p class="text-xs text-quantum-gray mt-1">{{ activity.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { getClasses } from '@/services/classService';
import { getMyCourses } from '@/services/courseService';
import { getSemesters } from '@/services/semesterService';
import type { ClassesEntity, Courses, Semester } from '@/types/api';

const activeTab = ref('my-classes');
const filters = reactive({
  term: 'all',
  course: 'all',
  status: 'all',
  search: '',
});

const classes = ref<ClassesEntity[]>([]);
const courses = ref<Courses[]>([]);
const semesters = ref<Semester[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const relevantSemesters = computed(() => {
  if (!classes.value.length || !semesters.value.length) {
    return [];
  }
  // Get all unique semester IDs from the classes list
  const usedSemesterIds = new Set(classes.value.map(c => c.semesterId).filter(id => id !== undefined));
  // Filter the full semesters list to only include those that are used
  return semesters.value.filter(semester => usedSemesterIds.has(semester.id));
});

const courseMap = computed(() => {
  return new Map(courses.value.map(course => [course.id, course.title]));
});

const enrichedClasses = computed(() => {
  return classes.value.map(c => ({
    ...c,
    courseName: c.courseId !== undefined ? (courseMap.value.get(c.courseId) || '未知课程') : '未关联课程',
    startDate: new Date(c.createTime).toLocaleDateString()
  }));
});

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [classesRes, coursesRes, semestersRes] = await Promise.all([
      getClasses(),
      getMyCourses(),
      getSemesters()
    ]);

    // The interceptor might return the data array directly, so we handle both cases.
    const classesData = Array.isArray(classesRes) ? classesRes : classesRes.data;
    if (classesData) {
      classes.value = classesData;
    } else {
      console.warn('获取班级列表失败或无数据:', classesRes);
      classes.value = [];
    }

    const coursesData = Array.isArray(coursesRes) ? coursesRes : coursesRes.data;
    if (coursesData) {
      courses.value = coursesData;
    } else {
      console.warn('获取课程列表失败或无数据:', coursesRes);
      courses.value = [];
    }
    
    const semestersData = Array.isArray(semestersRes) ? semestersRes : semestersRes.data;
    if (semestersData) {
      semesters.value = semestersData;
    } else {
      console.warn('获取学期列表失败或无数据:', semestersRes);
      semesters.value = [];
    }

  } catch (e: any) {
    error.value = e.message || '网络请求错误';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const filteredClasses = computed(() => {
  return enrichedClasses.value.filter(c => {
    const searchLower = filters.search.toLowerCase();
    const isArchived = activeTab.value === 'archived-classes';

    const statusInCurrentTab = isArchived
      ? c.status === 'archived'
      : c.status !== 'archived';

    if (!statusInCurrentTab) {
      return false;
    }
    
    if (!c.name.toLowerCase().includes(searchLower)) {
      return false;
    }

    if (filters.status !== 'all' && c.status !== filters.status) {
      return false;
    }

    if (filters.course !== 'all') {
      if (c.courseId === undefined || c.courseId !== Number(filters.course)) {
        return false;
      }
    }
    
    if (filters.term !== 'all') {
      if (c.semesterId === undefined || c.semesterId !== Number(filters.term)) {
        return false;
      }
    }

    return true;
  });
});

const classStatus = (status: 'pending' | 'active' | 'finished' | 'archived') => {
  switch (status) {
    case 'active': return { text: '进行中', class: 'bg-eco-green/10 text-eco-green' };
    case 'finished': return { text: '已结课', class: 'bg-academic-gold/10 text-academic-gold' };
    case 'pending': return { text: '未开始', class: 'bg-energy-cyan/10 text-energy-cyan' };
    case 'archived': return { text: '已归档', class: 'bg-quantum-gray/10 text-quantum-gray' };
    default: return { text: '未知', class: 'bg-gray-100 text-gray-800' };
  }
};

const copyCode = async (code: string | undefined) => {
  if (!code) {
    alert('班级口令不存在!');
    return;
  }
  try {
    await navigator.clipboard.writeText(code);
    alert(`班级口令 "${code}" 已复制到剪贴板!`);
  } catch (err) {
    alert('复制失败!');
  }
};

const AddIcon = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>` };
const ExamIcon = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>` };
const CheckIcon = { template: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>` };

const recentActivities = ref([
  { id: 1, title: '2023级数据库班创建成功', time: '2小时前', description: '您创建了新班级"2023级数据库班"，共有45名学生。', icon: { component: AddIcon, bgColor: 'bg-wisdom-blue/10', color: 'text-wisdom-blue' } },
  { id: 2, title: 'JavaScript期中考试发布', time: '昨天', description: '您向"2023级前端班"发布了JavaScript期中考试。', icon: { component: ExamIcon, bgColor: 'bg-academic-gold/10', color: 'text-academic-gold' } },
  { id: 3, title: '2022级算法班课程结束', time: '3天前', description: '您的"2022级算法班"课程已结束，平均成绩为85分。', icon: { component: CheckIcon, bgColor: 'bg-eco-green/10', color: 'text-eco-green' } },
]);

</script> 
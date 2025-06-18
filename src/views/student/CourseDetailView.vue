<template>
  <div >
    <CourseDetailHeader :title="course.title" :subtitle="course.subtitle" />

    <div class="bg-white rounded-lg shadow-card mt-6">
      <CourseTabs :tabs="tabs" :active-tab="activeTab" @tab-change="activeTab = $event" />
      <div class="p-6">
        <component :is="activeTabComponent" :course="course" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, h } from 'vue';
import { useRoute } from 'vue-router';
import type { CourseDetails } from '@/types/api';

// 使用 defineAsyncComponent 进行组件的异步（懒）加载。
// 这不仅可以优化初始加载性能，还有助于解决在某些开发环境中出现的模块循环依赖或类型推断问题。
const CourseDetailHeader = defineAsyncComponent(() => import('@/components/course/CourseDetailHeader.vue'));
const CourseTabs = defineAsyncComponent(() => import('@/components/course/CourseTabs.vue'));
const CourseChapters = defineAsyncComponent(() => import('@/components/course/CourseChapters.vue'));
const LearningTasks = defineAsyncComponent(() => import('@/components/course/LearningTasks.vue'));
const DiscussionForum = defineAsyncComponent(() => import('@/components/course/DiscussionForum.vue'));
const Assignments = defineAsyncComponent(() => import('@/components/course/Assignments.vue'));
const OnlineExams = defineAsyncComponent(() => import('@/components/course/OnlineExams.vue'));
const CourseMaterials = defineAsyncComponent(() => import('@/components/course/CourseMaterials.vue'));


// --- 图标组件 ---
// 使用Vue的h函数（渲染函数）以编程方式创建轻量级的SVG图标组件。
// 这样做可以避免为每个小图标都创建一个单独的.vue文件，保持项目整洁。
const IconChapters = { render: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'stroke-width': 2 }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M4 6h16M4 10h16M4 14h16M4 18h16" })]) };
const IconTasks = { render: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'stroke-width': 2 }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" })]) };
const IconDiscussions = { render: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'stroke-width': 2 }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" })]) };
const IconAssignments = { render: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'stroke-width': 2 }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" })]) };
const IconExams = { render: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'stroke-width': 2 }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" })]) };
const IconMaterials = { render: () => h('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", 'stroke-width': 2 }, [h('path', { 'stroke-linecap': "round", 'stroke-linejoin': "round", d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" })]) };

// --- 模拟数据 ---
// 在实际应用中，这些数据应该通过API从后端根据课程ID获取。
// 这里的索引签名 `[key: string]` 是为了让TypeScript允许我们通过变量 (courseId) 来访问属性。
const courseData: { [key: string]: CourseDetails } = {
  js: {
    title: 'JavaScript高级编程',
    subtitle: '前端开发核心技能',
    chapters: [
       {
      id: 'ch1', title: 'JavaScript核心概念', lessons: [
        { id: 'l1-1', title: '作用域与作用域链', type: 'document', duration: '15 分钟', status: 'completed', content: `<h1 class="text-2xl font-bold mb-4">1.1 作用域与作用域链</h1><p>在JavaScript中，作用域是代码中定义变量的区域。它决定了变量和函数的可访问性。主要有两种类型的作用域：全局作用域和局部作用域。</p><img src="https://via.placeholder.com/800x400?text=Scope+Chain+Diagram" class="rounded-lg shadow-md my-4" /><p>当代码在一个作用域中查找变量时，如果找不到，它会向外层作用域查找，直到找到全局作用域为止。这个查找过程形成的链条就是作用域链。</p>` },
        { id: 'l1-2', title: '闭包的原理与应用', type: 'document', duration: '20 分钟', status: 'completed', content: `<h1 class="text-2xl font-bold mb-4">1.2 闭包的原理与应用</h1><h2 class="text-xl font-semibold mb-2 mt-4">闭包的概念</h2><p class="mb-4">闭包（Closure）是JavaScript中一个重要的概念，它指的是函数和声明该函数的词法环境的组合。简单来说，闭包允许函数访问并操作函数外部的变量，即使在其原始作用域之外执行。</p><div class="bg-gray-800 text-white p-4 rounded-md mb-4"><pre><code class="language-js">function createCounter() {\n    let count = 0;\n    return function() {\n        count += 1;\n        return count;\n    };\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2</code></pre></div>` },
        { id: 'l1-3', title: '原型与原型链', type: 'document', duration: '10 分钟', status: 'completed', content: `<h1 class="text-2xl font-bold mb-4">1.3 原型与原型链</h1><p>每个JavaScript对象都有一个私有属性 \`[[Prototype]]\`，它链接到另一个对象，我们称之为该对象的原型。</p>` },
      ]
    },
    {
      id: 'ch2', title: '异步编程与Promise', lessons: [
        { id: 'l2-1', title: '回调函数与事件循环', type: 'document', duration: '15 分钟', status: 'completed', content: `<h1>2.1 回调函数与事件循环</h1><p>事件循环是JavaScript并发模型的核心。</p>` },
        { id: 'l2-2', title: 'Promise详解', type: 'video', duration: '25 分钟', status: 'inprogress', content: `<h1>2.2 Promise详解</h1><div class="aspect-w-16 aspect-h-9"><iframe src="https://www.youtube.com/embed/DHvZLI7Db8E" frameborder="0" allowfullscreen class="rounded-lg shadow-md"></iframe></div>` },
        { id: 'l2-3', title: 'async/await语法糖', type: 'document', duration: '15 分钟', status: 'locked', content: `<h1>2.3 async/await语法糖</h1><p>async/await 是建立在 Promise 基础上的语法糖。</p>` },
      ]
    },
    {
      id: 'ch3', title: '模块化与工程化', lessons: [
        { id: 'l3-1', title: 'CommonJS规范', type: 'document', duration: '15 分钟', status: 'locked', content: '...' }
      ]
    },
    ],
  },
  // other courses...
};
// --- 模拟数据结束 ---


// 从Vue Router获取当前路由信息。
const route = useRoute();
// 创建一个计算属性来动态地从URL参数中获取课程ID，当URL变化时，它会自动更新。
const courseId = computed(() => route.params.id as string || 'js');

// TODO: 此处应用真实API调用替换模拟数据。
// 创建一个计算属性，根据从URL获取的courseId来返回对应的课程数据。
const course = computed(() => courseData[courseId.value] || courseData.js);

// 定义标签页的数据结构，包含key、显示文本和图标组件。
const tabs = [
  { key: 'chapters', label: '课程章节', icon: IconChapters },
  { key: 'tasks', label: '学习任务', icon: IconTasks },
  { key: 'discussions', label: '互动讨论', icon: IconDiscussions },
  { key: 'assignments', label: '作业提交', icon: IconAssignments },
  { key: 'exams', label: '在线考试', icon: IconExams },
  { key: 'materials', label: '课程资料', icon: IconMaterials },
];

// 使用ref来存储当前激活的标签页的key，默认为'chapters'。
const activeTab = ref('chapters');

// 这是一个计算属性，用于根据 activeTab 的值动态地决定应该渲染哪个组件。
// 这是实现标签页内容切换的核心逻辑。
const activeTabComponent = computed(() => {
  const map = {
    chapters: CourseChapters,
    tasks: LearningTasks,
    discussions: DiscussionForum,
    assignments: Assignments,
    exams: OnlineExams,
    materials: CourseMaterials,
  };
  // 使用 'as keyof typeof map' 来告诉TypeScript activeTab.value 肯定是 map 对象中的一个键。
  return map[activeTab.value as keyof typeof map];
});

</script> 
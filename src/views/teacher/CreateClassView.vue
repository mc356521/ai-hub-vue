<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-graphite-black">新建班级</h1>
      <p class="text-quantum-gray/70">填写班级信息以创建一个新的班级</p>
    </div>

    <div class="bg-white rounded-lg shadow-card p-6 max-w-2xl mx-auto">
      <form @submit.prevent="submitForm">
        <div class="space-y-6">
          <!-- Class Name -->
          <div>
            <label for="className" class="block text-sm font-medium text-quantum-gray mb-1">班级名称</label>
            <input v-model="classData.name" type="text" id="className" placeholder="例如：2024级软件工程一班" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
          </div>
          
          <!-- Course Selection -->
          <div>
            <label for="course" class="block text-sm font-medium text-quantum-gray mb-1">关联课程</label>
            <select v-model="classData.courseId" id="course" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
              <option disabled :value="null">请选择一个课程</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
            </select>
          </div>

          <!-- Semester Selection -->
          <div>
            <label for="semester" class="block text-sm font-medium text-quantum-gray mb-1">所属学期</label>
            <select v-model="classData.semesterId" id="semester" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50">
              <option disabled :value="null">请选择一个学期</option>
              <option v-for="semester in semesters" :key="semester.id" :value="semester.id">{{ semester.name }}</option>
            </select>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-8 pt-4 border-t flex justify-end space-x-3">
          <router-link to="/classes" class="px-4 py-2 bg-white border border-gray-300 text-quantum-gray rounded-md text-sm font-medium hover:bg-gray-50">
            取消
          </router-link>
          <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-wisdom-blue text-white rounded-md text-sm font-medium hover:bg-wisdom-blue/90 disabled:opacity-50">
            {{ isSubmitting ? '创建中...' : '确认创建' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getMyCourses } from '@/services/courseService';
import { getSemesters } from '@/services/semesterService';
import { createClass } from '@/services/classService';
import type { Courses, Semester, ClassesRequest } from '@/types/api';

const router = useRouter();

const classData = reactive({
  name: '',
  courseId: null as number | null,
  semesterId: null as number | null,
  status: 'pending' as const,
});

const courses = ref<Courses[]>([]);
const semesters = ref<Semester[]>([]);
const isSubmitting = ref(false);

const fetchPrerequisites = async () => {
  try {
    const [courseRes, semesterRes] = await Promise.all([
      getMyCourses(),
      getSemesters(),
    ]);

    const coursesData = Array.isArray(courseRes) ? courseRes : courseRes.data;
    if (coursesData) {
        courses.value = coursesData;
    } else {
        console.error("Failed to get courses or data is empty:", courseRes);
        courses.value = [];
    }

    const semestersData = Array.isArray(semesterRes) ? semesterRes : semesterRes.data;
    if (semestersData) {
        semesters.value = semestersData;
    } else {
        console.error("Failed to get semesters or data is empty:", semesterRes);
        semesters.value = [];
    }
  } catch (error) {
    console.error("Failed to fetch prerequisites:", error);
    alert('获取课程或学期列表失败！');
  }
};

onMounted(fetchPrerequisites);

const submitForm = async () => {
  if (!classData.name || classData.semesterId === null) {
    alert('请填写所有必填项！');
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: ClassesRequest = {
      name: classData.name,
      semesterId: Number(classData.semesterId),
      status: classData.status,
    };
    if (classData.courseId !== null) {
      payload.courseId = Number(classData.courseId);
    }

    const response = await createClass(payload);
    if (response) {
      alert('班级创建成功！');
      router.push('/classes');
    } else {
      throw new Error('创建失败，未收到有效响应');
    }
  } catch (error: any) {
    console.error("Failed to create class:", error);
    alert(`创建班级失败: ${error.message || '未知错误'}`);
  } finally {
    isSubmitting.value = false;
  }
};
</script> 
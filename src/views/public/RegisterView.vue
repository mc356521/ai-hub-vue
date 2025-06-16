<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-mist-white text-graphite-black">
    <div class="max-w-md w-full bg-white/80 backdrop-blur-[8px] rounded-xl shadow-card overflow-hidden">
      <div class="px-6 sm:px-8 pt-8 pb-4">
        <div class="text-center mb-6">
          <div class="flex justify-center items-center mb-4">
            <span class="text-wisdom-blue text-4xl font-bold mr-2">AI</span>
            <span class="text-graphite-black text-2xl font-semibold">教学实训智能体</span>
          </div>
          <p class="text-quantum-gray/70 text-sm">注册账号 · 开启智能学习之旅</p>
        </div>

        <div class="mb-6">
          <div class="flex border-b border-gray-200">
            <button
              @click="activeTab = 'student'"
              :class="[
                'flex-1 py-3 text-center font-medium border-b-2',
                activeTab === 'student'
                  ? 'border-wisdom-blue text-wisdom-blue'
                  : 'border-transparent text-quantum-gray/70 hover:text-quantum-gray'
              ]"
            >
              学生注册
            </button>
            <button
              @click="activeTab = 'teacher'"
              :class="[
                'flex-1 py-3 text-center font-medium border-b-2',
                activeTab === 'teacher'
                  ? 'border-wisdom-blue text-wisdom-blue'
                  : 'border-transparent text-quantum-gray/70 hover:text-quantum-gray'
              ]"
            >
              教师注册
            </button>
          </div>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="space-y-4 mb-6">
            <div>
              <label for="username" class="block text-sm font-medium text-quantum-gray mb-1">用户名</label>
              <input v-model="formData.username" type="text" id="username" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="创建一个唯一的用户名">
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-quantum-gray mb-1">邮箱</label>
              <input v-model="formData.email" type="email" id="email" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="请输入有效的邮箱地址">
            </div>

            <div v-if="activeTab === 'student'">
              <label for="studentId" class="block text-sm font-medium text-quantum-gray mb-1">学号</label>
              <input v-model="formData.studentId" type="text" id="studentId" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="请输入您的学号">
            </div>

            <div v-if="activeTab === 'teacher'">
              <label for="teacherId" class="block text-sm font-medium text-quantum-gray mb-1">教师编号</label>
              <input v-model="formData.teacherId" type="text" id="teacherId" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="请输入您的教师编号">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-quantum-gray mb-1">密码</label>
              <input v-model="formData.password" type="password" id="password" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="设置8位以上的安全密码">
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-quantum-gray mb-1">确认密码</label>
              <input v-model="formData.confirmPassword" type="password" id="confirmPassword" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="再次输入密码">
            </div>

            <div class="flex items-center">
              <input v-model="formData.agreement" type="checkbox" id="agreement" class="h-4 w-4 text-wisdom-blue rounded border-gray-300 focus:ring-wisdom-blue/50">
              <label for="agreement" class="ml-2 text-sm text-quantum-gray">我已阅读并同意<a href="#" class="text-wisdom-blue hover:underline">服务条款</a>和<a href="#" class="text-wisdom-blue hover:underline">隐私政策</a></label>
            </div>
          </div>

          <button type="submit" @click="triggerParticleEffect" class="w-full py-3 bg-energy-cyan text-white font-medium rounded-md hover:bg-energy-cyan/90 focus:outline-none focus:ring-2 focus:ring-energy-cyan/50 relative overflow-hidden">
            注册账号
          </button>
        </form>
      </div>

      <div class="px-6 sm:px-8 py-4 bg-gray-50 text-center">
        <p class="text-sm text-quantum-gray/70">
          已有账号？ <router-link to="/login" class="text-wisdom-blue hover:underline">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../../services/authService';
import type { RegisterRequest } from '../../types/api';

const activeTab = ref<'student' | 'teacher'>('student');
const router = useRouter();
const errorMsg = ref<string | null>(null);

const formData = reactive({
  username: '',
  email: '',
  studentId: '',
  teacherId: '',
  password: '',
  confirmPassword: '',
  agreement: false,
});

const handleRegister = async () => {
  errorMsg.value = null; // Reset error message
  if (!validateForm()) {
    return;
  }

  const requestData: RegisterRequest = {
    username: formData.username,
    email: formData.email,
    password: formData.password,
    role: activeTab.value,
    userCode: activeTab.value === 'student' ? formData.studentId : formData.teacherId,
  };

  try {
    await register(requestData);
    // 注册成功，可以给一个提示，然后跳转到登录页
    alert('注册成功！即将跳转到登录页面。');
    router.push('/login');
  } catch (error: any) {
    console.error('注册失败:', error);
    errorMsg.value = error.message || '注册失败，请稍后重试。';
    alert(errorMsg.value);
  }
};

const validateForm = () => {
  const { username, email, password, confirmPassword, agreement } = formData;
  if (!username || !email || !password || !confirmPassword) {
    errorMsg.value = '请填写所有必填字段';
    alert(errorMsg.value);
    return false;
  }
  if (password.length < 8) {
    errorMsg.value = '密码长度不能少于8位';
    alert(errorMsg.value);
    return false;
  }
  if (password !== confirmPassword) {
    errorMsg.value = '两次输入的密码不一致';
    alert(errorMsg.value);
    return false;
  }
  if (!agreement) {
    errorMsg.value = '请阅读并同意服务条款和隐私政策';
    alert(errorMsg.value);
    return false;
  }
  return true;
};

const createParticle = (x: number, y: number, e: MouseEvent) => {
  const particle = document.createElement('span');
  particle.className = 'btn-particle';

  const size = Math.random() * 20 + 10;
  const xOffset = (Math.random() - 0.5) * 60;
  const yOffset = (Math.random() - 0.5) * 60;

  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  // 使用 pageX 和 pageY 结合 scroll aixo 来获得文档中的绝对位置
  particle.style.left = `${e.pageX + xOffset}px`;
  particle.style.top = `${e.pageY + yOffset}px`;


  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 800);
};

const triggerParticleEffect = (e: MouseEvent) => {
  // 仅在表单验证通过时触发
  if (!validateForm()) return;
  
  for (let i = 0; i < 5; i++) {
    createParticle(e.clientX, e.clientY, e);
  }
};
</script>

<style>
@keyframes particle-animation {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.btn-particle {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(0, 193, 212, 0.4);
  pointer-events: none;
  animation: particle-animation 0.8s ease-out forwards;
  z-index: 999;
}
</style> 
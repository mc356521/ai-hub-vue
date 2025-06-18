<template>
  <div class="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-mist-white" :class="{ 'dark-mode': isDarkMode }">
    <div class="stars" :class="{ active: isDarkMode }">
      <div v-for="n in 100" :key="n" class="star" :style="starStyles[n-1]"></div>
    </div>

    <div class="max-w-md w-full rounded-xl shadow-card overflow-hidden bg-white/70 backdrop-blur-lg">
      <div class="px-6 sm:px-8 pt-8 pb-4">
        <div class="text-center mb-6">
          <div class="flex justify-center items-center mb-4">
            <span class="text-wisdom-blue text-4xl font-bold mr-2 font-satoshi">AI</span>
            <span class="text-graphite-black text-2xl font-semibold font-satoshi">教学实训智能体</span>
          </div>
          <p class="text-quantum-gray/70 text-sm">智能备课 · 个性化学习 · 实时评测</p>
        </div>

        <div class="mb-6">
          <div class="flex border-b border-gray-200">
            <button @click="selectTab('student')" :class="getTabClass('student')">学生登录</button>
            <button @click="selectTab('teacher')" :class="getTabClass('teacher')">教师登录</button>
            <button @click="selectTab('admin')" :class="getTabClass('admin')">管理员</button>
          </div>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="space-y-4 mb-6">
            <div>
              <label for="username" class="block text-sm font-medium text-quantum-gray mb-1">用户名</label>
              <input v-model="username" type="text" id="username" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="请输入用户名或学号">
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-quantum-gray mb-1">密码</label>
              <input v-model="password" type="password" id="password" class="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-wisdom-blue/50" placeholder="请输入密码">
            </div>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <input type="checkbox" id="remember" class="h-4 w-4 text-wisdom-blue rounded border-gray-300 focus:ring-wisdom-blue/50">
                <label for="remember" class="ml-2 text-sm text-quantum-gray">记住我</label>
              </div>
              <a href="#" class="text-sm text-wisdom-blue hover:underline">忘记密码？</a>
            </div>
          </div>

          <button type="submit" class="w-full py-3 bg-energy-cyan text-white font-medium rounded-md hover:bg-energy-cyan/90 focus:outline-none focus:ring-2 focus:ring-energy-cyan/50 relative overflow-hidden">
            登录
          </button>
        </form>
      </div>

      <div class="px-6 sm:px-8 py-4 bg-gray-50 text-center">
        <p class="text-sm text-quantum-gray/70" @click="router.push('/register')">
          没有账号？ <a href="#" class="text-wisdom-blue hover:underline">注册新账号</a>
        </p>
      </div>
    </div>

    <div class="absolute bottom-4 right-4">
      <button @click="toggleDarkMode" class="p-2 rounded-full bg-quantum-gray/10 text-quantum-gray hover:bg-quantum-gray/20">
        <svg v-if="!isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, UserRole } from '../../store/user';
import { login } from '../../services/authService';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const activeTab = ref<UserRole>('student');
const isDarkMode = ref(false);
const errorMsg = ref<string | null>(null);

const starStyles = reactive<any[]>([]);

onMounted(() => {
  for (let i = 0; i < 100; i++) {
    starStyles.push({
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`
    });
  }
});

const selectTab = (tab: UserRole) => {
  activeTab.value = tab;
};

const getTabClass = (tab: UserRole) => {
  const baseClass = 'flex-1 py-3 text-center font-medium border-b-2';
  if (activeTab.value === tab) {
    return `${baseClass} border-wisdom-blue text-wisdom-blue`;
  }
  return `${baseClass} border-transparent text-quantum-gray/70 hover:text-quantum-gray`;
};

const handleLogin = async () => {
  errorMsg.value = null;
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码';
    alert(errorMsg.value);
    return;
  }

  try {
    const response = await login({
      username: username.value,
      password: password.value,
    });

    // 登录成功，调用 Pinia store action
    // 注意：这里的 activeTab 仅用于UI切换，实际角色应由后端返回
    // 为简化，我们暂时相信用户在UI上选择的角色
    userStore.login(username.value, activeTab.value, response.token);

    // 根据角色跳转到不同仪表盘
    if (activeTab.value === 'teacher') {
      router.push('/'); // TeacherLayout 默认路由
    } else if (activeTab.value === 'student') {
      router.push('/student/my-courses'); // 学生"我的课程"页面
    } else {
      // 管理员有其他路由
      router.push('/'); // 暂时跳到教师仪表盘
    }

  } catch (error: any) {
    console.error('登录失败:', error);
    errorMsg.value = error.message || '登录失败，请检查用户名或密码。';
    alert(errorMsg.value);
  }
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
};

</script>

<style scoped>
.dark-mode {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #F8FAFC;
}

.stars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0;
  transition: opacity 1s ease;
}

.stars.active {
  opacity: 1;
}

.star {
  position: absolute;
  background-color: #F8FAFC;
  border-radius: 50%;
  animation: twinkle 2s infinite alternate;
}

@keyframes twinkle {
  0% {
    opacity: 0.2;
  }
  100% {
    opacity: 1;
  }
}
</style> 
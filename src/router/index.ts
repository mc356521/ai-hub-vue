import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '../store/user';

// Layouts
import TeacherLayout from '@/components/layout/TeacherLayout.vue';
import StudentLayout from '@/components/layout/StudentLayout.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/public/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/public/RegisterView.vue')
  },
  {
    path: '/',
    component: TeacherLayout,
    meta: { requiresAuth: true, roles: ['teacher'] },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/teacher/DashboardView.vue'),
      },
      {
        path: 'course-design',
        name: 'CourseDesign',
        component: () => import('@/views/teacher/CourseDesignView.vue'),
      },
      {
        path: 'courses',
        name: 'MyCourses',
        component: () => import('@/views/teacher/MyCoursesView.vue'),
        meta: { requiresAuth: true, roles: ['teacher'] }
      },
      {
        path: 'classes',
        name: 'ClassManagement',
        component: () => import('@/views/teacher/ClassManagementView.vue'),
        meta: { requiresAuth: true, roles: ['teacher'] }
      },
      {
        path: 'create-class',
        name: 'CreateClass',
        component: () => import('@/views/teacher/CreateClassView.vue'),
        meta: { requiresAuth: true, roles: ['teacher'] }
      },
      {
        path: 'course-design/:id',
        name: 'CourseDesignDetail',
        component: () => import('@/views/teacher/CourseDesignView.vue'),
        meta: { requiresAuth: true, roles: ['teacher'] }
      }
    ],
  },
  // 学生相关路由
  {
    path: '/student',
    component: StudentLayout,
    meta: { requiresAuth: true, roles: ['student'] },
    children: [
      {
        path: '',
        redirect: '/student/my-courses',
      },
      {
        path: 'my-courses',
        name: 'StudentMyCourses',
        component: () => import('@/views/student/MyCoursesView.vue'),
      }
    ],
  },
  // Add other layouts and routes for admin here
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const userStore = useUserStore();

  if (to.matched.some((record) => record.meta?.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Login' });
    } else {
      const requiredRoles = to.meta?.roles as string[] | undefined;
      if (requiredRoles && userStore.role && !requiredRoles.includes(userStore.role)) {
        // Redirect to an unauthorized page or login
        // For now, redirecting to login
        next({ name: 'Login' });
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router; 
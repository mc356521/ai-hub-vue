import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from '../store/user';

// Layouts
import TeacherLayout from '@/components/layout/TeacherLayout.vue';

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
        path: 'course-design/:id',
        name: 'CourseDesignDetail',
        component: () => import('@/views/teacher/CourseDesignView.vue'),
        meta: { requiresAuth: true, roles: ['teacher'] }
      }
    ],
  },
  // Add other layouts and routes for student, admin here
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const userStore = useUserStore();

  if (to.matched.some((record: RouteRecordRaw) => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({ name: 'Login' });
    } else {
      const requiredRoles = to.meta.roles as string[];
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
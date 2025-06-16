import { defineStore } from 'pinia';

export type UserRole = 'student' | 'teacher' | 'admin' | null;

export const useUserStore = defineStore('user', {
  state: () => ({
    username: null as string | null,
    role: null as UserRole,
    isLoggedIn: false,
  }),
  actions: {
    login(username: string, role: UserRole) {
      this.username = username;
      this.role = role;
      this.isLoggedIn = true;
    },
    logout() {
      this.username = null;
      this.role = null;
      this.isLoggedIn = false;
    },
  },
}); 
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export type UserRole = 'student' | 'teacher' | 'admin' | null;

export const useUserStore = defineStore('user', () => {
  // State
  const username = ref<string | null>(localStorage.getItem('username') || null);
  const role = ref<UserRole>((localStorage.getItem('role') as UserRole) || 'student');
  const token = ref<string | null>(localStorage.getItem('token') || null);

  // Getters
  const isLoggedIn = computed(() => !!token.value);

  // Actions
  function login(newUsername: string, newRole: UserRole, newToken: string) {
    username.value = newUsername;
    role.value = newRole;
    token.value = newToken;

    localStorage.setItem('username', newUsername);
    localStorage.setItem('role', newRole);
    localStorage.setItem('token', newToken);
  }

  function logout() {
    username.value = null;
    role.value = 'student'; // Reset to default
    token.value = null;

    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  }

  return { username, role, token, isLoggedIn, login, logout };
}); 
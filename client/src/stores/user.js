import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref(localStorage.getItem('token') || '');
  const user = ref(null);

  // Getters
  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isTech = computed(() => user.value?.role === 'tech');

  // Actions
  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function setUser(userInfo) {
    user.value = userInfo;
  }

  function clearUser() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('token');
  }

  return {
    token,
    user,
    isLoggedIn,
    isAdmin,
    isTech,
    setToken,
    setUser,
    clearUser
  };
});

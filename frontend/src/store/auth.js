import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loginWithMock } from '../services/auth';

export const useAuthStore = defineStore('auth', () => {
  const token = ref('');
  const user = ref(null);
  const loading = ref(false);

  const ensureLogin = async () => {
    if (token.value) return;
    loading.value = true;
    try {
      const response = await loginWithMock();
      token.value = response.token;
      user.value = response.user;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = '';
    user.value = null;
  };

  return {
    token,
    user,
    loading,
    ensureLogin,
    logout
  };
});

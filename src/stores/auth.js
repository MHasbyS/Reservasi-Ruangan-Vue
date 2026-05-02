// stores/auth.js (versi super simpel)
import { defineStore } from 'pinia';
import { authAPI } from '@/api/endpoints/auth';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let user = null;
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'null') {
      try { user = JSON.parse(userStr); } catch { user = null; }
    }

    return {
      user: user,
      token: localStorage.getItem('token') || null,
    };
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || 'User',
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async login(email, password) {
      const res = await authAPI.login(email, password);
      const data = res.data.data || res.data;

      this.token = data.token || data.access_token;
      this.user = data.user;

      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
    },

    async logout() {
      if (this.token) await authAPI.logout().catch(() => {});
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    async fetchProfile() {
      if (!this.token) return;
      try {
        const res = await authAPI.getProfile();
        this.user = res.data.data || res.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }
});

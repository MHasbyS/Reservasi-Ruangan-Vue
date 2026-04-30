import { defineStore } from 'pinia';
import api from '@/api/axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: localStorage.getItem('role') || null,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserRole: (state) => state.role,
  },
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;

        // Menyesuaikan dengan response backend (misal dari Laravel)
        this.user = data.user || data.data?.user;
        this.role = this.user?.role || data.role || data.data?.role;
        this.token = data.token || data.data?.token;

        if (!this.token) throw new Error('Token tidak didapatkan dari server');

        localStorage.setItem('token', this.token);
        if (this.role) {
          localStorage.setItem('role', this.role);
        }

        return response.data;
      } catch (err) {
        console.error('Login error:', err.response?.data || err.message);
        throw new Error(err.response?.data?.message || 'Login gagal');
      }
    },

    async logout() {
      try {
        // Jika backend Laravel memiliki endpoint logout, panggil endpoint tersebut
        if (this.token) {
          await api.post('/auth/logout');
        }
      } catch (err) {
        console.error('Logout error:', err.response?.data || err.message);
      } finally {
        // Selalu bersihkan state dan local storage
        this.user = null;
        this.role = null;
        this.token = null;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    },
  },
});

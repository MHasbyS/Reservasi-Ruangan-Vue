import { defineStore } from 'pinia'
import { userAPI } from '@/api/endpoints/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    user: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      total: 0
    }
  }),

  getters: {
    hasUsers: (state) => state.users.length > 0,
    totalPages: (state) => state.pagination.lastPage,
  },

  actions: {
    async fetchUsers(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getUsers({
          search: params.search || '',
          limit: params.limit || this.pagination.perPage,
          page: params.page || this.pagination.currentPage,
        })

        const resData = response.data.data || response.data

        this.users = resData.items || resData.data || []
        this.pagination = {
          currentPage: resData.pagination?.current_page || resData.current_page || 1,
          perPage: resData.pagination?.per_page || resData.per_page || params.limit || 10,
          lastPage: resData.pagination?.last_page || resData.last_page || 1,
          total: resData.pagination?.total || resData.total || 0
        }

        return { users: this.users, pagination: this.pagination }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data user'
        console.error('Fetch users error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.getUserById(id)
        this.user = response.data.data || response.data
        return this.user
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data user'
        console.error('Fetch user by id error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(data) {
      this.loading = true
      this.error = null

      try {
        const response = await userAPI.createUser(data);
        await this.fetchUsers()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat user';
        console.error('Create user error:', error);
        throw error; // ✅ Lempar error agar ditangkap di komponen
      } finally {
    this.loading = false;
      }
    },

    async updateUser(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await userAPI.updateUser(id, data)
        await this.fetchUsers()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengupdate user'
        console.error('Update user error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteUser(id) {
      this.loading = true
      this.error = null
      try {
        const response = await userAPI.deleteUser(id)
        this.users = this.users.filter(u => u.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menghapus user'
        console.error('Delete user error:', error)
        throw error
      } finally {
        this.loading = false
      }
    }

  }
})

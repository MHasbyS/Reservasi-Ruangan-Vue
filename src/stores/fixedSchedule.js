import { defineStore } from "pinia";
import { fixedSchedulueAPI } from "../api/endpoints/fixedSchedule.js";

export const useFixedScheduleStore = defineStore('fixed-schedule',{
  state: () => ({
    schedules: [],
    schedule: null,
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
    hasSchedules: (state) => state.schedules.length > 0,
    totalPages: (state) => state.pagination.lastPage,
  },

  actions: {
    async fetchFixedSchedules(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await fixedSchedulueAPI.getFixedSchedules({
          search: params.search || '',
          limit: params.limit || this.pagination.perPage,
          page: params.page || this.pagination.currentPage,
        })

        const resData = response.data.data || response.data

        this.schedules = resData.items || resData.data || []
        this.pagination = {
          currentPage: resData.pagination?.current_page || resData.current_page || 1,
          perPage: resData.pagination?.per_page || resData.per_page || params.limit || 10,
          lastPage: resData.pagination?.last_page || resData.last_page || 1,
          total: resData.pagination?.total || resData.total || 0
        }

        return { schedules: this.schedules, pagination: this.pagination }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data jadwal tetap'
        console.error('Fetch fixed schedules error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchFixedScheduleById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await fixedSchedulueAPI.getFixedScheduleById(id)
        this.schedule = response.data.data || response.data
        return this.schedule
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data jadwal tetap'
        console.error('Fetch fixed schedule by id error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createFixedSchedule(data) {
      this.loading = true
      this.error = null

      try {
        const response = await fixedSchedulueAPI.createFixedSchedule(data);
        await this.fetchFixedSchedules()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat jadwal tetap';
        console.error('Create fixed schedule error:', error);
        throw error;
      } finally {
    this.loading = false;
      }
    },

    async updateFixedSchedule(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await fixedSchedulueAPI.updateFixedSchedule(id, data)
        await this.fetchFixedSchedules()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengupdate jadwal tetap'
        console.error('Update fixed schedule error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteFixedSchedule(id) {
      this.loading = true
      this.error = null
      try {
        const response = await fixedSchedulueAPI.deleteFixedSchedule(id)
        this.schedules = this.schedules.filter(s => s.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menghapus jadwal tetap'
        console.error('Delete fixed schedule error:', error)
        throw error
      } finally {
        this.loading = false
      }
    }

  }
})

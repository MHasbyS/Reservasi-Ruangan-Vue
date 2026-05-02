import { defineStore } from "pinia";
import { roomAPI } from "@/api/endpoints/room";

export const useRoomStore = defineStore('room', {
  state: () => ({
    rooms: [],
    room: null,
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
    hasRooms: (state) => state.rooms.length > 0,
    totalPages: (state) => state.pagination.lastPage,
  },

  actions: {
    async fetchRooms(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await roomAPI.getRooms({
          search: params.search || '',
          limit: params.limit || this.pagination.perPage,
          page: params.page || this.pagination.currentPage,
        })

        const resData = response.data.data || response.data

        this.rooms = resData.items || resData.data || []
        this.pagination = {
          currentPage: resData.pagination?.current_page || resData.current_page || 1,
          perPage: resData.pagination?.per_page || resData.per_page || params.limit || 10,
          lastPage: resData.pagination?.last_page || resData.last_page || 1,
          total: resData.pagination?.total || resData.total || 0
        }

        return { rooms: this.rooms, pagination: this.pagination }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data room'
        console.error('Fetch rooms error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRoomById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await roomAPI.getRoomById(id)
        this.room = response.data.data || response.data
        return this.room
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data room'
        console.error('Fetch room by id error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createRoom(data) {
      this.loading = true
      this.error = null

      try {
        const response = await roomAPI.createRoom(data);
        await this.fetchRooms()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat room';
        console.error('Create room error:', error);
        throw error; // ✅ Lempar error agar ditangkap di komponen
      } finally {
    this.loading = false;
      }
    },

    async updateRoom(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await roomAPI.updateRoom(id, data)
        await this.fetchRooms()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengupdate room'
        console.error('Update room error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteRoom(id) {
      this.loading = true
      this.error = null
      try {
        const response = await roomAPI.deleteRoom(id)
        this.rooms = this.rooms.filter(u => u.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menghapus room'
        console.error('Delete room error:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

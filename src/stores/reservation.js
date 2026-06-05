import { defineStore } from 'pinia'
import { reservationAPI } from '@/api/endpoints/reservation'

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [],
    reservation: null,
    loading: false,
    actionLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      perPage: 10,
      lastPage: 1,
      total: 0,
    },
  }),

  getters: {
    hasReservations: (state) => state.reservations.length > 0,
    totalPages: (state) => state.pagination.lastPage,
  },

  actions: {
    async fetchReservations(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.getReservations({
          search: params.search || '',
          limit: params.limit || this.pagination.perPage,
          page: params.page || this.pagination.currentPage,
        })

        const resData = response.data.data || response.data

        this.reservations = resData.items || resData.data || []
        this.pagination = {
          currentPage: resData.pagination?.current_page || resData.current_page || 1,
          perPage: resData.pagination?.per_page || resData.per_page || params.limit || 10,
          lastPage: resData.pagination?.last_page || resData.last_page || 1,
          total: resData.pagination?.total || resData.total || 0,
        }

        return { reservations: this.reservations, pagination: this.pagination }
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data reservation'
        console.error('Fetch reservations error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchReservationById(id) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.getReservationById(id)
        this.reservation = response.data.data || response.data
        return this.reservation
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal memuat data reservation'
        console.error('Fetch reservation by id error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createReservation(data) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.createReservation(data)
        await this.fetchReservations()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat reservation'
        console.error('Create reservation error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createReservationByAdmin(data) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.createReservationByAdmin(data)
        await this.fetchReservations()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membuat reservation'
        console.error('Create reservation by admin error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateReservation(id, data) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.updateReservation(id, data)
        await this.fetchReservations()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengupdate reservation'
        console.error('Update reservation error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteReservation(id) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.deleteReservation(id)
        this.reservations = this.reservations.filter((r) => r.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menghapus reservation'
        console.error('Delete reservation error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async approveReservation(id) {
      this.actionLoading = true
      this.error = null

      try {
        const response = await reservationAPI.approveReservation(id)

        const index = this.reservations.findIndex((r) => r.id === id)
        if (index !== -1) {
          this.reservations[index].status = 'approved'
        }
        await this.fetchReservations()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menyetujui reservation'
        console.error('Approve reservation error:', error)
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    async rejectReservation(id, reason = null) {
      this.actionLoading = true
      this.error = null

      try {
        const payload = reason ? { reason } : {};
        const response = await reservationAPI.rejectReservation(id, payload);

        const index = this.reservations.findIndex((r) => r.id === id)
        if (index !== -1) {
          this.reservations[index].status = 'rejected'
          if(reason){
            this.reservations[index].reason = reason
          }
        }

        await this.fetchReservations()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal menolak reservation'
        console.error('Reject reservation error:', error)
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    async cancelReservation(id) {
      this.actionLoading = true
      this.error = null

      try {
        const response = await reservationAPI.cancelReservation(id)
        await this.fetchReservations()
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal membatalkan reservation'
        console.error('Cancel reservation error:', error)
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    async exportReservations(params = {}) {
      this.loading = true
      this.error = null

      try {
        const response = await reservationAPI.exportReservations(params)

        const disposition = response.headers['content-disposition']
        const filename = disposition
          ? disposition.split('filename=')[1].replace(/"/g, '')
          : `reservasi_${new Date().toISOString().slice(0, 10)}.xlsx`

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Cleanup
        link.remove()
        window.URL.revokeObjectURL(url)

        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Gagal mengekspor data reservasi'
        console.error('Export reservations error:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})

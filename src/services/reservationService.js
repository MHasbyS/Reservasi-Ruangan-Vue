import api from '@/api/axios'

const reservationService = {
  getReservations() {
    console.log('Fetching reservation data...')
    return api.get('/reservations')
  },
  createReservation(data) {
    return api.get('/reservations',data)
  },
  getReservationById(id) {
    // console.log("get reservation by")
    return api.get(`/reservations/${id}`)
  },
  rejectReservation(id, data) {
    console.log(`Rejecting reservation id: ${id} with data:`, data)
    return api.patch(`/reservations/${id}/reject`, data)
  },
  approveReservation(id, data) {
    return api.patch(`/reservations/${id}/approve`, data)
  },
  laporanReservasi() {
    return api.get('reservations/export', {
      responseType: 'blob',
    })
  },
}

export default reservationService

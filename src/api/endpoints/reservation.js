import api from '../axios.js';

export const reservationAPI = {
  getReservations(params = {}) {
    // console.log("Fetching reservation data...");
    return api.get("/reservations",{
      params: {
        search: params.search || '',
        limit: params.limit || 10,
        page: params.page || 1,
      }
    });
  },

  getReservationById(id) {
    console.log("get reservation by id")
    return api.get(`/reservations/${id}`);
  },

  createReservationByAdmin(data) {
    console.log("creating reservation by admin")
    return api.post("/reservations", data);
  },

  createReservation(data){
    console.log("creating reservation")
    return api.post("/karyawan/reservations", data);
  },

  updateReservation(id, data) {
    console.log("editing reservation")
    return api.put(`/reservations/${id}`, data);
  },

  deleteReservation(id) {
    console.log("deleting reservation")
    return api.delete(`/reservations/${id}`);
  },

  approveReservation(id) {
    console.log("approving reservation")
    return api.patch(`/reservations/${id}/approve`);
  },

  rejectReservation(id,payload = {}) {
    console.log("rejecting reservation")
    return api.patch(`/reservations/${id}/reject`,payload);
  },

  cancelReservation(id) {
    console.log("cancelling reservation")
    return api.patch(`/reservations/${id}/cancel`);
  },

  exportReservations() {
    console.log("exporting reservation data")
    return api.get("/reservations/export",{
      responseType: 'blob'
    })
  },
}


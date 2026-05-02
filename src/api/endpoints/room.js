import api from "../axios.js"

export const roomAPI = {
  getRooms(params = {}) {
    // console.log("Fetching user data...");
    return api.get("/rooms",{
      params: {
        search: params.search || '',
        limit: params.limit || 10,
        page: params.page || 1,
      }
    });
  },

  getRoomById(id) {
    console.log("get room by id")
    return api.get(`/rooms/${id}`);
  },

  createRoom(data) {
    console.log("creating room")
    return api.post("/rooms", data);
  },

  updateRoom(id, data) {
    console.log("editing room")
    return api.put(`/rooms/${id}`, data);
  },

  deleteRoom(id) {
    console.log("deleting room")
    return api.delete(`/rooms/${id}`);
  },
}

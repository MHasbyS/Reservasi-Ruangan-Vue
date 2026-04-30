import api from "@/api/axios";

const roomService = {
  getRooms(){
    console.log("Fetching room data...");
    return api.get("/rooms")
  },

  getRoomById(id){
    console.log(`fetch room data for id: ${id}`);
    return api.get(`/rooms/${id}`);
  },

  createRoom(data){
    console.log("Creating new room...", data);
    return api.post("/rooms", data);
  },

  updateRoom(id, data){
    console.log(`Updating room id: ${id} with data:`, data);
    return api.put(`/rooms/${id}`, data);
  },

  deleteRoom(id){
    console.log(`Deleting room with id: ${id}`);
    return api.delete(`/rooms/${id}`);
  },
};

export default roomService;

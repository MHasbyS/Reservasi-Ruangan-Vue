import api from "../axios.js"

export const fixedSchedulueAPI = {
  getFixedSchedules(params = {}){
    return api.get("/fixed-schedules",{
      params: {
        search: params.search || '',
        limit: params.limit || 10,
        page: params.page || 1,
      }
    });
  },

  getFixedScheduleById(id){
    console.log("get Fixed Schedule By id")
    return api.get(`/fixed-schedules/${id}`);
  },

  createFixedSchedule(data){
    return api.post("/fixed-schedules", data);
  },

  updateFixedSchedule(id, data){
    return api.put(`/fixed-schedules/${id}`, data);
  },

  deleteFixedSchedule(id){
    return api.delete(`/fixed-schedules/${id}`);
  }
}

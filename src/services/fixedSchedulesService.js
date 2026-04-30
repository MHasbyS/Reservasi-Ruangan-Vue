import api from "@/api/axios";

const fixedSchedulesService = {
  getFixedSchedules(){
    console.log('fetching data ');
    return api.get("/fixed-schedules");
  },

  getFixedScheduleById(id){
    return api.get(`/fixed-schedules/${id}`);
  },

  createFixedSchedule(data){
    return api.post("/fixed-schedules",data);
  },
  updateFixedSchedule(id,data){
    return api.put(`/fixed-schedules/${id}`,data);
  },
  destroyFixedSchedule(id){
    return api.delete(`/fixed-schedules/${id}`);
  }
}
export default fixedSchedulesService;

import api from "@/api/axios";

const dashboardService = {
  getDashboard(){
    console.log('fetch data');
    return api.get("/dashboard")
  }
}
export default dashboardService;

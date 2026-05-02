import api from "../axios.js"

export const authAPI = {
  login(email, password){
    return api.post("/auth/login",{email, password})
  },
  logout(){
    return api.post("/auth/logout")
  },
  getProfile(){
    return api.get("/auth/me")
  },
  updateProfile(data){
    return api.put("/auth/me", data)
  },
  // register(data){
  //   return api.post("/auth/register", data)
  // }
}

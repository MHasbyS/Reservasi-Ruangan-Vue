import api from "@/api/axios";

const userService = {
  getUsers(){
    console.log("Fetching user data...");
    return api.get("/users");
  },

  getUserById(id){
    console.log(`fetch user data for id: ${id}`);
    return api.get(`/users/${id}`);
  },

  createUser(data){
    console.log("Membuat user baru...",data);
    return api.post("/users",data);
  },

  updateUser(id,data){
    return api.put(`/users/${id}`,data);
  },

  deleteUser(id){
    return api.delete(`/users/${id}`);
  },
  // getByRole(role){
  //   console.log(`Fetching user with role: ${role}`);
  //   return axios.get(`/api/users/role/${role}`);
  // }
  getProfile(){
    return api.get("auth/me");
  },
};

export default userService;

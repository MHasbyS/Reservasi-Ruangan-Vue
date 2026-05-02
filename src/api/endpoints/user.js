import api from '../axios.js';

export const userAPI = {
  getUsers(params = {}) {
    // console.log("Fetching user data...");
    return api.get("/users",{
      params: {
        search: params.search || '',
        limit: params.limit || 10,
        page: params.page || 1,
      }
    });
  },

  getUserById(id) {
    console.log("get user by id")
    return api.get(`/users/${id}`);
  },

  createUser(data) {
    console.log("creating user")
    return api.post("/users", data);
  },

  updateUser(id, data) {
    console.log("editing user")
    return api.put(`/users/${id}`, data);
  },

  deleteUser(id) {
    console.log("deleting user")
    return api.delete(`/users/${id}`);
  },

  getProfile() {
    console.log("get profile")
    return api.get("auth/me");
  },
};

// services/UserService.js
import { userAPI } from '@/api/endpoints/user';

export const userService = {
  // Get all users (with pagination)
  async getAllUsers(options = {}) {
    const { search = '', page = 1, limit = 10 } = options;
    const response = await userAPI.getUsers({ search, limit, page });

    // Struktur response Laravel:
    // { success: true, message: "...", data: { items: [...], pagination: { current_page, per_page, last_page, total } } }
    const resData = response.data.data || response.data;

    return {
      users: resData.items || resData.data || [],
      pagination: {
        currentPage: resData.pagination?.current_page || resData.current_page || 1,
        perPage: resData.pagination?.per_page || resData.per_page || limit,
        lastPage: resData.pagination?.last_page || resData.last_page || 1,
        total: resData.pagination?.total || resData.total || 0
      }
    };
  },

  // Get profile
  async getProfile() {
    const response = await userAPI.getProfile();
    return response;
  },

  // Get single user by ID
  async getUserById(id) {
    const response = await userAPI.getUserById(id);
    return response;
  },

  // Create user
  async createUser(data) {
    const response = await userAPI.createUser(data);
    return response;
  },

  // Update user
  async updateUser(id, data) {
    const response = await userAPI.updateUser(id, data);
    return response;
  },

  // Delete user
  async deleteUser(id) {
    const response = await userAPI.deleteUser(id);
    return response;
  }
};

// Default export untuk kompatibilitas
export default userService;

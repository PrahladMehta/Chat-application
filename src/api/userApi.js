import api from "./axios";

/**
 * @module userApi
 * @description API client for user-related endpoints.
 * All endpoints require a valid access token (handled by the axios interceptor).
 *
 * Base path: /api/v1/users
 */

export const userApi = {
  /**
   * Get all users except the currently authenticated user.
   * Supports optional search and pagination.
   *
   * @param {object}  [params]
   * @param {string}  [params.search]  - Filter by username (partial, case-insensitive)
   * @param {number}  [params.page=1]  - Page number
   * @param {number}  [params.limit=50] - Items per page (max 100)
   * @returns {Promise<Array>} Array of user objects
   */
  getAllUsers: async (params = {}) => {
    const { data } = await api.get("/users", { params });
    // The backend returns { success, data, message } or { success, data, pagination }
    return data.data;
  },

  /**
   * Get a single user by their ID.
   *
   * @param {string} userId - The user's MongoDB ObjectId
   * @returns {Promise<object>} User object
   */
  getUser: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data.data;
  },

  /**
   * Set or update a user's avatar image.
   * Only the user themselves can update their own avatar.
   *
   * @param {string} userId - The user's MongoDB ObjectId
   * @param {string} image  - Base64-encoded avatar image string
   * @returns {Promise<{ isSet: boolean, image: string }>}
   */
  setAvatar: async (userId, image) => {
    const { data } = await api.post(`/users/${userId}/avatar`, { image });
    return data.data;
  },

  /**
   * Update user profile fields (username, email).
   * Only the user themselves can update their own profile.
   *
   * @param {string} userId  - The user's MongoDB ObjectId
   * @param {object} updates - Fields to update
   * @param {string} [updates.username] - New username
   * @param {string} [updates.email]    - New email
   * @returns {Promise<object>} Updated user object
   */
  updateUser: async (userId, updates) => {
    const { data } = await api.patch(`/users/${userId}`, updates);
    return data.data;
  },

  /**
   * Delete a user account.
   * Only the user themselves can delete their own account.
   *
   * @param {string} userId - The user's MongoDB ObjectId
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    await api.delete(`/users/${userId}`);
  },
};

export default userApi;

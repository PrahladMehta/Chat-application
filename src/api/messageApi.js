import api from "./axios";

/**
 * @module messageApi
 * @description API functions for message-related operations.
 * All endpoints require authentication (access token attached via axios interceptor).
 */
export const messageApi = {
  /**
   * Send a new direct message.
   *
   * @param {string} from - Sender's user ID (must match authenticated user)
   * @param {string} to - Recipient's user ID
   * @param {string} message - Message content (1–2000 chars)
   * @returns {Promise<object>} The saved message data
   */
  sendMessage: async (from, to, message) => {
    const { data } = await api.post("/messages", { from, to, message });
    return data.data;
  },

  /**
   * Get paginated conversation history between two users.
   *
   * @param {string} from - Current user's ID
   * @param {string} to - Other user's ID
   * @param {object} [options]
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=50] - Messages per page
   * @returns {Promise<{ data: Array, pagination: object }>}
   */
  getConversation: async (from, to, { page = 1, limit = 50 } = {}) => {
    const { data } = await api.post(
      `/messages/conversation?page=${page}&limit=${limit}`,
      { from, to },
    );
    return {
      messages: data.data,
      pagination: data.pagination,
    };
  },

  /**
   * Mark all unread messages from a specific sender as "read".
   * Called when the current user opens a conversation.
   *
   * @param {string} from - The other user's ID (whose messages to mark)
   * @param {string} to - Current user's ID (the reader)
   * @returns {Promise<{ updatedCount: number }>}
   */
  markAsRead: async (from, to) => {
    const { data } = await api.patch("/messages/read", { from, to });
    return data.data;
  },

  /**
   * Soft-delete a message for the current user.
   * The message remains in the DB but is hidden for this user.
   *
   * @param {string} messageId - The message's ObjectId
   * @returns {Promise<object>}
   */
  deleteMessage: async (messageId) => {
    const { data } = await api.delete(`/messages/${messageId}`);
    return data;
  },

  /**
   * Update the delivery/read status of a single message.
   *
   * @param {string} messageId - The message's ObjectId
   * @param {'delivered'|'read'} status - New status
   * @returns {Promise<object>}
   */
  updateMessageStatus: async (messageId, status) => {
    const { data } = await api.patch(`/messages/${messageId}/status`, {
      status,
    });
    return data.data;
  },
};

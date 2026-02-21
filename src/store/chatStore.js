import { create } from "zustand";

/**
 * @module chatStore
 * @description Zustand store for chat state management.
 *
 * Manages:
 *  - Current active chat (the user being chatted with)
 *  - Messages array for the active conversation
 *  - Typing indicators (array of usernames currently typing)
 *  - Contacts list
 *  - Loading / error states
 *
 * This store is the single source of truth for all chat-related data.
 * Socket events and API responses both write into this store.
 */

export const useChatStore = create((set, get) => ({
  // ─── Current Chat ─────────────────────────────────────────────────────
  /** The user object of the person we're currently chatting with (or null) */
  currentChat: null,

  /** All fetched contacts */
  contacts: [],

  /** Whether contacts have been loaded at least once */
  contactsLoaded: false,

  // ─── Messages ─────────────────────────────────────────────────────────
  /** Messages for the currently active conversation */
  messages: [],

  /** Whether messages are currently being fetched */
  messagesLoading: false,

  // ─── Typing Indicators ────────────────────────────────────────────────
  /**
   * Array of usernames (or user IDs) that are currently typing in the
   * active conversation. For 1-to-1 this will have at most one entry.
   * For future group chats it can hold multiple.
   */
  typingUsers: [],

  // ─── Online Presence ──────────────────────────────────────────────────
  /** Set of user IDs that are currently online */
  onlineUsers: [],

  // ─── Actions: Current Chat ────────────────────────────────────────────

  /**
   * Set the active chat target. Clears messages and typing state
   * from the previous conversation so stale data is never shown.
   *
   * @param {object|null} chat - The user object to chat with, or null to deselect
   */
  setCurrentChat: (chat) =>
    set({
      currentChat: chat,
      messages: [],
      typingUsers: [],
      messagesLoading: false,
    }),

  /**
   * Clear the active chat (e.g. when navigating away).
   */
  clearCurrentChat: () =>
    set({
      currentChat: null,
      messages: [],
      typingUsers: [],
      messagesLoading: false,
    }),

  // ─── Actions: Contacts ────────────────────────────────────────────────

  /**
   * Replace the entire contacts list (e.g. after initial fetch).
   * @param {Array} contacts
   */
  setContacts: (contacts) => set({ contacts, contactsLoaded: true }),

  // ─── Actions: Messages ────────────────────────────────────────────────

  /**
   * Replace the entire messages array (e.g. after fetching conversation history).
   * @param {Array} msgs
   */
  setMessages: (msgs) => set({ messages: msgs }),

  /**
   * Set the loading state for messages.
   * @param {boolean} loading
   */
  setMessagesLoading: (loading) => set({ messagesLoading: loading }),

  /**
   * Append a single message to the end of the messages array.
   * Used for both outgoing (optimistic) and incoming (socket) messages.
   *
   * @param {object} msg - Message object with at least { fromSelf, message }
   */
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  /**
   * Append multiple messages at once (e.g. loading older pages).
   * Prepends to the beginning if `prepend` is true, appends otherwise.
   *
   * @param {Array}   msgs
   * @param {boolean} [prepend=false]
   */
  addMessages: (msgs, prepend = false) =>
    set((state) => ({
      messages: prepend
        ? [...msgs, ...state.messages]
        : [...state.messages, ...msgs],
    })),

  /**
   * Update a specific message by its `_id` (e.g. to change status).
   *
   * @param {string} messageId
   * @param {object} updates - Partial message fields to merge
   */
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  /**
   * Remove a message by its `_id` (e.g. after soft-delete).
   * @param {string} messageId
   */
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== messageId),
    })),

  // ─── Actions: Typing Indicators ───────────────────────────────────────

  /**
   * Add a username to the typing users list (de-duplicated).
   * @param {string} username
   */
  addTypingUser: (username) =>
    set((state) => ({
      typingUsers: state.typingUsers.includes(username)
        ? state.typingUsers
        : [...state.typingUsers, username],
    })),

  /**
   * Remove a username from the typing users list.
   * @param {string} username
   */
  removeTypingUser: (username) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((u) => u !== username),
    })),

  /**
   * Clear all typing indicators (e.g. when switching conversations).
   */
  clearTypingUsers: () => set({ typingUsers: [] }),

  // ─── Actions: Online Presence ─────────────────────────────────────────

  /**
   * Add a user ID to the online users list (de-duplicated).
   * @param {string} userId
   */
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),

  /**
   * Remove a user ID from the online users list.
   * @param {string} userId
   */
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),

  /**
   * Replace the entire online users list (e.g. on initial load).
   * @param {Array<string>} userIds
   */
  setOnlineUsers: (userIds) =>
    set({ onlineUsers: [...new Set(userIds)] }),

  /**
   * Check if a specific user is currently online.
   * This is a derived getter, not stored state.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  isUserOnline: (userId) => get().onlineUsers.includes(userId),

  // ─── Actions: Reset ───────────────────────────────────────────────────

  /**
   * Reset the entire chat store to its initial state.
   * Called on logout to prevent data leaking between sessions.
   */
  reset: () =>
    set({
      currentChat: null,
      contacts: [],
      contactsLoaded: false,
      messages: [],
      messagesLoading: false,
      typingUsers: [],
      onlineUsers: [],
    }),
}));

/**
 * Socket.io Event Constants
 *
 * Single source of truth for all socket event names used across the frontend.
 * Mirrors the event names defined in the backend socket handler.
 *
 * Usage:
 *   import { SOCKET_EVENTS } from '../constants/socketEvents';
 *   socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, handler);
 */

export const SOCKET_EVENTS = {
  // ─── Connection ────────────────────────────────────────
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",

  // ─── User Presence ─────────────────────────────────────
  ADD_USER: "add-user",
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",

  // ─── Direct Messaging ─────────────────────────────────
  MESSAGE_SEND: "message:send",
  MESSAGE_SENT: "message:sent",
  MESSAGE_RECEIVE: "message:receive",
  MESSAGE_ERROR: "message:error",

  // ─── Read Receipts ────────────────────────────────────
  MESSAGE_READ: "message:read",
  MESSAGE_READ_CONFIRMATION: "message:read:confirmation",

  // ─── Typing Indicators ────────────────────────────────
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // ─── Auth Errors ──────────────────────────────────────
  AUTH_ERROR: "auth:error",

  // ─── Legacy Events (backward compatibility) ───────────
  /** @deprecated Use MESSAGE_SEND instead */
  LEGACY_SEND_MSG: "send-msg",
  /** @deprecated Use MESSAGE_RECEIVE instead */
  LEGACY_MSG_RECEIVE: "msg-recieve",
};

/**
 * Mapping of message status values returned by the server.
 */
export const MESSAGE_STATUS = {
  SENT: "sent",
  DELIVERED: "delivered",
  READ: "read",
};

/**
 * Typing indicator timing constants (should match server-side values).
 */
export const TYPING_CONFIG = {
  /** Debounce interval for emitting typing:start (ms) */
  DEBOUNCE_MS: 2000,
  /** Auto-clear typing indicator after this duration of inactivity (ms) */
  AUTO_CLEAR_MS: 3000,
};

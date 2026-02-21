import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants/socketEvents";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

/**
 * @module socketService
 *
 * Singleton service that owns the single Socket.io client instance.
 *
 * Responsibilities:
 *  - Connect with JWT auth handshake
 *  - Reconnect with fresh tokens on expiry
 *  - Expose helpers for emitting / subscribing
 *  - Provide a stable reference that Zustand stores can import
 *
 * Usage:
 *   import { socketService } from '../services/socketService';
 *   socketService.connect(userId);          // after login
 *   socketService.disconnect();             // on logout
 *   socketService.getSocket();              // raw socket for listeners
 *   socketService.emit('event', payload);   // safe emit
 */

/** @type {import("socket.io-client").Socket | null} */
let socket = null;

/** Keeps a reference to the connected userId so we can re-emit add-user */
let _currentUserId = null;

/**
 * In-memory reference to the access token.
 * Updated externally via `setToken()` so socketService doesn't need to
 * import the auth store (avoids circular dependency).
 *
 * @type {string|null}
 */
let _accessToken = null;

/**
 * Set the access token for socket auth handshakes.
 * Called by authStore after login / register / refresh.
 *
 * @param {string|null} token
 */
function setToken(token) {
  _accessToken = token;
}

/**
 * Retrieve the current access token stored in this module.
 * @returns {string|null}
 */
function getAccessToken() {
  return _accessToken;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Create and connect a Socket.io client.
 *
 * If a connection already exists it is disconnected first so we never
 * end up with dangling sockets.
 *
 * @param {string} userId – The authenticated user's `_id`
 * @returns {import("socket.io-client").Socket} The connected socket instance
 */
function connect(userId) {
  // Tear down any previous connection
  if (socket) {
    disconnect();
  }

  _currentUserId = userId;

  const token = getAccessToken();

  socket = io(SERVER_URL, {
    // JWT sent during the handshake – the server middleware reads this
    auth: { token },
    // Transport config
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
    withCredentials: true, // send cookies (refresh-token) if needed
  });

  // ── Connection lifecycle logging ──────────────────────────────────────

  socket.on("connect", () => {
    console.info("[socketService] connected:", socket.id);

    // Register the user with the server so it maps `userId → socketId`
    if (_currentUserId) {
      socket.emit(SOCKET_EVENTS.ADD_USER, _currentUserId);
    }
  });

  socket.on("disconnect", (reason) => {
    console.warn("[socketService] disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[socketService] connection error:", err.message);

    // If the server rejected us because the token expired we can try
    // refreshing and reconnecting.  This is a best-effort recovery;
    // the auth store's `initAuth` handles the full refresh flow.
    if (
      err.message?.includes("expired") ||
      err.message?.includes("Authentication")
    ) {
      console.info(
        "[socketService] token may be expired – will retry after refresh",
      );
    }
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.info(`[socketService] reconnect attempt #${attempt}`);

    // Attach a potentially-refreshed token on every reconnect attempt
    const freshToken = getAccessToken();
    if (freshToken && socket) {
      socket.auth = { token: freshToken };
    }
  });

  socket.on("reconnect", (attempt) => {
    console.info(`[socketService] reconnected after ${attempt} attempt(s)`);

    // Re-register user presence after reconnect
    if (_currentUserId) {
      socket.emit(SOCKET_EVENTS.ADD_USER, _currentUserId);
    }
  });

  socket.on("reconnect_failed", () => {
    console.error("[socketService] reconnection failed after max attempts");
  });

  // ── Server-side auth error ────────────────────────────────────────────

  socket.on(SOCKET_EVENTS.AUTH_ERROR, (payload) => {
    console.error("[socketService] auth:error from server:", payload?.message);
  });

  return socket;
}

/**
 * Gracefully disconnect the current socket and clean up references.
 */
function disconnect() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  _currentUserId = null;
}

/**
 * Return the raw Socket.io instance (or null if not connected).
 * Consumers should null-check before subscribing to events.
 *
 * @returns {import("socket.io-client").Socket | null}
 */
function getSocket() {
  return socket;
}

/**
 * Convenience wrapper around `socket.emit` that silently no-ops if the
 * socket is not connected yet. Prevents "cannot read property emit of null"
 * errors throughout the app.
 *
 * @param {string} event
 * @param {*}      data
 */
function emit(event, data) {
  if (socket && socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn(
      `[socketService] emit("${event}") skipped – socket not connected`,
    );
  }
}

/**
 * Subscribe to a socket event. Returns an unsubscribe function for easy
 * cleanup inside React `useEffect` hooks.
 *
 * @param {string}   event
 * @param {Function} handler
 * @returns {() => void} Unsubscribe function
 */
function on(event, handler) {
  if (socket) {
    socket.on(event, handler);
  }

  return () => {
    if (socket) {
      socket.off(event, handler);
    }
  };
}

/**
 * Unsubscribe from a socket event.
 *
 * @param {string}   event
 * @param {Function} [handler] – If omitted, removes ALL listeners for the event.
 */
function off(event, handler) {
  if (!socket) return;

  if (handler) {
    socket.off(event, handler);
  } else {
    socket.removeAllListeners(event);
  }
}

/**
 * Check whether the socket is currently connected.
 * @returns {boolean}
 */
function isConnected() {
  return !!(socket && socket.connected);
}

// ─── Export as a singleton object ───────────────────────────────────────────

export const socketService = {
  connect,
  disconnect,
  getSocket,
  emit,
  on,
  off,
  isConnected,
  setToken,
};

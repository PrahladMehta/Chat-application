import { create } from "zustand";
import { socketService } from "../services/socketService";
import { SOCKET_EVENTS } from "../constants/socketEvents";

/**
 * @module socketStore
 *
 * Zustand store that manages the Socket.io connection lifecycle and
 * tracks online user presence across the application.
 *
 * Responsibilities:
 *  - Initialize / tear down the socket connection
 *  - Listen for user:online and user:offline events
 *  - Expose the list of currently online user IDs
 *  - Provide a stable `getSocket()` accessor for other stores / components
 *
 * Usage:
 *   const { onlineUsers, initSocket, disconnect } = useSocketStore();
 *   const isOnline = useSocketStore((s) => s.onlineUsers.includes(userId));
 */

export const useSocketStore = create((set, get) => ({
  // ─── State ────────────────────────────────────────────────────────────
  /** Whether the socket is currently connected */
  connected: false,

  /** Array of user IDs that are currently online */
  onlineUsers: [],

  /** Unsubscribe functions for socket listeners (used during cleanup) */
  _unsubscribers: [],

  // ─── Actions ──────────────────────────────────────────────────────────

  /**
   * Initialize the socket connection and register presence listeners.
   *
   * Should be called once after successful login / session restore, typically
   * from `authStore.login()`, `authStore.register()`, or `authStore.initAuth()`.
   *
   * @param {string} userId – The authenticated user's `_id`
   */
  initSocket: (userId) => {
    // Prevent double-initialization
    const { connected, _cleanup } = get();
    if (connected) {
      _cleanup();
    }

    const socket = socketService.connect(userId);

    const unsubscribers = [];

    // ── Track connection state ──────────────────────────────────────────
    const onConnect = () => {
      set({ connected: true });
    };

    const onDisconnect = () => {
      set({ connected: false });
    };

    socket.on(SOCKET_EVENTS.CONNECT, onConnect);
    socket.on(SOCKET_EVENTS.DISCONNECT, onDisconnect);
    unsubscribers.push(
      () => socket.off(SOCKET_EVENTS.CONNECT, onConnect),
      () => socket.off(SOCKET_EVENTS.DISCONNECT, onDisconnect)
    );

    // If socket is already connected (synchronous connect), set immediately
    if (socket.connected) {
      set({ connected: true });
    }

    // ── Track online users ──────────────────────────────────────────────
    const onUserOnline = (id) => {
      set((state) => {
        if (state.onlineUsers.includes(id)) return state;
        return { onlineUsers: [...state.onlineUsers, id] };
      });
    };

    const onUserOffline = (id) => {
      set((state) => ({
        onlineUsers: state.onlineUsers.filter((uid) => uid !== id),
      }));
    };

    socket.on(SOCKET_EVENTS.USER_ONLINE, onUserOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, onUserOffline);
    unsubscribers.push(
      () => socket.off(SOCKET_EVENTS.USER_ONLINE, onUserOnline),
      () => socket.off(SOCKET_EVENTS.USER_OFFLINE, onUserOffline)
    );

    // ── Auth error from server ──────────────────────────────────────────
    const onAuthError = (payload) => {
      console.error("[socketStore] auth:error:", payload?.message);
      // Could trigger a re-auth flow here if desired
    };

    socket.on(SOCKET_EVENTS.AUTH_ERROR, onAuthError);
    unsubscribers.push(() => socket.off(SOCKET_EVENTS.AUTH_ERROR, onAuthError));

    set({ _unsubscribers: unsubscribers });
  },

  /**
   * Disconnect the socket and clean up all listeners.
   * Called on logout or when the app unmounts.
   */
  disconnect: () => {
    get()._cleanup();
    socketService.disconnect();
    set({ connected: false, onlineUsers: [], _unsubscribers: [] });
  },

  /**
   * Check whether a specific user is currently online.
   *
   * @param {string} userId
   * @returns {boolean}
   */
  isUserOnline: (userId) => {
    return get().onlineUsers.includes(userId);
  },

  /**
   * Get the raw Socket.io instance (or null).
   * Prefer using `socketService.emit()` / `socketService.on()` over
   * accessing the raw socket directly.
   *
   * @returns {import("socket.io-client").Socket | null}
   */
  getSocket: () => {
    return socketService.getSocket();
  },

  // ─── Internal helpers ─────────────────────────────────────────────────

  /**
   * Remove all socket event listeners that this store registered.
   * Does NOT disconnect the socket itself.
   * @private
   */
  _cleanup: () => {
    const { _unsubscribers } = get();
    _unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // Listener may already have been removed — safe to ignore
      }
    });
    set({ _unsubscribers: [] });
  },
}));

export default useSocketStore;

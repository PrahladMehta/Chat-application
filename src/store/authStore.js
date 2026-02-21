import { create } from "zustand";
import { authApi } from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axios";
import { socketService } from "../services/socketService";

/**
 * @module authStore
 *
 * Zustand store for authentication state.
 *
 * Responsibilities:
 *  - Hold the current user object and authentication status
 *  - Store the access token in memory (never localStorage)
 *  - Provide actions: login, register, logout, logoutAll, initAuth
 *  - Sync the access token with the axios interceptor and socketService
 *  - Connect/disconnect the socket on auth state changes
 *
 * On app mount, `initAuth()` is called from App.jsx. It attempts a silent
 * token refresh via the httpOnly cookie. If that succeeds the user is
 * restored without needing to log in again. If it fails the user lands
 * on the login page.
 */

export const useAuthStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  // ─── Internal: sync token everywhere ────────────────────────────────────
  _setToken: (token) => {
    setAccessToken(token);
    socketService.setToken(token);
    set({ accessToken: token });
  },

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Attempt to restore the session on app startup.
   *
   * Calls the refresh-token endpoint (the httpOnly cookie is sent
   * automatically by the browser). If it succeeds we get a fresh
   * access token + user object and the user stays logged in.
   *
   * This should be called once in App.jsx's useEffect.
   */
  initAuth: async () => {
    set({ loading: true });

    try {
      const data = await authApi.refreshToken();

      if (data?.user && data?.accessToken) {
        get()._setToken(data.accessToken);

        set({
          user: data.user,
          isAuthenticated: true,
        });

        // Connect socket with the restored user
        socketService.connect(data.user._id);
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch {
      // Refresh failed — user needs to log in manually
      clearAccessToken();
      socketService.setToken(null);

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Log in with username + password.
   *
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<object>} The user object on success
   * @throws Will throw on invalid credentials (caller should catch & toast)
   */
  login: async (credentials) => {
    const data = await authApi.login(credentials);

    get()._setToken(data.accessToken);

    set({
      user: data.user,
      isAuthenticated: true,
    });

    // Connect socket
    socketService.connect(data.user._id);

    return data.user;
  },

  /**
   * Register a new account.
   *
   * @param {{ username: string, email: string, password: string }} payload
   * @returns {Promise<object>} The created user object
   * @throws Will throw on validation / conflict errors (caller should catch & toast)
   */
  register: async (payload) => {
    const data = await authApi.register(payload);

    get()._setToken(data.accessToken);

    set({
      user: data.user,
      isAuthenticated: true,
    });

    // Connect socket
    socketService.connect(data.user._id);

    return data.user;
  },

  /**
   * Log out the current session.
   * Revokes the refresh token, clears the cookie, disconnects the socket.
   */
  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Even if the API call fails (e.g. network error), we still clear local state
      console.warn("[authStore] logout API call failed:", err.message);
    } finally {
      clearAccessToken();
      socketService.setToken(null);
      socketService.disconnect();

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Log out from ALL devices.
   * Revokes every refresh token for this user, then clears local state.
   *
   * @returns {Promise<number>} Number of sessions revoked
   */
  logoutAll: async () => {
    let sessionsRevoked = 0;

    try {
      const result = await authApi.logoutAll();
      sessionsRevoked = result?.sessionsRevoked || 0;
    } catch (err) {
      console.warn("[authStore] logoutAll API call failed:", err.message);
    } finally {
      clearAccessToken();
      socketService.setToken(null);
      socketService.disconnect();

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
      });
    }

    return sessionsRevoked;
  },

  /**
   * Update the user object in the store (e.g. after avatar change).
   * Does NOT make any API calls — the caller is responsible for that.
   *
   * @param {object} updates - Partial user fields to merge
   */
  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));

import api, { setAccessToken, clearAccessToken } from "./axios";

/**
 * @module authApi
 * @description API functions for authentication endpoints.
 * All routes hit /api/v1/auth/* on the backend.
 *
 * Token handling:
 *  - Access tokens are stored in memory (managed by setAccessToken / clearAccessToken).
 *  - Refresh tokens live in httpOnly cookies (sent automatically by the browser).
 */

export const authApi = {
  /**
   * Register a new user account.
   *
   * @param {{ username: string, email: string, password: string }} payload
   * @returns {Promise<{ user: object, accessToken: string }>}
   */
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data.data;
  },

  /**
   * Log in with username + password.
   *
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<{ user: object, accessToken: string }>}
   */
  login: async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data.data;
  },

  /**
   * Rotate the refresh token and obtain a new access token.
   * The refresh token is read from the httpOnly cookie automatically.
   *
   * @returns {Promise<{ user: object, accessToken: string }>}
   */
  refreshToken: async () => {
    const { data } = await api.post("/auth/refresh-token");
    if (data.success && data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data.data;
  },

  /**
   * Log out the current session (revoke the refresh token + clear cookie).
   *
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAccessToken();
    }
  },

  /**
   * Log out from ALL devices (revoke every refresh token for this user).
   * Requires a valid access token.
   *
   * @returns {Promise<{ sessionsRevoked: number }>}
   */
  logoutAll: async () => {
    const { data } = await api.post("/auth/logout-all");
    clearAccessToken();
    return data.data;
  },

  /**
   * Get the currently authenticated user's profile.
   * Requires a valid access token.
   *
   * @returns {Promise<{ user: object }>}
   */
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data.data;
  },

  /**
   * Get all active sessions (devices) for the current user.
   * Requires a valid access token.
   *
   * @returns {Promise<{ sessions: Array, count: number }>}
   */
  getSessions: async () => {
    const { data } = await api.get("/auth/sessions");
    return data.data;
  },

  /**
   * Initialize E2EE keys for a legacy account that registered before
   * E2EE was rolled out. Idempotent on the server (only succeeds when
   * the user's publicKey is null).
   *
   * @param {{
   *   publicKey: string,
   *   encryptedPrivateKey: string,
   *   privKeySalt: string,
   *   privKeyNonce: string,
   * }} payload — all base64
   * @returns {Promise<{ user: object }>}
   */
  initKeys: async (payload) => {
    const { data } = await api.post("/auth/keys/init", payload);
    return data.data;
  },
};

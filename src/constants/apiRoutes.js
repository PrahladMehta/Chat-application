/**
 * @module apiRoutes
 * @description Centralized API route constants for the Ping frontend.
 *
 * All endpoints point to the v1 API. The base URL is read from the
 * VITE_API_URL environment variable with a sensible localhost fallback.
 *
 * Usage:
 *   import { API_ROUTES } from '../constants/apiRoutes';
 *   axios.post(API_ROUTES.AUTH.LOGIN, payload);
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3002";

const V1 = `${API_BASE_URL}/api/v1`;

export const API_ROUTES = {
  // ─── Authentication ────────────────────────────────────────────
  AUTH: {
    REGISTER: `${V1}/auth/register`,
    LOGIN: `${V1}/auth/login`,
    REFRESH_TOKEN: `${V1}/auth/refresh-token`,
    LOGOUT: `${V1}/auth/logout`,
    LOGOUT_ALL: `${V1}/auth/logout-all`,
    ME: `${V1}/auth/me`,
    SESSIONS: `${V1}/auth/sessions`,
  },

  // ─── Users ─────────────────────────────────────────────────────
  USERS: {
    BASE: `${V1}/users`,
    BY_ID: (id) => `${V1}/users/${id}`,
    AVATAR: (id) => `${V1}/users/${id}/avatar`,
  },

  // ─── Messages ──────────────────────────────────────────────────
  MESSAGES: {
    BASE: `${V1}/messages`,
    CONVERSATION: `${V1}/messages/conversation`,
    READ: `${V1}/messages/read`,
    BY_ID: (id) => `${V1}/messages/${id}`,
    STATUS: (id) => `${V1}/messages/${id}/status`,
  },
};

/**
 * The raw host URL — used by Socket.io to establish the WebSocket connection.
 *
 * @example
 *   import { SOCKET_URL } from '../constants/apiRoutes';
 *   const socket = io(SOCKET_URL, { auth: { token } });
 */
export const SOCKET_URL = API_BASE_URL;

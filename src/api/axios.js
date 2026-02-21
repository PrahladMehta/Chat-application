import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3002";

/**
 * Configured Axios instance for the Ping API.
 *
 * Features:
 *  - Base URL pointing to the backend API
 *  - `withCredentials: true` so httpOnly cookies (refresh token) are sent
 *  - Request interceptor: injects the access token from memory into every request
 *  - Response interceptor: on 401, silently attempts a token refresh and retries once
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── In-memory access token storage ─────────────────────────────────────────
// Kept outside of React state so it survives re-renders and is accessible
// synchronously from interceptors. Never stored in localStorage.

let accessToken = null;

/**
 * Set the in-memory access token. Called by authStore after login/register/refresh.
 * @param {string|null} token
 */
export function setAccessToken(token) {
  accessToken = token;
}

/**
 * Get the current in-memory access token.
 * @returns {string|null}
 */
export function getAccessToken() {
  return accessToken;
}

/**
 * Clear the in-memory access token. Called on logout.
 */
export function clearAccessToken() {
  accessToken = null;
}

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attach the Bearer token to every outgoing request (if we have one).

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// If a request returns 401 (access token expired / invalid):
//   1. Try to refresh the token via /auth/refresh-token
//   2. If refresh succeeds, update the in-memory token and retry the original request
//   3. If refresh fails, reject — the caller (authStore) will handle logout
//
// A flag prevents infinite refresh loops (only one retry per original request).

let isRefreshing = false;
let failedQueue = [];

/**
 * Process the queue of requests that were waiting for a token refresh.
 * @param {Error|null} error  – null on success, Error on failure
 * @param {string|null} token – the new access token (if refresh succeeded)
 */
function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  // Happy path — just pass the response through
  (response) => response,

  // Error path — check if it's a 401 we can recover from
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401s that haven't already been retried,
    // and skip the refresh endpoint itself to avoid infinite loops.
    const isAuthEndpoint =
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the refresh endpoint — the httpOnly cookie is sent automatically
        const { data } = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data.data?.accessToken;

        if (!newToken) {
          throw new Error("No access token in refresh response");
        }

        // Update in-memory token
        setAccessToken(newToken);

        // Retry all queued requests with the new token
        processQueue(null, newToken);

        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear token and reject everything
        clearAccessToken();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

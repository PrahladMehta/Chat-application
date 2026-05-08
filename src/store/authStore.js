import { create } from "zustand";
import { authApi } from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axios";
import { socketService } from "../services/socketService";
import * as crypto from "../services/cryptoService";
import * as keyVault from "../services/keyVault";

/**
 * @module authStore
 *
 * Zustand store for authentication state.
 *
 * Responsibilities:
 *  - Hold the current user object and authentication status
 *  - Store the access token in memory (never localStorage)
 *  - Hold the decrypted E2EE private key for the lifetime of the tab
 *  - Provide actions: login, register, logout, logoutAll, initAuth
 *  - Sync the access token with the axios interceptor and socketService
 *  - Connect/disconnect the socket on auth state changes
 *
 * On app mount, `initAuth()` is called from App.jsx. It attempts a silent
 * token refresh via the httpOnly cookie. If that succeeds the user is
 * restored without needing to log in again. The decrypted private key is
 * loaded from the keyVault (IndexedDB + sessionStorage). If the vault is
 * empty (fresh tab), `needsUnlock` is set so the UI can later prompt for
 * the password — for v1, encrypted history simply renders as locked
 * placeholders until the user logs out and back in.
 */

export const useAuthStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────────
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  // E2EE state. `privateKeyB64` is the unwrapped Curve25519 secret key.
  // It is held in memory here AND mirrored (encrypted) in the keyVault.
  privateKeyB64: null,
  needsUnlock: false,

  // ─── Internal: sync token everywhere ────────────────────────────────────
  _setToken: (token) => {
    setAccessToken(token);
    socketService.setToken(token);
    set({ accessToken: token });
  },

  _setPrivateKey: async (privateKeyB64) => {
    set({ privateKeyB64, needsUnlock: false });
    if (privateKeyB64) {
      try {
        await keyVault.storeKey(privateKeyB64);
      } catch (err) {
        // Vault failures are non-fatal — chat still works for this tab,
        // but a refresh will require re-unlock.
        console.warn("[authStore] keyVault.storeKey failed:", err.message);
      }
    }
  },

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Attempt to restore the session on app startup.
   *
   * Calls the refresh-token endpoint (the httpOnly cookie is sent
   * automatically by the browser). On success, also tries to load the
   * decrypted private key from the per-tab keyVault.
   */
  initAuth: async () => {
    set({ loading: true });

    try {
      await crypto.ready();
      const data = await authApi.refreshToken();

      if (data?.user && data?.accessToken) {
        get()._setToken(data.accessToken);

        // Try to recover the unwrapped private key for this tab.
        const privateKeyB64 = await keyVault.loadKey();

        set({
          user: data.user,
          isAuthenticated: true,
          privateKeyB64: privateKeyB64 || null,
          // If the user has E2EE keys on the server but we can't unwrap
          // locally, history is locked until they re-authenticate.
          needsUnlock:
            !!data.user.publicKey && !privateKeyB64,
        });

        socketService.connect(data.user._id);
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch {
      // Refresh failed — user needs to log in manually
      clearAccessToken();
      socketService.setToken(null);
      await keyVault.clear();

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        privateKeyB64: null,
        needsUnlock: false,
      });
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Log in with username + password. Derives the KEK from the password
   * + server-returned salt, unwraps the private key, and vaults it. If
   * the account is legacy (no publicKey on the server), silently
   * generates a fresh keypair and POSTs /auth/keys/init.
   *
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<object>} The user object on success
   */
  login: async (credentials) => {
    await crypto.ready();
    const data = await authApi.login(credentials);

    get()._setToken(data.accessToken);

    let user = data.user;
    let privateKeyB64 = null;

    if (user.publicKey && user.encryptedPrivateKey && user.privKeySalt && user.privKeyNonce) {
      // E2EE-enabled account: derive KEK and unwrap.
      const kek = crypto.deriveKEK(credentials.password, user.privKeySalt);
      try {
        privateKeyB64 = crypto.unwrapPrivateKey(
          user.encryptedPrivateKey,
          kek,
          user.privKeyNonce
        );
      } catch (err) {
        // If unwrap fails the password was right enough to authenticate
        // but the wrapped blob is corrupt or KDF parameters drifted.
        // Surface as a fatal login error.
        console.error("[authStore] private-key unwrap failed:", err.message);
        clearAccessToken();
        socketService.setToken(null);
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          privateKeyB64: null,
          needsUnlock: false,
        });
        throw new Error(
          "Failed to unlock your encryption keys. Please contact support."
        );
      }
    } else {
      // Legacy account — silently auto-init E2EE.
      const kp = crypto.generateKeypair();
      const saltB64 = crypto.randomSaltB64();
      const nonceB64 = crypto.randomNonce24B64();
      const kek = crypto.deriveKEK(credentials.password, saltB64);
      const encryptedPrivateKey = crypto.wrapPrivateKey(
        kp.privateKey,
        kek,
        nonceB64
      );

      try {
        const initResp = await authApi.initKeys({
          publicKey: kp.publicKey,
          encryptedPrivateKey,
          privKeySalt: saltB64,
          privKeyNonce: nonceB64,
        });
        if (initResp?.user) user = initResp.user;
      } catch (err) {
        // Best-effort; if init fails, the user keeps using the app
        // without E2EE for this session.
        console.warn("[authStore] auto initKeys failed:", err.message);
      }

      privateKeyB64 = kp.privateKey;
    }

    await get()._setPrivateKey(privateKeyB64);

    set({
      user,
      isAuthenticated: true,
    });

    socketService.connect(user._id);

    return user;
  },

  /**
   * Register a new account with E2EE keys generated client-side.
   *
   * @param {{ username: string, email: string, password: string }} payload
   * @returns {Promise<object>} The created user object
   */
  register: async (payload) => {
    await crypto.ready();

    // Generate fresh key material and wrap the private key with a
    // KEK derived from the password.
    const kp = crypto.generateKeypair();
    const saltB64 = crypto.randomSaltB64();
    const nonceB64 = crypto.randomNonce24B64();
    const kek = crypto.deriveKEK(payload.password, saltB64);
    const encryptedPrivateKey = crypto.wrapPrivateKey(
      kp.privateKey,
      kek,
      nonceB64
    );

    const data = await authApi.register({
      ...payload,
      publicKey: kp.publicKey,
      encryptedPrivateKey,
      privKeySalt: saltB64,
      privKeyNonce: nonceB64,
    });

    get()._setToken(data.accessToken);
    await get()._setPrivateKey(kp.privateKey);

    set({
      user: data.user,
      isAuthenticated: true,
    });

    socketService.connect(data.user._id);

    return data.user;
  },

  /**
   * Log out the current session.
   * Revokes the refresh token, clears the cookie, disconnects the
   * socket, and wipes the E2EE keyVault.
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
      await keyVault.clear();

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        privateKeyB64: null,
        needsUnlock: false,
      });
    }
  },

  /**
   * Log out from ALL devices.
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
      await keyVault.clear();

      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        privateKeyB64: null,
        needsUnlock: false,
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

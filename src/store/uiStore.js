import { create } from "zustand";

/**
 * @module uiStore
 * @description Zustand store for global UI state flags.
 *
 * Manages application-wide UI concerns that don't belong to any
 * specific feature store (auth, chat, socket). Keeps the component
 * tree free from prop-drilling for transient UI states.
 *
 * Usage:
 *   import { useUIStore } from '../store/uiStore';
 *
 *   // Inside a component
 *   const globalLoading = useUIStore((s) => s.globalLoading);
 *   const startLoading  = useUIStore((s) => s.startLoading);
 *   const stopLoading   = useUIStore((s) => s.stopLoading);
 */

export const useUIStore = create((set) => ({
  // ─── State ──────────────────────────────────────────────────────────────

  /** Whether a global loading overlay / spinner should be displayed */
  globalLoading: false,

  /** Optional loading message to display alongside the spinner */
  loadingMessage: "",

  /** Whether the mobile sidebar (contacts panel) is visible */
  mobileSidebarOpen: false,

  /** Toast notification queue — managed outside react-toastify for edge cases */
  toastQueue: [],

  // ─── Actions ────────────────────────────────────────────────────────────

  /**
   * Show the global loading indicator.
   * @param {string} [message=""] - Optional message to display
   */
  startLoading: (message = "") =>
    set({ globalLoading: true, loadingMessage: message }),

  /**
   * Hide the global loading indicator and clear the message.
   */
  stopLoading: () =>
    set({ globalLoading: false, loadingMessage: "" }),

  /**
   * Toggle the mobile sidebar visibility.
   */
  toggleMobileSidebar: () =>
    set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),

  /**
   * Explicitly set the mobile sidebar state.
   * @param {boolean} isOpen
   */
  setMobileSidebar: (isOpen) =>
    set({ mobileSidebarOpen: isOpen }),

  /**
   * Push a toast notification into the queue.
   * @param {{ type: 'success'|'error'|'info'|'warning', message: string }} toast
   */
  addToast: (toast) =>
    set((state) => ({
      toastQueue: [
        ...state.toastQueue,
        { id: Date.now(), ...toast },
      ],
    })),

  /**
   * Remove a toast from the queue by its id.
   * @param {number} id
   */
  removeToast: (id) =>
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    })),

  /**
   * Clear all pending toasts.
   */
  clearToasts: () =>
    set({ toastQueue: [] }),
}));

import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

/**
 * @component ProtectedRoute
 * @description Route guard that checks authentication state from the Zustand authStore.
 *
 * Behavior:
 *  - While `loading` is true (initial auth check in progress), shows a themed loading spinner
 *  - If `isAuthenticated` is false after loading completes, redirects to /login
 *  - If `isAuthenticated` is true, renders the child components
 *
 * Usage:
 *   <Route
 *     path="/"
 *     element={
 *       <ProtectedRoute>
 *         <Chat />
 *       </ProtectedRoute>
 *     }
 *   />
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();

  // ─── Loading State: auth check in progress ─────────────────────────────
  if (loading) {
    return <LoadingScreen />;
  }

  // ─── Not authenticated: redirect to login ──────────────────────────────
  if (!isAuthenticated) {
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ─── Authenticated: render children ────────────────────────────────────
  return children;
};

/**
 * @component LoadingScreen
 * @description Full-screen loading indicator shown while the initial auth check
 * is in progress. Uses the current theme for consistent styling.
 */
const LoadingScreen = () => {
  const { bgClass } = useTheme();

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center ${bgClass}`}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Animated Ping Logo Placeholder */}
          <div className="relative flex items-center justify-center w-16 h-16">
            {/* Outer pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute w-full h-full rounded-full border-2 opacity-50"
              style={{ borderColor: "var(--color-primary)" }}
            />

            {/* Inner pulse ring (offset timing) */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute w-full h-full rounded-full border-2 opacity-30"
              style={{ borderColor: "var(--color-accent, var(--color-primary))" }}
            />

            {/* Center body */}
            <div
              className="z-10 flex items-center justify-center w-14 h-14 rounded-full border"
              style={{
                background: "var(--color-glass)",
                borderColor: "var(--color-border)",
                boxShadow: "0 0 24px var(--color-glow)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span
                className="font-display font-bold text-2xl"
                style={{ color: "var(--color-primary)" }}
              >
                P
              </span>
            </div>
          </div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm uppercase tracking-widest font-medium"
            style={{
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-primary)",
            }}
          >
            Loading...
          </motion.p>

          {/* Subtle progress bar */}
          <motion.div
            className="w-32 h-0.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-border)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-primary), var(--color-accent, var(--color-primary)))",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProtectedRoute;

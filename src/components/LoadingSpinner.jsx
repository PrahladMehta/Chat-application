import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

/**
 * LoadingSpinner — Full-screen loading overlay with a theme-aware animated spinner.
 *
 * Used by `ProtectedRoute` while the auth state is being resolved,
 * and anywhere else a blocking loading state is needed.
 *
 * @param {object}  props
 * @param {string}  [props.message="Loading..."] - Optional message below the spinner
 * @param {boolean} [props.fullScreen=true]      - Whether to fill the entire viewport
 * @param {string}  [props.size="lg"]            - Spinner size: "sm" | "md" | "lg"
 */
const LoadingSpinner = ({
  message = "Loading...",
  fullScreen = true,
  size = "lg",
}) => {
  const { bgClass } = useTheme();

  const sizes = {
    sm: { ring: "w-8 h-8", dot: "w-2 h-2", text: "text-xs" },
    md: { ring: "w-12 h-12", dot: "w-3 h-3", text: "text-sm" },
    lg: { ring: "w-16 h-16", dot: "w-4 h-4", text: "text-base" },
  };

  const s = sizes[size] || sizes.lg;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Outer rotating ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`${s.ring} rounded-full border-2`}
          style={{
            borderColor: "var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />

        {/* Inner pulsing dot */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute ${s.dot} rounded-full`}
          style={{ backgroundColor: "var(--color-primary)" }}
        />
      </div>

      {/* Message */}
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`${s.text} font-medium tracking-wide`}
          style={{
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-primary)",
          }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );

  if (!fullScreen) {
    return spinner;
  }

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${bgClass}`}
    >
      {spinner}
    </div>
  );
};

export default LoadingSpinner;

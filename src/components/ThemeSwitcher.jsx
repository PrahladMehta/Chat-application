import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  BsDropletFill,
  BsCodeSlash,
  BsBriefcaseFill,
  BsBookFill,
  BsMoonStarsFill,
} from "react-icons/bs";

const THEME_ICONS = {
  chill: BsMoonStarsFill,
  girls: BsDropletFill,
  developer: BsCodeSlash,
  serious: BsBriefcaseFill,
  study: BsBookFill,
};

const THEME_PREVIEWS = {
  chill: {
    bg: "linear-gradient(135deg, #0a0a1f, #3d22eb)",
    dot1: "#9333ea",
    dot2: "#a855f7",
    dot3: "#06b6d4",
  },
  girls: {
    bg: "linear-gradient(135deg, #ffafcc, #bde0fe)",
    dot1: "#ffafcc",
    dot2: "#ffc8dd",
    dot3: "#bde0fe",
  },
  developer: {
    bg: "linear-gradient(135deg, #0d0208, #003b00)",
    dot1: "#00ff41",
    dot2: "#008f11",
    dot3: "#003b00",
  },
  serious: {
    bg: "linear-gradient(135deg, #f4f4f4, #e8e8e8)",
    dot1: "#003366",
    dot2: "#b22234",
    dot3: "#ffffff",
  },
  study: {
    bg: "linear-gradient(135deg, #355070, #6d597a)",
    dot1: "#6d597a",
    dot2: "#b56576",
    dot3: "#e56b6f",
  },
};

function ThemeSwitcher({ compact = false }) {
  const { theme: currentTheme, themes, changeTheme } = useTheme();

  return (
    <div
      className="glass p-4"
      style={{ borderRadius: "var(--radius-primary)" }}
    >
      {/* Header */}
      {!compact && (
        <div className="mb-3">
          <h3
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Theme
          </h3>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}
          >
            Choose your vibe
          </p>
        </div>
      )}

      {/* Theme Grid */}
      <div
        className={
          compact ? "flex flex-wrap gap-2" : "grid grid-cols-2 gap-2.5"
        }
      >
        {themes.map((themeItem, index) => {
          const Icon = THEME_ICONS[themeItem.id];
          const preview = THEME_PREVIEWS[themeItem.id];
          const isActive = currentTheme === themeItem.id;
          const isLastOdd =
            index === themes.length - 1 && themes.length % 2 === 1;

          return (
            <motion.button
              key={themeItem.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.06,
                type: "spring",
                stiffness: 250,
                damping: 18,
              }}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => changeTheme(themeItem.id)}
              className={`relative overflow-hidden cursor-pointer border-none outline-none ${
                !compact && isLastOdd ? "col-span-2" : ""
              }`}
              style={{
                padding: compact ? "0.5rem" : "0.75rem",
                borderRadius: "var(--radius-primary)",
                backgroundColor: isActive
                  ? "var(--color-primary)"
                  : "var(--color-glass)",
                border: isActive
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
                boxShadow: isActive ? "0 0 24px var(--color-glow)" : "none",
                transition:
                  "all var(--transition-speed) var(--animation-style)",
              }}
            >
              {/* Color Preview Dots */}
              {!compact && (
                <div className="flex items-center gap-1 mb-2 justify-center">
                  {[preview.dot1, preview.dot2, preview.dot3].map(
                    (color, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 + index * 0.06 + i * 0.05 }}
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: color,
                          border: "1px solid rgba(255,255,255,0.2)",
                          boxShadow: isActive ? `0 0 6px ${color}` : "none",
                        }}
                      />
                    ),
                  )}
                </div>
              )}

              {/* Icon + Label */}
              <div className="flex flex-col items-center gap-1">
                {Icon && (
                  <Icon
                    className="text-lg"
                    style={{
                      color: isActive ? "var(--color-bg)" : "var(--color-text)",
                      transition: "color 0.2s",
                    }}
                  />
                )}
                {!compact && (
                  <>
                    <span
                      className="text-xs font-semibold leading-tight"
                      style={{
                        color: isActive
                          ? "var(--color-bg)"
                          : "var(--color-text)",
                        transition: "color 0.2s",
                      }}
                    >
                      {themeItem.name}
                    </span>
                    <span
                      className="text-[9px] leading-tight opacity-60"
                      style={{
                        color: isActive
                          ? "var(--color-bg)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {themeItem.emoji}
                    </span>
                  </>
                )}
              </div>

              {/* Active Ring Pulse */}
              {isActive && (
                <motion.div
                  layoutId="theme-active-ring"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    borderRadius: "var(--radius-primary)",
                    border: "2px solid var(--color-accent)",
                    opacity: 0.5,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Current Theme Label */}
      {!compact && (
        <motion.div
          key={currentTheme}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 text-center"
        >
          <span
            className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Active:{" "}
            <span style={{ color: "var(--color-primary)" }}>
              {themes.find((t) => t.id === currentTheme)?.emoji}{" "}
              {themes.find((t) => t.id === currentTheme)?.name}
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
}

export default ThemeSwitcher;

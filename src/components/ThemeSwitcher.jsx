import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import {
  BsDropletFill,
  BsCodeSlash,
  BsBriefcaseFill,
  BsBookFill,
  BsMoonStarsFill,
} from "react-icons/bs";

const THEMES = {
  chill: {
    icon: BsMoonStarsFill,
    label: "Chill",
    emoji: "🌙",
    grad: "linear-gradient(135deg, #1a0533 0%, #3d22eb 100%)",
    accent: "#9333ea",
    text: "#e2d9f3",
  },
  girls: {
    icon: BsDropletFill,
    label: "Girls",
    emoji: "🌸",
    grad: "linear-gradient(135deg, #ffafcc 0%, #bde0fe 100%)",
    accent: "#ff85a1",
    text: "#5a2d4c",
  },
  developer: {
    icon: BsCodeSlash,
    label: "Dev",
    emoji: "💻",
    grad: "linear-gradient(135deg, #001a00 0%, #00ff41 100%)",
    accent: "#00ff41",
    text: "#00ff41",
  },
  serious: {
    icon: BsBriefcaseFill,
    label: "Serious",
    emoji: "💼",
    grad: "linear-gradient(135deg, #003366 0%, #b22234 100%)",
    accent: "#4a90d9",
    text: "#ffffff",
  },
  study: {
    icon: BsBookFill,
    label: "Study",
    emoji: "📖",
    grad: "linear-gradient(135deg, #355070 0%, #e56b6f 100%)",
    accent: "#e56b6f",
    text: "#f5e6d3",
  },
};

const SPRING = { type: "spring", stiffness: 300, damping: 26 };

function ThemeSwitcher({ compact = false }) {
  const { theme: currentTheme, themes, changeTheme } = useTheme();

  return (
    <div style={{ width: "100%" }}>
      {!compact && (
        <p
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.13em",
            color: "var(--color-text-secondary)",
            marginBottom: 10,
            opacity: 0.7,
          }}
        >
          Theme
        </p>
      )}

      {/* ── Theme Pills ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {themes.map((themeItem, index) => {
          const cfg = THEMES[themeItem.id];
          if (!cfg) return null;
          const Icon = cfg.icon;
          const isActive = currentTheme === themeItem.id;

          return (
            <motion.button
              key={themeItem.id}
              onClick={() => changeTheme(themeItem.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, ...SPRING }}
              whileHover={{ x: 4, transition: SPRING }}
              whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                overflow: "hidden",
                outline: "none",
                background: isActive ? cfg.grad : "var(--color-glass)",
                boxShadow: isActive
                  ? `0 4px 20px ${cfg.accent}55`
                  : "none",
                transition: "box-shadow 0.25s, background 0.25s",
              }}
            >
              {/* Active shimmer bar on left edge */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key="bar"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    exit={{ scaleY: 0 }}
                    transition={SPRING}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: 4,
                      background: isActive ? cfg.text : "var(--color-primary)",
                      transformOrigin: "center",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Icon bubble */}
              <motion.div
                layout
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isActive
                    ? `${cfg.text}22`
                    : "var(--color-border)",
                  transition: "background 0.25s",
                }}
              >
                <Icon
                  style={{
                    fontSize: "0.95rem",
                    color: isActive ? cfg.text : "var(--color-text-secondary)",
                    transition: "color 0.25s",
                  }}
                />
              </motion.div>

              {/* Label + emoji */}
              {!compact && (
                <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: isActive ? cfg.text : "var(--color-text)",
                      transition: "color 0.25s",
                      lineHeight: 1,
                    }}
                  >
                    {cfg.label}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "0.68rem",
                      color: isActive ? cfg.text : "var(--color-text-secondary)",
                      opacity: isActive ? 0.75 : 0.55,
                      transition: "color 0.25s, opacity 0.25s",
                    }}
                  >
                    {cfg.emoji} {themeItem.name}
                  </p>
                </div>
              )}

              {/* Active checkmark */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={SPRING}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: `${cfg.text}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 10,
                      color: cfg.text,
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
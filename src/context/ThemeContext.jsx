import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = "chatAppTheme";
const DEFAULT_THEME = "chill";

const THEMES = [
  {
    id: "chill",
    name: "Chill",
    emoji: "🌙",
    description: "Dark glassmorphism with neon glow",
  },
  {
    id: "girls",
    name: "Pastel",
    emoji: "🌸",
    description: "Soft, dreamy, and inviting",
  },
  {
    id: "developer",
    name: "Matrix",
    emoji: "💻",
    description: "Dark, sharp, terminal-inspired",
  },
  {
    id: "serious",
    name: "Pro",
    emoji: "⚖️",
    description: "Professional and structured",
  },
  {
    id: "study",
    name: "Lo-Fi",
    emoji: "📚",
    description: "Calm and warm for long sessions",
  },
];

const THEME_IDS = THEMES.map((t) => t.id);

const THEME_BACKGROUNDS = {
  chill: "mesh-gradient-chill",
  girls: "mesh-gradient-girls",
  developer: "mesh-gradient-developer",
  serious: "mesh-gradient-serious",
  study: "mesh-gradient-study",
};

/**
 * Apply a theme class to the <html> element and remove all others.
 * @param {string} themeId
 */
function applyThemeToDOM(themeId) {
  const root = document.documentElement;
  THEME_IDS.forEach((id) => root.classList.remove(`theme-${id}`));
  root.classList.add(`theme-${themeId}`);
}

/**
 * Hook to consume the theme context.
 * Must be used inside a <ThemeProvider>.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return context;
}

/**
 * ThemeProvider — wraps the app and provides:
 *   - theme        : current theme id string
 *   - themes       : array of all theme definitions
 *   - changeTheme  : function to switch theme
 *   - bgClass      : the mesh-gradient-* class for the current theme
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved && THEME_IDS.includes(saved)) return saved;
    } catch {
      // localStorage may be unavailable
    }
    return DEFAULT_THEME;
  });

  // Apply theme to DOM on mount and whenever it changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const changeTheme = useCallback((newTheme) => {
    if (!THEME_IDS.includes(newTheme)) {
      console.warn(
        `Unknown theme "${newTheme}". Available: ${THEME_IDS.join(", ")}`,
      );
      return;
    }
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // silently fail if localStorage is full / unavailable
    }
  }, []);

  const bgClass = THEME_BACKGROUNDS[theme] || THEME_BACKGROUNDS[DEFAULT_THEME];

  const value = {
    theme,
    themes: THEMES,
    changeTheme,
    bgClass,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export default ThemeContext;

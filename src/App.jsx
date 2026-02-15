import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { useAuthStore } from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import SetAvatar from "./pages/Setavatar";

function App() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // While the auth store is trying to silently refresh the session,
  // don't render anything yet. This prevents a brief flash of the
  // login page before the user is restored.
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a14]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin" />
            <p className="text-white/40 text-sm tracking-wide">Loading…</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── Public Routes ───────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ─── Protected Routes ────────────────────────────────── */}
          <Route
            path="/setavatar"
            element={
              <ProtectedRoute>
                <SetAvatar />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* ─── Catch-all ───────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

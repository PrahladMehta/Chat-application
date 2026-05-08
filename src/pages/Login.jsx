import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import PingLogo from "../components/PingLogo";
import { useAuthStore } from "../store/authStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const nav = useNavigate();
  const { bgClass } = useTheme();

  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const toastOp = {
    theme: "dark",
  };

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      nav("/");
    }
  }, [isAuthenticated, nav]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validation()) return;

    setIsSubmitting(true);

    try {
      const user = await login({
        username: values.username,
        password: values.password,
      });

      // If the user hasn't set their avatar yet, redirect to avatar page
      if (user && !user.isAvatarImageSet) {
        nav("/setavatar");
      } else {
        nav("/");
      }
    } catch (err) {
      // Extract error message from the API response
      console.log(err);
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";

      toast.error(message, toastOp);
    } finally {
      setIsSubmitting(false);
    }
  }

  function validation() {
    const { username, password } = values;

    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters", toastOp);
      return false;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters", toastOp);
      return false;
    }

    return true;
  }

  function changeHandler(event) {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  return (
    <>
      <div
        className={`min-h-screen w-full flex items-center justify-center p-4 ${bgClass}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="glass p-8 md:p-12 w-full max-w-md"
          style={{ borderRadius: "var(--radius-primary)" }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <PingLogo />
              <h1
                className="text-3xl md:text-4xl font-bold gradient-text"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                Ping
              </h1>
            </motion.div>

            {/* Username Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.25,
                type: "spring",
                stiffness: 150,
                damping: 12,
              }}
            >
              <input
                type="text"
                placeholder="Username"
                name="username"
                required
                onChange={changeHandler}
                className="input-chill"
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.35,
                type: "spring",
                stiffness: 150,
                damping: 12,
              }}
            >
              <input
                type="password"
                placeholder="Password"
                name="password"
                required
                onChange={changeHandler}
                className="input-chill"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="submit"
              disabled={isSubmitting}
              className="btn-chill w-full mt-2"
              style={{
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </motion.button>

            {/* Register Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm uppercase tracking-wide"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Create account?{" "}
              <NavLink
                to="/register"
                className="hover:opacity-80 transition-all duration-300 no-underline font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                Sign Up
              </NavLink>
            </motion.p>
          </form>
        </motion.div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Login;

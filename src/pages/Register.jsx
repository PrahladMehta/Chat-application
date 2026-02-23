import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import PingLogo from "../components/PingLogo";
import { useAuthStore } from "../store/authStore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const nav = useNavigate();
  const { bgClass } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const register = useAuthStore((s) => s.register);

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toastOp = {
    theme: "dark",
    draggable: true,
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      nav("/");
    }
  }, [isAuthenticated, nav]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validation()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const user = await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });

      // If user hasn't set avatar yet, redirect to avatar page
      if (!user.isAvatarImageSet) {
        nav("/setavatar");
      } else {
        nav("/");
      }
    } catch (err) {
      // Extract error message from the standardized API response
      const message =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      // If there are field-level validation details, show the first one
      const details = err.response?.data?.error?.details;
      if (details && details.length > 0) {
        details.forEach((detail) => {
          toast.error(detail.message, toastOp);
        });
      } else {
        toast.error(message, toastOp);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function validation() {
    const { username, email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      toast.error("Confirm password and password do not match", toastOp);
      return false;
    } else if (username.length < 3) {
      toast.error("Username must be at least 3 characters", toastOp);
      return false;
    } else if (username.length > 20) {
      toast.error("Username must be at most 20 characters", toastOp);
      return false;
    } else if (password.length < 8) {
      toast.error("Password must be at least 8 characters", toastOp);
      return false;
    } else if (!/[A-Z]/.test(password)) {
      toast.error(
        "Password must contain at least one uppercase letter",
        toastOp,
      );
      return false;
    } else if (!/[a-z]/.test(password)) {
      toast.error(
        "Password must contain at least one lowercase letter",
        toastOp,
      );
      return false;
    } else if (!/\d/.test(password)) {
      toast.error("Password must contain at least one number", toastOp);
      return false;
    } else if (!/[@$!%*?&#+\-_.]/.test(password)) {
      toast.error(
        "Password must contain at least one special character",
        toastOp,
      );
      return false;
    } else if (!email || email.trim() === "") {
      toast.error("Email is required", toastOp);
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please provide a valid email address", toastOp);
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

  const inputFields = [
    { type: "text", placeholder: "Username", name: "username" },
    { type: "email", placeholder: "Email", name: "email" },
    { type: "password", placeholder: "Password", name: "password" },
    {
      type: "password",
      placeholder: "Confirm Password",
      name: "confirmPassword",
    },
  ];

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
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {/* Input Fields */}
            {inputFields.map((field, index) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 150,
                  damping: 12,
                }}
              >
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  name={field.name}
                  required
                  onChange={changeHandler}
                  className="input-chill"
                />
              </motion.div>
            ))}

            {/* Password Strength Indicator */}
            {values.password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-1.5"
              >
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((level) => {
                    let strength = 0;
                    if (values.password.length >= 8) strength++;
                    if (
                      /[A-Z]/.test(values.password) &&
                      /[a-z]/.test(values.password)
                    )
                      strength++;
                    if (/\d/.test(values.password)) strength++;
                    if (/[@$!%*?&#+\-_.]/.test(values.password)) strength++;
                    return (
                      <motion.div
                        key={level}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: level * 0.08 }}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          level <= strength
                            ? strength <= 1
                              ? "bg-red-500"
                              : strength <= 2
                                ? "bg-yellow-500"
                                : strength <= 3
                                  ? "bg-cyan-400"
                                  : "bg-green-400 shadow-glow-cyan"
                            : "bg-white/10"
                        }`}
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-white/40">
                  {(() => {
                    let s = 0;
                    if (values.password.length >= 8) s++;
                    if (
                      /[A-Z]/.test(values.password) &&
                      /[a-z]/.test(values.password)
                    )
                      s++;
                    if (/\d/.test(values.password)) s++;
                    if (/[@$!%*?&#+\-_.]/.test(values.password)) s++;
                    if (s <= 1) return "Too weak";
                    if (s === 2) return "Fair";
                    if (s === 3) return "Good";
                    return "Strong";
                  })()}
                </span>
              </motion.div>
            )}

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
              {isSubmitting ? "Creating Account..." : "Create User"}
            </motion.button>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-center text-sm uppercase tracking-wide"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="hover:opacity-80 transition-all duration-300 no-underline font-medium"
                style={{ color: "var(--color-primary)" }}
              >
                Login
              </NavLink>
            </motion.p>
          </form>
        </motion.div>
      </div>
      <ToastContainer />
    </>
  );
};

export default Register;

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.svg";
import { registerRouter } from "../utils/Apiroutes";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const nav = useNavigate();
  const { bgClass } = useTheme();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const toastOp = {
    theme: "dark",
    draggable: true,
  };

  async function handleSubmit(event) {
    event.preventDefault();

    if (validation()) {
      const response = await axios.post(registerRouter, values);
      const { data } = response;

      if (data.status === false) {
        toast.error(data.message, toastOp);
      }

      if (data.status) {
        localStorage.setItem("chat-app-user", JSON.stringify(data.user));
        nav("/");
      }
    }
  }

  function validation() {
    const { username, email, password, confirmPassword } = values;

    if (password !== confirmPassword) {
      toast.error("Confirm password and password do not match", toastOp);
      return false;
    } else if (username.length < 4) {
      toast.error("Username length must be at least 4 characters", toastOp);
      return false;
    } else if (password.length < 8) {
      toast.error("Password length must be at least 8 characters", toastOp);
      return false;
    } else if (email !== "" && email.length < 9) {
      toast.error("Email is invalid", toastOp);
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

  useEffect(() => {
    if (localStorage.getItem("chat-app-user")) {
      nav("/");
    }
  }, []);

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
              <img src={logo} alt="logo" className="h-12" />
              <h1
                className="text-3xl md:text-4xl font-bold gradient-text"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                Snappy
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
                    const strength =
                      values.password.length >= 12
                        ? 4
                        : values.password.length >= 10
                          ? 3
                          : values.password.length >= 8
                            ? 2
                            : 1;
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
                  {values.password.length < 8
                    ? "Too short"
                    : values.password.length < 10
                      ? "Fair"
                      : values.password.length < 12
                        ? "Good"
                        : "Strong"}
                </span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              type="submit"
              className="btn-chill w-full mt-2"
            >
              Create User
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

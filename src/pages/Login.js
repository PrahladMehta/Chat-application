import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.svg";
import { loginRouter } from "../utils/Apiroutes";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const nav = useNavigate();
  const { bgClass } = useTheme();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
  });

  const toastOp = {
    theme: "dark",
  };

  async function handleSubmit(event) {
    event.preventDefault();

    if (validation()) {
      const response = await axios.post(loginRouter, values);
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
    const { username, password } = values;

    if (username.length < 4) {
      toast.error("Username is invalid", toastOp);
      return false;
    } else if (password.length < 8) {
      toast.error("Password not correct", toastOp);
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
              <img src={logo} alt="logo" className="h-12" />
              <h1
                className="text-3xl md:text-4xl font-bold gradient-text"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                Snappy
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
              className="btn-chill w-full mt-2"
            >
              Login
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

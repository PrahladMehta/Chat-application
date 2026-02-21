import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userApi } from "../api/userApi";
import { useAuthStore } from "../store/authStore";
import { Buffer } from "buffer";
import multiavatar from "@multiavatar/multiavatar/esm";

const SetAvatar = () => {
  const nav = useNavigate();
  const { bgClass } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    theme: "dark",
    draggable: true,
  };

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      try {
        const data = await userApi.setAvatar(user._id, avatars[selectedAvatar]);

        if (data.isSet) {
          // Update the user in the Zustand auth store
          updateUser({
            isAvatarImageSet: true,
            avatarImage: data.image,
          });
          nav("/");
        } else {
          toast.error("Error setting avatar. Please try again", toastOptions);
        }
      } catch (err) {
        const message =
          err?.response?.data?.error?.message ||
          "Error setting avatar. Please try again";
        toast.error(message, toastOptions);
      }
    }
  };

  const refreshAvatars = () => {
    setSelectedAvatar(undefined);
    fetchData();
  };

  async function fetchData() {
    try {
      setIsLoading(true);
      const data = [];

      for (let i = 0; i < 4; i++) {
        const randomId = `avatar_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        const svgCode = multiavatar(randomId);
        const buffer = new Buffer(svgCode);
        data.push(buffer.toString("base64"));
      }

      setAvatars(data);
      setIsLoading(false);
    } catch (e) {
      console.log("Error generating avatars:", e);
      toast.error("Error generating avatars. Please try again.", toastOptions);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!user) {
      nav("/login");
    } else {
      fetchData();
    }
  }, []);

  return (
    <>
      <div
        className={`min-h-screen w-full flex items-center justify-center p-4 ${bgClass}`}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6"
            >
              <img
                src={loader}
                alt="loading"
                className="w-48 md:w-64 max-w-full"
              />
              <p
                className="text-lg animate-pulse-glow"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-primary)",
                }}
              >
                Generating avatars...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
              className="glass p-8 md:p-12 w-full max-w-4xl"
              style={{ borderRadius: "var(--radius-primary)" }}
            >
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-center mb-10"
              >
                <h1
                  className="text-2xl md:text-3xl lg:text-4xl font-bold gradient-text"
                  style={{ fontFamily: "var(--font-primary)" }}
                >
                  Pick an Avatar
                </h1>
                <p
                  className="mt-2 text-sm md:text-base"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Choose your profile picture
                </p>
              </motion.div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                {avatars.map((avatar, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 0.2 + idx * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                    whileHover={{ scale: 1.08, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(idx)}
                    className={`
                      relative glass-dark p-5 md:p-6 cursor-pointer
                      transition-all duration-300 spring-transition
                      flex items-center justify-center
                      ${selectedAvatar === idx ? "glow-effect" : ""}
                    `}
                    style={{
                      borderRadius: "var(--radius-primary)",
                      border:
                        selectedAvatar === idx
                          ? "3px solid var(--color-primary)"
                          : "1px solid var(--color-border)",
                      boxShadow:
                        selectedAvatar === idx
                          ? "0 0 24px var(--color-glow)"
                          : "none",
                    }}
                  >
                    {/* Selection Indicator */}
                    {selectedAvatar === idx && (
                      <motion.div
                        layoutId="selection-ring"
                        className="absolute inset-0 animate-pulse-glow pointer-events-none"
                        style={{
                          borderRadius: "var(--radius-primary)",
                          border: "3px solid var(--color-primary)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      />
                    )}

                    <img
                      src={`data:image/svg+xml;base64,${avatar}`}
                      alt={`avatar-${idx}`}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full relative z-10"
                    />

                    {/* Selected Check */}
                    {selectedAvatar === idx && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 15,
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-20"
                        style={{
                          backgroundColor: "var(--color-primary)",
                          boxShadow: "0 0 14px var(--color-glow)",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={setProfilePicture}
                  className="btn-chill w-full sm:w-auto sm:min-w-[220px]"
                >
                  Set Profile Picture
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={refreshAvatars}
                  className="
                    px-6 py-3
                    transition-all duration-300
                    font-medium uppercase tracking-wide text-base cursor-pointer
                    w-full sm:w-auto sm:min-w-[180px]
                  "
                  style={{
                    borderRadius: "var(--radius-primary)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-glass)",
                    color: "var(--color-text)",
                  }}
                >
                  Shuffle Avatars
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ToastContainer />
    </>
  );
};

export default SetAvatar;

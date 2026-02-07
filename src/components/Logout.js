import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiPowerOff } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Logout = () => {
  const nav = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const { theme } = useTheme();

  function handleLogout() {
    localStorage.clear();
    nav("/login");
  }

  return (
    <div className="relative">
      {/* Logout Button */}
      <motion.button
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.88 }}
        transition={{ type: "spring", stiffness: 400, damping: 12 }}
        onClick={() => setShowConfirm(true)}
        title="Logout"
        className="
          p-2.5 rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          group
        "
        style={{
          backgroundColor: "var(--color-glass)",
          border: "1px solid var(--color-border)",
        }}
      >
        <BiPowerOff
          className="text-lg transition-colors duration-300"
          style={{ color: "var(--color-secondary, #ef4444)", opacity: 0.7 }}
        />
      </motion.button>

      {/* Confirmation Modal Overlay */}
      <AnimatePresence>
        {showConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowConfirm(false)}
              className="fixed inset-0 z-50"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(var(--blur-strength))",
                WebkitBackdropFilter: "blur(var(--blur-strength))",
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="
                fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                p-6 md:p-8 w-[90vw] max-w-sm
                text-center
              "
              style={{
                backgroundColor: "var(--color-bg)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-primary)",
                boxShadow: "0 8px 32px var(--color-shadow)",
              }}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
                className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--color-glass)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 0 25px var(--color-glow)",
                }}
              >
                <BiPowerOff
                  className="text-3xl"
                  style={{ color: "var(--color-secondary, #ef4444)" }}
                />
              </motion.div>

              {/* Title */}
              <h3
                className="text-xl font-bold mb-2"
                style={{
                  color: "var(--color-text)",
                  fontFamily: "var(--font-primary)",
                }}
              >
                Logout?
              </h3>

              {/* Description */}
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Are you sure you want to sign out? You'll need to log in again
                to continue chatting.
              </p>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={() => setShowConfirm(false)}
                  className="
                    flex-1 px-4 py-2.5
                    transition-all duration-300 cursor-pointer
                    text-sm font-medium spring-transition
                  "
                  style={{
                    borderRadius: "var(--radius-primary)",
                    backgroundColor: "var(--color-glass)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  onClick={handleLogout}
                  className="
                    flex-1 px-4 py-2.5
                    font-medium text-sm
                    transition-all duration-300 cursor-pointer
                    border-none spring-transition
                  "
                  style={{
                    borderRadius: "var(--radius-primary)",
                    background:
                      "linear-gradient(135deg, var(--color-secondary, #dc2626), var(--color-primary))",
                    color:
                      theme === "serious" || theme === "girls"
                        ? "#ffffff"
                        : "var(--color-bg)",
                    boxShadow: "0 0 20px var(--color-glow)",
                  }}
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Logout;

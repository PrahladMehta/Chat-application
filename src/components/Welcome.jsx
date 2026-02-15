import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Robot from "../assets/robot.gif";

const Welcome = ({ currUser }) => {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center p-8 select-none">
      {/* Floating Robot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="mb-8"
      >
        <motion.img
          src={Robot}
          alt="Welcome Robot"
          animate={{ y: [0, -16, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 drop-shadow-glow"
        />
      </motion.div>

      {/* Welcome Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 12 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
        style={{ fontFamily: "var(--font-primary)" }}
      >
        <span style={{ color: "var(--color-text)" }}>Welcome, </span>
        <span className="gradient-text">{currUser?.username || "Friend"}</span>
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.6,
            type: "spring",
            stiffness: 300,
            damping: 10,
          }}
          className="inline-block ml-2"
        >
          ✨
        </motion.span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.35,
          type: "spring",
          stiffness: 100,
          damping: 12,
        }}
        className="text-base md:text-lg max-w-md leading-relaxed"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Please select a chat to start messaging
      </motion.p>

      {/* Decorative divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        className="mt-8 w-24 h-[2px] rounded-full"
        style={{
          background: `linear-gradient(to right, transparent, var(--color-primary), transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Hint chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.65,
          type: "spring",
          stiffness: 100,
          damping: 14,
        }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3"
      >
        {[
          { emoji: "💬", label: "Start a chat" },
          { emoji: "👥", label: "Find friends" },
          { emoji: "🎮", label: "Play games" },
        ].map((chip, index) => (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.8 + index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex items-center gap-2 px-4 py-2
              text-sm
              transition-all duration-300 cursor-pointer
              spring-transition
            "
            style={{
              borderRadius: "var(--radius-primary)",
              backgroundColor: "var(--color-glass)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span>{chip.emoji}</span>
            <span>{chip.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Welcome;

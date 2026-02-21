import React, { useState, useRef, useEffect, useCallback } from "react";
import Picker from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmileFill } from "react-icons/bs";
import { MdAttachFile } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";
import { socketService } from "../services/socketService";
import { SOCKET_EVENTS, TYPING_CONFIG } from "../constants/socketEvents";

const ChatInput = ({ handleSendMes, currChat }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mes, setMes] = useState("");
  const emojiRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const { theme } = useTheme();

  const isDarkTheme = theme === "developer" || theme === "study";

  const handleEmojiPickerHideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (event) => {
    setMes((prev) => prev + event.emoji);
    inputRef.current?.focus();
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Emit typing indicators ─────────────────────────────────────
  const handleTyping = () => {
    if (!currChat) return;

    // Emit typing start (debounced - only once after user starts typing)
    if (!typingDebounceRef.current) {
      typingDebounceRef.current = setTimeout(() => {
        socketService.emit(SOCKET_EVENTS.TYPING_START, { to: currChat._id });
        typingDebounceRef.current = null;
      }, TYPING_CONFIG.DEBOUNCE_MS);
    }

    // Reset the auto-stop timer on each keystroke
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emit(SOCKET_EVENTS.TYPING_STOP, { to: currChat._id });
      typingTimeoutRef.current = null;
    }, TYPING_CONFIG.AUTO_CLEAR_MS);
  };

  const stopTyping = useCallback(() => {
    if (!currChat) return;
    
    // Clear all timers
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = null;
    }
    
    // Immediately stop typing indicator
    socketService.emit(SOCKET_EVENTS.TYPING_STOP, { to: currChat._id });
  }, [currChat]);

  // Cleanup on unmount or when currChat changes
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  const sentChat = (e) => {
    e.preventDefault();
    if (mes.length > 0) {
      // Stop typing indicator when sending
      stopTyping();
      
      handleSendMes(mes);
      setMes("");
    }
  };

  // Handle input change with typing indicators
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMes(value);

    if (value.trim().length > 0) {
      handleTyping();
    } else {
      // Stop typing if input is empty
      stopTyping();
    }
  };

  const hasText = mes.trim().length > 0;

  return (
    <div className="relative px-3 py-3 md:px-5 md:py-4">
      {/* ─── Emoji Picker Popover ─── */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={emojiRef}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="
              absolute bottom-full left-3 md:left-5 mb-3 z-50
              overflow-hidden
            "
            style={{
              borderRadius: "var(--radius-primary)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 8px 32px var(--color-shadow)",
            }}
          >
            <Picker
              onEmojiClick={handleEmojiClick}
              theme={isDarkTheme ? "dark" : "light"}
              searchDisabled={false}
              skinTonesDisabled
              height={350}
              width={320}
              previewConfig={{ showPreview: false }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Input Bar ─── */}
      <form onSubmit={sentChat}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="
          flex items-center gap-2 md:gap-3
          px-3 py-2 md:px-4 md:py-2.5
          transition-all duration-300
        "
          style={{
            backgroundColor: "var(--color-glass)",
            backdropFilter: "blur(var(--blur-strength))",
            WebkitBackdropFilter: "blur(var(--blur-strength))",
            border: "1px solid var(--color-border)",
            borderRadius:
              theme === "developer" || theme === "serious" ? "4px" : "9999px",
            boxShadow: "0 4px 15px var(--color-shadow)",
          }}
        >
          {/* ─── Emoji Button ─── */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: 10 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            type="button"
            onClick={handleEmojiPickerHideShow}
            className="p-2 rounded-full transition-all duration-300 cursor-pointer border-none bg-transparent flex items-center justify-center"
            style={{
              backgroundColor: showEmojiPicker
                ? "rgba(234, 179, 8, 0.15)"
                : "transparent",
              boxShadow: showEmojiPicker
                ? "0 0 12px rgba(234, 179, 8, 0.3)"
                : "none",
            }}
            title="Emoji"
          >
            <BsEmojiSmileFill
              className="text-xl transition-colors duration-300"
              style={{
                color: showEmojiPicker
                  ? "#facc15"
                  : theme === "developer"
                    ? "#00ff41"
                    : "#facc15",
                opacity: showEmojiPicker ? 1 : 0.7,
              }}
            />
          </motion.button>

          {/* ─── Attach Button ─── */}
          <motion.button
            whileHover={{ scale: 1.15, rotate: -15 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            type="button"
            className="
              p-2 rounded-full transition-all duration-300
              cursor-pointer border-none bg-transparent
              flex items-center justify-center
              hidden sm:flex
            "
            title="Attach file"
          >
            <MdAttachFile
              className="text-xl transition-colors duration-300"
              style={{ color: "var(--color-primary)", opacity: 0.7 }}
            />
          </motion.button>

          {/* ─── Text Input ─── */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={mes}
            onChange={handleInputChange}
            className="flex-1 min-w-0 bg-transparent outline-none text-sm md:text-base py-1"
            style={{
              color: "var(--color-text)",
              fontFamily:
                theme === "developer"
                  ? "'JetBrains Mono', monospace"
                  : "inherit",
            }}
          />

          {/* ─── Send Button ─── */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85, rotate: -15 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            type="submit"
            disabled={!hasText}
            className="p-2.5 flex items-center justify-center transition-all duration-300 cursor-pointer border-none"
            style={{
              borderRadius:
                theme === "developer" || theme === "serious" ? "4px" : "9999px",
              background: hasText
                ? `linear-gradient(135deg, var(--color-primary), var(--color-accent))`
                : "var(--color-glass)",
              boxShadow: hasText ? "0 0 20px var(--color-glow)" : "none",
              opacity: hasText ? 1 : 0.5,
              cursor: hasText ? "pointer" : "not-allowed",
            }}
            title="Send message"
          >
            <IoMdSend
              className="text-lg md:text-xl transition-transform duration-300"
              style={{
                color: hasText
                  ? "var(--color-bg)"
                  : "var(--color-text-secondary)",
                transform: hasText ? "translateX(1px)" : "none",
              }}
            />
          </motion.button>
        </motion.div>
      </form>

      {/* ─── Typing Hint ─── */}
      <AnimatePresence>
        {hasText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-end mt-1.5 mr-4"
          >
            <span
              className="text-[10px] tracking-wide"
              style={{ color: "var(--color-text-secondary)", opacity: 0.4 }}
            >
              Press{" "}
              <kbd
                className="px-1.5 py-0.5 rounded font-mono text-[10px] mx-0.5"
                style={{
                  backgroundColor: "var(--color-glass)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                Enter
              </kbd>{" "}
              to send
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatInput;

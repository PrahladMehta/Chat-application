import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiSearch } from "react-icons/bi";
import { cn } from "../utils/cn";
import { useTheme } from "../context/ThemeContext";
import PingLogo from "./PingLogo";

/* ─────────────────────────────────────────────────────────────────────────────
   ANIMATION PHILOSOPHY FOR THIS FILE:
   • Only 3 types of animation: enter/exit, hover lift, click press
   • NO blur filters (cause GPU repaint jank)
   • NO physics springs on every tiny element
   • NO magnetic cursor tracking (expensive per-frame)
   • Stagger list items ONCE on mount — not on every re-render
   • Use CSS transitions for color/shadow changes (cheaper than framer)
───────────────────────────────────────────────────────────────────────────── */

/* Shared spring — used everywhere so motion feels cohesive */
const SPRING = { type: "spring", stiffness: 260, damping: 24 };

/* List stagger — children animate in one-by-one, smoothly */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: SPRING },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ─── Ripple (lightweight — only runs on click, not every frame) ─────────── */
const useRipple = () => {
  const [ripples, setRipples] = useState([]);
  const addRipple = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };
  return [ripples, addRipple];
};

/* ─── Single Contact Row ─────────────────────────────────────────────────── */
const ContactRow = ({ contact, isSelected, onClick }) => {
  const [ripples, addRipple] = useRipple();

  const handleClick = (e) => {
    addRipple(e);
    onClick();
  };

  return (
    <motion.div
      variants={itemVariants}
      layout="position"
      onClick={handleClick}
      whileHover={{ y: -2, transition: SPRING }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
      className="relative flex items-center gap-3 p-3 cursor-pointer overflow-hidden"
      style={{
        borderRadius: "var(--radius-primary)",
        /* CSS transition handles color — no framer overhead */
        transition: "background 0.2s, box-shadow 0.2s, border-color 0.2s",
        border: isSelected
          ? "1.5px solid var(--color-primary)"
          : "1.5px solid transparent",
        background: isSelected
          ? "var(--color-glass)"
          : "transparent",
        boxShadow: isSelected
          ? "0 4px 24px var(--color-glow)"
          : "none",
      }}
    >
      {/* Ripple */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 9, opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.2, 0, 0.4, 1] }}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "var(--color-primary)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Avatar */}
      <div className="relative flex-shrink-0" style={{ zIndex: 1 }}>
        <img
          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
          alt={contact.username}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            /* CSS ring — no framer needed */
            transition: "box-shadow 0.2s",
            boxShadow: isSelected
              ? "0 0 0 2px var(--color-primary)"
              : "0 0 0 2px transparent",
          }}
        />
        {/* Online dot — static, no animation needed */}
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#4ade80",
            border: "2px solid var(--color-bg)",
          }}
        />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
        <p
          className="text-sm font-medium truncate"
          style={{
            color: isSelected ? "var(--color-text)" : "var(--color-text-secondary)",
            transition: "color 0.2s",
          }}
        >
          {contact.username}
        </p>
        <p
          className="text-xs mt-0.5 truncate"
          style={{ color: "var(--color-text-secondary)", opacity: 0.55 }}
        >
          {isSelected ? "Active now" : "Tap to chat"}
        </p>
      </div>

      {/* Selected dot — springs in cleanly */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            key="dot"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={SPRING}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              flexShrink: 0,
              zIndex: 1,
              background: "var(--color-primary)",
              boxShadow: "0 0 8px var(--color-glow)",
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */

const Contact = ({ contacts, currentUser, chatChange }) => {
  const [currUserName, setCurrName] = useState(undefined);
  const [currUserImage, setCurrUserImage] = useState(undefined);
  const [currSelected, setCurrSelected] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setCurrName(currentUser.username);
      setCurrUserImage(currentUser.avatarImage);
    }
  }, [currentUser]);

  const changeCurrentChat = (index, contact) => {
    setCurrSelected(index);
    chatChange(contact);
  };

  const filteredContacts = contacts.filter((c) =>
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {currUserImage && currUserName && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "18px 16px",
              borderBottom: "1px solid var(--color-border)",
              flexShrink: 0,
            }}
          >
            <PingLogo />
            <h3
              className="gradient-text"
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontFamily: "var(--font-primary)",
                margin: 0,
              }}
            >
              Ping
            </h3>
          </motion.div>

          {/* ── Search ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{ padding: "10px 14px", flexShrink: 0 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "9px 12px",
                borderRadius: "var(--radius-primary)",
                background: "var(--color-glass)",
                /* CSS handles focus ring — smooth, no framer needed */
                outline: searchFocused
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
                outlineOffset: -1,
                transition: "outline 0.18s, box-shadow 0.18s",
                boxShadow: searchFocused ? "0 0 14px var(--color-glow)" : "none",
              }}
            >
              <BiSearch
                style={{
                  fontSize: "1.1rem",
                  flexShrink: 0,
                  color: searchFocused
                    ? "var(--color-primary)"
                    : "var(--color-text-secondary)",
                  transition: "color 0.18s",
                }}
              />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "0.85rem",
                  color: "var(--color-text)",
                  width: "100%",
                }}
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ ...SPRING, damping: 20 }}
                    onClick={() => setSearchQuery("")}
                    style={{
                      width: 17,
                      height: 17,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      fontSize: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--color-text-secondary)",
                      color: "var(--color-bg)",
                    }}
                  >
                    ✕
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Contact list ── */}
          <div
            className="scrollbar-thin scrollbar-theme"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "6px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <AnimatePresence mode="wait">
              {filteredContacts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    height: 120,
                  }}
                >
                  <span style={{ fontSize: 24 }}>🔍</span>
                  <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", opacity: 0.5, margin: 0 }}>
                    No contacts found
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  {filteredContacts.map((contact, index) => (
                    <ContactRow
                      key={contact._id || index}
                      contact={contact}
                      isSelected={index === currSelected}
                      onClick={() => changeCurrentChat(index, contact)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Footer / Current User ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...SPRING }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 16px",
              borderTop: "1px solid var(--color-border)",
              background: "var(--color-glass)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              flexShrink: 0,
            }}
          >
            {/* Avatar — only this one gets hover scale, nothing else */}
            <motion.div
              className="relative"
              style={{ flexShrink: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              transition={SPRING}
            >
              <img
                src={`data:image/svg+xml;base64,${currUserImage}`}
                alt={currUserName}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                  cursor: "pointer",
                  boxShadow: "0 0 0 2px var(--color-primary)",
                }}
              />
              {/* Breathing online dot — gentle, slow, not distracting */}
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  bottom: 1,
                  right: 1,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#4ade80",
                  border: "2px solid var(--color-bg)",
                  display: "block",
                }}
              />
            </motion.div>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currUserName}
              </p>
              <p style={{ fontSize: "0.7rem", color: "var(--color-primary)", opacity: 0.8, margin: "2px 0 0" }}>
                Online
              </p>
            </div>

            {/* Dots menu */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.88 }}
              transition={SPRING}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "center",
                padding: "6px 8px",
                cursor: "pointer",
                borderRadius: 8,
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 3.5,
                    height: 3.5,
                    borderRadius: "50%",
                    background: "var(--color-text-secondary)",
                    display: "block",
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Contact;
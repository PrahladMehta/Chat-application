import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BiSearch } from "react-icons/bi";
import { cn } from "../utils/cn";
import { useTheme } from "../context/ThemeContext";
import PingLogo from "./PingLogo";

const Contact = ({ contacts, currentUser, chatChange }) => {
  const { theme } = useTheme();
  const [currUserName, setCurrName] = useState(undefined);
  const [currUserImage, setCurrUserImage] = useState(undefined);
  const [currSelected, setCurrSelected] = useState(undefined);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredContacts = contacts.filter((contact) =>
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {currUserImage && currUserName && (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* ─── Brand Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-3 px-4 py-5"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <PingLogo />
            <h3
              className="text-lg font-bold uppercase tracking-wider gradient-text"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              Ping
            </h3>
          </motion.div>

          {/* ─── Search Bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="px-4 py-3"
          >
            <div
              className="flex items-center gap-2 px-3 py-2.5 transition-all duration-300"
              style={{
                borderRadius: "var(--radius-primary)",
                backgroundColor: "var(--color-glass)",
                border: "1px solid var(--color-border)",
              }}
            >
              <BiSearch
                className="text-lg flex-shrink-0"
                style={{ color: "var(--color-text-secondary)" }}
              />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
                style={{
                  color: "var(--color-text)",
                }}
              />
            </div>
          </motion.div>

          {/* ─── Contacts List ─── */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin scrollbar-theme">
            <AnimatePresence>
              {filteredContacts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-32"
                >
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--color-text-secondary)",
                      opacity: 0.5,
                    }}
                  >
                    No contacts found
                  </p>
                </motion.div>
              ) : (
                filteredContacts.map((contact, index) => {
                  const isSelected = index === currSelected;

                  return (
                    <motion.div
                      key={contact._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        delay: index * 0.04,
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      whileHover={{ x: 4, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeCurrentChat(index, contact)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer",
                        "transition-all duration-300 spring-transition",
                        !isSelected && "glass-dark",
                      )}
                      style={{
                        borderRadius: "var(--radius-primary)",
                        border: isSelected
                          ? "2px solid var(--color-primary)"
                          : "1px solid transparent",
                        backgroundColor: isSelected
                          ? "var(--color-glass)"
                          : undefined,
                        boxShadow: isSelected
                          ? "0 0 20px var(--color-glow)"
                          : "none",
                      }}
                    >
                      {/* Avatar with Status Ring */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                          alt={contact.username}
                          className="w-12 h-12 rounded-full transition-all duration-300"
                          style={{
                            boxShadow: isSelected
                              ? "0 0 0 2px var(--color-primary)"
                              : "none",
                          }}
                        />
                        {/* Online Status Dot */}
                        <div
                          className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                          style={{
                            backgroundColor: "#4ade80",
                            borderColor: isSelected
                              ? "var(--color-glass)"
                              : "var(--color-bg)",
                            boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
                          }}
                        />
                        {/* Pulse ring on selected */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute inset-0 rounded-full animate-pulse-glow pointer-events-none"
                            style={{
                              boxShadow: "0 0 0 2px var(--color-primary)",
                            }}
                          />
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm font-medium truncate transition-colors duration-300"
                          style={{
                            color: isSelected
                              ? "var(--color-text)"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          {contact.username}
                        </h3>
                        <p
                          className="text-xs mt-0.5 truncate"
                          style={{
                            color: "var(--color-text-secondary)",
                            opacity: 0.7,
                          }}
                        >
                          {isSelected ? "Active now" : "Tap to chat"}
                        </p>
                      </div>

                      {/* Active Indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                          }}
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            boxShadow: "0 0 10px var(--color-glow)",
                          }}
                        />
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* ─── Current User Footer ─── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center gap-3 px-4 py-4"
            style={{
              borderTop: "1px solid var(--color-border)",
              backgroundColor: "var(--color-glass)",
              backdropFilter: "blur(var(--blur-strength))",
              WebkitBackdropFilter: "blur(var(--blur-strength))",
            }}
          >
            {/* Current User Avatar */}
            <div className="relative flex-shrink-0">
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                src={`data:image/svg+xml;base64,${currUserImage}`}
                alt={currUserName}
                className="w-11 h-11 rounded-full cursor-pointer"
                style={{
                  boxShadow: "0 0 0 2px var(--color-primary)",
                }}
              />
              <div className="absolute bottom-0 right-0 status-online" />
            </div>

            {/* Username */}
            <div className="flex-1 min-w-0">
              <h2
                className="text-sm font-semibold truncate"
                style={{ color: "var(--color-text)" }}
              >
                {currUserName}
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--color-primary)", opacity: 0.8 }}
              >
                Online
              </p>
            </div>

            {/* Settings dot menu */}
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col gap-0.5 items-center cursor-pointer p-2"
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "var(--color-text-secondary)" }}
              />
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "var(--color-text-secondary)" }}
              />
              <span
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: "var(--color-text-secondary)" }}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Contact;

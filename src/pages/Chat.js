import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Contact from "../components/Contact";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { BiMessageSquareDots, BiGroup, BiCog } from "react-icons/bi";
import { BsChatDots, BsPeople, BsController, BsBell } from "react-icons/bs";
import { cn } from "../utils/cn";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { socketService } from "../services/socketService";
import { userApi } from "../api/userApi";

const Chat = () => {
  const currentUser = useAuthStore((s) => s.user);
  const contacts = useChatStore((s) => s.contacts);
  const setContacts = useChatStore((s) => s.setContacts);
  const contactsLoaded = useChatStore((s) => s.contactsLoaded);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const nav = useNavigate();
  const { bgClass } = useTheme();

  // Fetch contacts on mount
  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;

      if (!currentUser.isAvatarImageSet) {
        nav("/setavatar");
        return;
      }

      try {
        const users = await userApi.getAllUsers();
        setContacts(users);
        setIsLoaded(true);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
        setIsLoaded(true);
      }
    }

    fetchData();
  }, [currentUser, nav, setContacts]);

  // Socket is already connected by authStore — no need to create a new one here.
  // The socketService singleton handles the connection lifecycle.

  function handleChatChange(chat) {
    setCurrentChat(chat);
    setShowContacts(false);
  }

  const sidebarNavItems = [
    { icon: BsChatDots, label: "Chats", active: true },
    { icon: BsPeople, label: "People", active: false },
    { icon: BsController, label: "Games", active: false },
    { icon: BsBell, label: "Alerts", active: false },
  ];

  return (
    <div className={`h-screen w-screen overflow-hidden ${bgClass}`}>
      <div className="flex h-full relative z-10">
        {/* ─── Left Icon Sidebar ─── */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="
            hidden md:flex w-20 glass-dark flex-col items-center
            py-6 justify-between
          "
          style={{ borderRight: "1px solid var(--color-border)" }}
        >
          {/* Top: App Icon */}
          <div className="flex flex-col items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              className="
                w-12 h-12 rounded-2xl
                flex items-center justify-center cursor-pointer
              "
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                boxShadow: "0 0 20px var(--color-glow)",
              }}
            >
              <BiMessageSquareDots
                className="text-2xl"
                style={{ color: "var(--color-bg)" }}
              />
            </motion.div>

            {/* Nav Icons */}
            <div className="flex flex-col items-center gap-3 mt-4">
              {sidebarNavItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  title={item.label}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border-none"
                  style={{
                    backgroundColor: item.active
                      ? "var(--color-glass)"
                      : "transparent",
                    color: item.active
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                    boxShadow: item.active
                      ? "0 0 15px var(--color-glow)"
                      : "none",
                  }}
                >
                  <item.icon className="text-xl" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Bottom: Settings */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="
              w-11 h-11 rounded-xl flex items-center justify-center
              transition-all duration-300 cursor-pointer border-none bg-transparent
            "
            style={{ color: "var(--color-text-secondary)" }}
            title="Settings"
          >
            <BiCog className="text-xl" />
          </motion.button>
        </motion.div>

        {/* ─── Mobile Top Bar ─── */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            className="md:hidden flex items-center justify-between px-4 py-3 glass-dark"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                  boxShadow: "0 0 14px var(--color-glow)",
                }}
              >
                <BiMessageSquareDots
                  className="text-lg"
                  style={{ color: "var(--color-bg)" }}
                />
              </div>
              <h2
                className="text-lg font-bold gradient-text"
                style={{ fontFamily: "var(--font-primary)" }}
              >
                Ping
              </h2>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowContacts(!showContacts)}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer border-none"
              style={{
                backgroundColor: showContacts
                  ? "var(--color-glass)"
                  : "transparent",
                color: showContacts
                  ? "var(--color-primary)"
                  : "var(--color-text-secondary)",
              }}
            >
              <BsPeople className="text-xl" />
            </motion.button>
          </div>

          {/* ─── Main Content Area ─── */}
          <div className="flex flex-1 min-h-0 relative">
            {/* ─── Contacts Panel (desktop: always visible, mobile: toggle) ─── */}
            <AnimatePresence>
              {(showContacts || typeof window !== "undefined") && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className={cn(
                    "glass-dark flex-shrink-0 overflow-hidden",
                    "hidden md:flex md:w-[28%] lg:w-[22%] xl:w-[20%]",
                    showContacts &&
                      "!flex absolute inset-0 z-30 w-full md:relative md:w-[28%]",
                  )}
                  style={{ borderRight: "1px solid var(--color-border)" }}
                >
                  <Contact
                    contacts={contacts}
                    currentUser={currentUser}
                    chatChange={handleChatChange}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Chat / Welcome Area ─── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 120,
                damping: 14,
              }}
              className="flex-1 flex flex-col min-w-0"
            >
              <AnimatePresence mode="wait">
                {isLoaded && currentChat === undefined ? (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex"
                  >
                    <Welcome currUser={currentUser} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: "spring", stiffness: 150, damping: 18 }}
                    className="flex-1 flex min-h-0"
                  >
                    <ChatContainer
                      currChat={currentChat}
                      currUser={currentUser}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ─── Right Sidebar: Activity Feed (desktop only) ─── */}
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 120,
                damping: 16,
              }}
              className="
                hidden lg:flex w-72 xl:w-80 glass-dark
                flex-col overflow-hidden
              "
              style={{ borderLeft: "1px solid var(--color-border)" }}
            >
              {/* Activity Header */}
              <div
                className="px-6 py-5"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <h3
                  className="text-lg font-semibold"
                  style={{
                    color: "var(--color-text)",
                    fontFamily: "var(--font-primary)",
                  }}
                >
                  Activity
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Recent updates
                </p>
              </div>

              {/* ─── Theme Switcher ─── */}
              <div
                className="px-4 py-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <ThemeSwitcher />
              </div>

              {/* Online Users */}
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <h4
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Online Now
                </h4>
                <div className="flex flex-wrap gap-2">
                  {contacts.slice(0, 6).map((contact, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.08 }}
                      whileHover={{ scale: 1.15, y: -2 }}
                      className="relative group cursor-pointer"
                      onClick={() => handleChatChange(contact)}
                    >
                      <img
                        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                        alt={contact.username}
                        className="w-10 h-10 rounded-full transition-all"
                        style={{ boxShadow: "0 0 0 2px var(--color-border)" }}
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 status-online" />

                      {/* Tooltip */}
                      <div
                        className="
                          absolute -top-8 left-1/2 -translate-x-1/2
                          text-xs px-2 py-1 rounded-lg
                          opacity-0 group-hover:opacity-100 transition-opacity
                          whitespace-nowrap pointer-events-none backdrop-blur-sm
                        "
                        style={{
                          backgroundColor: "var(--color-glass)",
                          color: "var(--color-text)",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {contact.username}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <h4
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Quick Actions
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    { icon: BiGroup, label: "Create Group" },
                    { icon: BsController, label: "Start Game" },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ x: 4, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="
                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-300
                        cursor-pointer border-none text-left w-full
                      "
                      style={{
                        backgroundColor: "var(--color-glass)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      <action.icon
                        className="text-lg"
                        style={{ color: "var(--color-primary)" }}
                      />
                      <span className="text-sm">{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin">
                <h4
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Recent
                </h4>
                {contacts.length === 0 ? (
                  <p
                    className="text-sm text-center py-8"
                    style={{
                      color: "var(--color-text-secondary)",
                      opacity: 0.5,
                    }}
                  >
                    No recent activity
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {contacts.slice(0, 5).map((contact, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.08 }}
                        whileHover={{ x: 4 }}
                        onClick={() => handleChatChange(contact)}
                        className="
                          flex items-center gap-3 p-2 rounded-xl
                          cursor-pointer transition-all duration-300 spring-transition
                        "
                      >
                        <img
                          src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                          alt={contact.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm truncate"
                            style={{ color: "var(--color-text)" }}
                          >
                            {contact.username}
                          </p>
                          <p
                            className="text-xs"
                            style={{
                              color: "var(--color-text-secondary)",
                              opacity: 0.6,
                            }}
                          >
                            Active recently
                          </p>
                        </div>
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: "var(--color-primary)",
                            opacity: 0.6,
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

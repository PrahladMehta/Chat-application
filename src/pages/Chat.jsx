import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Contact from "../components/Contact";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import ThemeSwitcher from "../components/ThemeSwitcher";

import { BiMessageSquareDots, BiCog } from "react-icons/bi";
import { BsChatDots, BsPeople, BsController, BsBell } from "react-icons/bs";

import { cn } from "../utils/cn";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { userApi } from "../api/userApi";

/* -------------------- CONSTANTS -------------------- */

const SIDEBAR_NAV = [
  { icon: BsChatDots, label: "Chats", active: true },
  { icon: BsPeople, label: "People", active: false },
  { icon: BsController, label: "Games", active: false },
  { icon: BsBell, label: "Alerts", active: false },
];

/* -------------------- ANIMATIONS -------------------- */

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 220, damping: 22 },
  },
};

const chatVariants = {
  initial: { opacity: 0, x: 60, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 24 },
  },
  exit: { opacity: 0, x: -40, filter: "blur(4px)", transition: { duration: 0.18 } },
};

const welcomeVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
};

/* -------------------- MAGNETIC BUTTON -------------------- */

const MagneticButton = React.memo(({ children, className, style, onClick }) => {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 300, damping: 18 });
  const springY = useSpring(y, { stiffness: 300, damping: 18 });

  const handleMouseMove = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  }, []);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, []);

  return (
    <motion.button
      ref={ref}
      style={{ ...style, x: springX, y: springY }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
});

/* -------------------- ORBIT AVATAR -------------------- */

const OrbitAvatar = React.memo(({ contact, onClick }) => (
  <motion.div
    className="relative cursor-pointer"
    onClick={() => onClick(contact)}
    whileHover="hovered"
    initial="rest"
  >
    <motion.div
      variants={{
        rest: { scale: 1, rotate: 0 },
        hovered: {
          scale: 1.18,
          rotate: [0, -8, 8, -4, 0],
          transition: { rotate: { duration: 0.4 } },
        },
      }}
    >
      <img
        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
        alt={contact.username}
        className="w-10 h-10 rounded-full"
      />
    </motion.div>

    <motion.div
      variants={{
        rest: { opacity: 0, scale: 0.8 },
        hovered: { opacity: 1, scale: 1.35 },
      }}
      className="absolute inset-[-3px] rounded-full pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
        zIndex: -1,
      }}
    />
  </motion.div>
));

/* -------------------- CURSOR BLOB -------------------- */

const CursorBlob = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const blobX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const blobY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <motion.div
      style={{
        position: "fixed",
        left: blobX,
        top: blobY,
        width: 340,
        height: 340,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(var(--color-primary-rgb, 99,102,241),0.10) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
};

/* ===================== MAIN COMPONENT ===================== */

const Chat = () => {
  const navigate = useNavigate();
  const { bgClass } = useTheme();

  const currentUser = useAuthStore((s) => s.user);
  const contacts = useChatStore((s) => s.contacts);
  const setContacts = useChatStore((s) => s.setContacts);

  const [currentChat, setCurrentChat] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const onlineContacts = useMemo(() => contacts.slice(0, 6), [contacts]);
  const recentContacts = useMemo(() => contacts.slice(0, 5), [contacts]);

  useEffect(() => {
    if (!currentUser) return;

    if (!currentUser.isAvatarImageSet) {
      navigate("/setavatar");
      return;
    }

    const fetchUsers = async () => {
      try {
        const users = await userApi.getAllUsers();
        setContacts(users);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchUsers();
  }, [currentUser, navigate, setContacts]);

  const handleChatChange = useCallback((chat) => {
    setCurrentChat(chat);
    setShowContacts(false);
  }, []);

  return (
    <div className={`h-screen w-screen overflow-hidden ${bgClass}`}>
      <CursorBlob />

      <div className="flex h-full relative z-10">

        {/* SIDEBAR */}

        <div
          className="hidden md:flex w-20 glass-dark flex-col items-center py-6 justify-between"
          style={{ borderRight: "1px solid var(--color-border)" }}
        >
          <div className="flex flex-col items-center gap-6">

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              }}
            >
              <BiMessageSquareDots className="text-2xl" />
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3"
            >
              {SIDEBAR_NAV.map((item) => (
                <motion.div key={item.label} variants={staggerItem}>
                  <MagneticButton
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: item.active
                        ? "var(--color-glass)"
                        : "transparent",
                    }}
                  >
                    <item.icon className="text-xl" />
                  </MagneticButton>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <MagneticButton className="w-11 h-11 rounded-xl flex items-center justify-center">
            <BiCog className="text-xl" />
          </MagneticButton>
        </div>

        {/* MAIN */}

        <div className="flex flex-col flex-1 min-w-0">

          {/* MOBILE HEADER */}

          <div className="md:hidden flex items-center justify-between px-4 py-3 glass-dark">
            <h2 className="text-lg font-bold">Ping</h2>

            <MagneticButton
              onClick={() => setShowContacts((p) => !p)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
            >
              <BsPeople className="text-xl" />
            </MagneticButton>
          </div>

          <div className="flex flex-1 min-h-0">

            {/* CONTACTS */}

            <div className="hidden md:flex md:w-[28%] glass-dark">
              <Contact
                contacts={contacts}
                currentUser={currentUser}
                chatChange={handleChatChange}
              />
            </div>

            {/* CHAT AREA */}

            <div className="flex-1 flex min-h-0">
              <AnimatePresence mode="wait">

                {isLoaded && !currentChat ? (
                  <motion.div
                    key="welcome"
                    variants={welcomeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex-1 flex"
                  >
                    <Welcome currUser={currentUser} />
                  </motion.div>
                ) : (
                  <motion.div
                    key={currentChat?._id || "chat"}
                    variants={chatVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex-1 flex"
                  >
                    <ChatContainer
                      currChat={currentChat}
                      currUser={currentUser}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* RIGHT PANEL */}

            <div className="hidden lg:flex w-72 glass-dark flex-col">
              <div className="px-6 py-5 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold">Activity</h3>
              </div>

              <div className="px-4 py-4 border-b border-[var(--color-border)]">
                <ThemeSwitcher />
              </div>

              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h4 className="text-sm font-semibold mb-3">Online Now</h4>

                <div className="flex flex-wrap gap-2">
                  {onlineContacts.map((contact) => (
                    <OrbitAvatar
                      key={contact._id}
                      contact={contact}
                      onClick={handleChatChange}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-3">Recent</h4>

                <div className="flex flex-col gap-1">
                  {recentContacts.map((contact) => (
                    <div
                      key={contact._id}
                      onClick={() => handleChatChange(contact)}
                      className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/5"
                    >
                      <img
                        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm">{contact.username}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
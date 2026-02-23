import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
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
import { userApi } from "../api/userApi";

/* ─── Magnetic Button ───────────────────────────────────────────────────────
   Cursor pulls each sidebar icon toward itself within a proximity radius.
   Gives a sticky, physical feel — nothing else in most chat apps does this. */
const MagneticButton = ({ children, className, style, onClick }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 18 });
  const springY = useSpring(y, { stiffness: 300, damping: 18 });

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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
};

/* ─── Ripple on Click ───────────────────────────────────────────────────────
   Material-style ripple that radiates from exact cursor position on contact rows. */
const RippleContact = ({ contact, onClick }) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rip) => rip.id !== id)), 600);
    onClick(contact);
  };

  return (
    <motion.div
      layout
      onClick={handleClick}
      className="relative flex items-center gap-3 p-2 rounded-xl cursor-pointer overflow-hidden"
      whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
      style={{ transition: "background 0.2s" }}
    >
      {ripples.map((rip) => (
        <motion.span
          key={rip.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: rip.x,
            top: rip.y,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--color-primary)",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
      ))}
      <img
        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
        alt={contact.username}
        className="w-8 h-8 rounded-full"
      />
      <span className="text-sm truncate">{contact.username}</span>
    </motion.div>
  );
};

/* ─── Staggered List ─────────────────────────────────────────────────────────
   Children slide + fade in one-by-one from the bottom when the list mounts. */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 220, damping: 22 } },
};

/* ─── Avatar Orbit Hover ─────────────────────────────────────────────────────
   "Online Now" avatars orbit slightly and glow on hover. */
const OrbitAvatar = ({ contact, onClick }) => (
  <motion.div
    className="relative cursor-pointer"
    onClick={() => onClick(contact)}
    whileHover="hovered"
    initial="rest"
  >
    <motion.div
      variants={{
        rest: { scale: 1, rotate: 0 },
        hovered: { scale: 1.18, rotate: [0, -8, 8, -4, 0], transition: { rotate: { duration: 0.4 } } },
      }}
    >
      <img
        src={`data:image/svg+xml;base64,${contact.avatarImage}`}
        alt={contact.username}
        className="w-10 h-10 rounded-full"
      />
    </motion.div>
    {/* Glow ring */}
    <motion.div
      variants={{
        rest: { opacity: 0, scale: 0.8 },
        hovered: { opacity: 1, scale: 1.35, transition: { duration: 0.25 } },
      }}
      style={{
        position: "absolute",
        inset: -3,
        borderRadius: "50%",
        background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
        pointerEvents: "none",
        zIndex: -1,
      }}
    />
  </motion.div>
);

/* ─── Page-level cursor blob ─────────────────────────────────────────────────
   Soft gradient orb that lazily follows the cursor across the whole page.
   Adds depth without cluttering the UI. */
const CursorBlob = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const blobX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const blobY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const move = (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
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
        mixBlendMode: "screen",
      }}
    />
  );
};

/* ─── Chat panel transition ─────────────────────────────────────────────────
   New chat slides in from the RIGHT with a slight blur, old one exits left.
   Feels like navigating between screens on mobile. */
const chatVariants = {
  initial: { opacity: 0, x: 60, filter: "blur(6px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 200, damping: 24 } },
  exit: { opacity: 0, x: -40, filter: "blur(4px)", transition: { duration: 0.18 } },
};

const welcomeVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
};

/* ═══════════════════════════════════════════════════════════════════════════ */

const Chat = () => {
  const currentUser = useAuthStore((s) => s.user);
  const contacts = useChatStore((s) => s.contacts);
  const setContacts = useChatStore((s) => s.setContacts);

  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const nav = useNavigate();
  const { bgClass } = useTheme();

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      if (!currentUser.isAvatarImageSet) { nav("/setavatar"); return; }
      try {
        const users = await userApi.getAllUsers();
        setContacts(users);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      } finally {
        setIsLoaded(true);
      }
    }
    fetchData();
  }, [currentUser, nav, setContacts]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    setShowContacts(false);
  };

  const sidebarNavItems = [
    { icon: BsChatDots, label: "Chats", active: true },
    { icon: BsPeople, label: "People", active: false },
    { icon: BsController, label: "Games", active: false },
    { icon: BsBell, label: "Alerts", active: false },
  ];

  return (
    <div className={`h-screen w-screen overflow-hidden ${bgClass}`}>
      {/* ── Ambient cursor blob (behind everything) ── */}
      <CursorBlob />

      <div className="flex h-full relative z-10">

        {/* ── LEFT SIDEBAR ── */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.05 }}
          className="hidden md:flex w-20 glass-dark flex-col items-center py-6 justify-between"
          style={{ borderRight: "1px solid var(--color-border)" }}
        >
          {/* Logo — spins once on mount */}
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.2 }}
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))" }}
            >
              <BiMessageSquareDots className="text-2xl" style={{ color: "var(--color-bg)" }} />
            </motion.div>

            {/* Nav icons — stagger in from left */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center gap-3 mt-4"
            >
              {sidebarNavItems.map((item) => (
                <motion.div key={item.label} variants={staggerItem}>
                  <MagneticButton
                    className="w-11 h-11 rounded-xl flex items-center justify-center border-none"
                    style={{
                      backgroundColor: item.active ? "var(--color-glass)" : "transparent",
                      color: item.active ? "var(--color-primary)" : "var(--color-text-secondary)",
                    }}
                  >
                    <item.icon className="text-xl" />
                  </MagneticButton>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <MagneticButton
            className="w-11 h-11 rounded-xl flex items-center justify-center border-none"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <BiCog className="text-xl" />
          </MagneticButton>
        </motion.div>

        {/* ── MAIN AREA ── */}
        <div className="flex flex-col flex-1 min-w-0">

          {/* Mobile top bar */}
          <div
            className="md:hidden flex items-center justify-between px-4 py-3 glass-dark"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <h2 className="text-lg font-bold">Ping</h2>
            <MagneticButton
              onClick={() => setShowContacts(!showContacts)}
              className="w-10 h-10 rounded-xl flex items-center justify-center border-none"
            >
              <BsPeople className="text-xl" />
            </MagneticButton>
          </div>

          <div className="flex flex-1 min-h-0 relative">

            {/* ── CONTACTS PANEL ── */}
            <AnimatePresence>
              {(showContacts || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
                <motion.div
                  key="contacts"
                  initial={{ x: -320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -320, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 26 }}
                  className={cn(
                    "glass-dark overflow-hidden",
                    showContacts
                      ? "absolute inset-0 z-30 w-full md:relative md:w-[28%]"
                      : "hidden md:flex md:w-[28%]"
                  )}
                  style={{ borderRight: "1px solid var(--color-border)" }}
                >
                  <Contact contacts={contacts} currentUser={currentUser} chatChange={handleChatChange} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── CHAT / WELCOME ── */}
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
                    className="flex-1 flex min-h-0"
                  >
                    <ChatContainer currChat={currentChat} currUser={currentUser} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 22, delay: 0.1 }}
              className="hidden lg:flex w-72 glass-dark flex-col overflow-hidden"
              style={{ borderLeft: "1px solid var(--color-border)" }}
            >
              <div className="px-6 py-5 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-semibold">Activity</h3>
              </div>

              <div className="px-4 py-4 border-b border-[var(--color-border)]">
                <ThemeSwitcher />
              </div>

              {/* Online Now — orbit avatars */}
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h4 className="text-sm font-semibold mb-3">Online Now</h4>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-wrap gap-2"
                >
                  {contacts.slice(0, 6).map((contact) => (
                    <motion.div key={contact._id} variants={staggerItem}>
                      <OrbitAvatar contact={contact} onClick={handleChatChange} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Recent — ripple rows, staggered */}
              <div className="flex-1 px-6 py-4 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-3">Recent</h4>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-1"
                >
                  {contacts.slice(0, 5).map((contact) => (
                    <motion.div key={contact._id} variants={staggerItem}>
                      <RippleContact contact={contact} onClick={handleChatChange} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
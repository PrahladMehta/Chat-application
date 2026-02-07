import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import { sendMessageRoute, getAllMessageRoute } from "../utils/Apiroutes";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { cn } from "../utils/cn";
import { useTheme } from "../context/ThemeContext";

const ChatContainer = ({ currChat, currUser, socket }) => {
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const { theme } = useTheme();

  const getChat = async () => {
    const response = await axios.post(getAllMessageRoute, {
      from: currUser._id,
      to: currChat._id,
    });
    setMessages(response.data);
  };

  useEffect(() => {
    if (currChat) {
      getChat();
    }
  }, [currChat]);

  const handleSendMes = async (msg) => {
    await axios.post(sendMessageRoute, {
      from: currUser._id,
      to: currChat._id,
      message: msg,
    });
    socket.current.emit("send-msg", {
      from: currUser._id,
      to: currChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {currChat && (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* ─── Chat Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
              flex items-center justify-between px-4 md:px-6 py-3
              glass-dark flex-shrink-0
            "
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            {/* User Details */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <motion.img
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  src={`data:image/svg+xml;base64,${currChat.avatarImage}`}
                  alt={currChat.username}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full"
                  style={{ boxShadow: "0 0 0 2px var(--color-border)" }}
                />
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: "#4ade80",
                    borderColor: "var(--color-bg)",
                    boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
                  }}
                />
              </div>

              {/* Name & Status */}
              <div className="min-w-0">
                <h3
                  className="text-base font-semibold truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {currChat.username}
                </h3>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse-glow"
                    style={{ backgroundColor: "#4ade80" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {isTyping ? "Typing..." : "Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Logout />
            </div>
          </motion.div>

          {/* ─── Messages Area ─── */}
          <div
            className="
              flex-1 overflow-y-auto px-4 md:px-6 py-4
              space-y-3 scrollbar-thin scrollbar-theme
            "
          >
            {/* Empty State */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: "var(--color-glass)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span className="text-3xl">👋</span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Say hello to{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {currChat.username}
                  </span>
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--color-text-secondary)", opacity: 0.6 }}
                >
                  Start a conversation
                </p>
              </motion.div>
            )}

            {/* Message Bubbles */}
            <AnimatePresence initial={false}>
              {messages.map((message, idx) => {
                const isSent = message.fromSelf;
                const isLastInGroup =
                  idx === messages.length - 1 ||
                  messages[idx + 1]?.fromSelf !== message.fromSelf;
                const isNewMessage = idx === messages.length - 1;

                // Theme-specific entrance animation
                const getEntrance = () => {
                  switch (theme) {
                    case "developer":
                      return {
                        initial: { opacity: 0, x: isSent ? 50 : -50 },
                        animate: { opacity: 1, x: 0 },
                        transition: { duration: 0.15, ease: "linear" },
                      };
                    case "serious":
                      return {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { duration: 0.1 },
                      };
                    case "study":
                      return {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        transition: { duration: 1.5, ease: "easeIn" },
                      };
                    default:
                      return {
                        initial: { opacity: 0, scale: 0.85, y: 10 },
                        animate: { opacity: 1, scale: 1, y: 0 },
                        transition: {
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        },
                      };
                  }
                };

                const entrance = getEntrance();

                return (
                  <motion.div
                    key={uuidv4()}
                    ref={idx === messages.length - 1 ? scrollRef : null}
                    initial={entrance.initial}
                    animate={entrance.animate}
                    transition={entrance.transition}
                    className={cn(
                      "flex",
                      isSent ? "justify-end" : "justify-start",
                    )}
                  >
                    {/* Avatar for received messages (show only on last in group) */}
                    {!isSent && (
                      <div className="flex-shrink-0 mr-2 self-end">
                        {isLastInGroup ? (
                          <img
                            src={`data:image/svg+xml;base64,${currChat.avatarImage}`}
                            alt=""
                            className="w-7 h-7 rounded-full"
                            style={{
                              boxShadow: "0 0 0 1px var(--color-border)",
                            }}
                          />
                        ) : (
                          <div className="w-7" />
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={cn(
                        "max-w-[75%] md:max-w-[60%] lg:max-w-[50%]",
                        "px-4 py-2.5 break-words",
                        "text-sm md:text-base leading-relaxed",
                        isSent ? "chat-bubble-sent" : "chat-bubble-received",
                        theme === "developer" && isNewMessage
                          ? "new-message"
                          : "",
                      )}
                    >
                      <p className="message-text">{message.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Scroll Anchor */}
            <div ref={messages.length === 0 ? null : undefined} />
          </div>

          {/* ─── Chat Input ─── */}
          <div
            className="flex-shrink-0"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <ChatInput handleSendMes={handleSendMes} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContainer;

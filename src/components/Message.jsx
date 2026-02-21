import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { formatTime } from "../utils/helpers";

const MESSAGE_PREVIEW_LIMIT = 180;

const Message = ({
  message,
  isSent,
  showAvatar,
  avatarImage,
  timestamp,
  senderName,
  showSender = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawMessage = typeof message === "string" ? message : "";
  const isLongMessage = rawMessage.length > MESSAGE_PREVIEW_LIMIT;
  const previewMessage = isLongMessage
    ? `${rawMessage.slice(0, MESSAGE_PREVIEW_LIMIT).trimEnd()}...`
    : rawMessage;
  const displayedMessage = isExpanded ? rawMessage : previewMessage;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={cn("flex gap-2", isSent ? "justify-end" : "justify-start")}
    >
      {/* Avatar for received messages */}
      {!isSent && (
        <div className="flex-shrink-0 self-end">
          {showAvatar && avatarImage ? (
            <img
              src={`data:image/svg+xml;base64,${avatarImage}`}
              alt="avatar"
              className="w-7 h-7 rounded-full ring-1 ring-white/10"
            />
          ) : (
            <div className="w-7" />
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex flex-col max-w-[75%] md:max-w-[60%] lg:max-w-[50%]">
        {showSender && !isSent && senderName && (
          <span
            className="text-[11px] mb-1 px-1"
            style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}
          >
            {senderName}
          </span>
        )}

        <div
          className={cn(
            "w-fit px-4 py-2 rounded-2xl text-sm md:text-base leading-relaxed break-words",
            isSent ? "chat-bubble-sent" : "chat-bubble-received",
          )}
          style={{ color: "var(--color-text)" }}
        >
          <p className="whitespace-pre-wrap">{displayedMessage}</p>

          {isLongMessage && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-2 text-xs font-medium underline underline-offset-2"
              style={{ color: "var(--color-text-secondary)", opacity: 0.9 }}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={cn(
              "text-[10px] mt-1 px-1",
              isSent ? "text-right" : "text-left",
            )}
            style={{ color: "var(--color-text-secondary)", opacity: 0.7 }}
          >
            {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* Spacer for sent messages (to mirror avatar space) */}
      {isSent && <div className="w-0 flex-shrink-0" />}
    </motion.div>
  );
};

export default Message;

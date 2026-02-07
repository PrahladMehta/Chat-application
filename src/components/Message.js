import React from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { formatTime } from "../utils/helpers";

const Message = ({ message, isSent, showAvatar, avatarImage, timestamp }) => {
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
        <div
          className={cn(
            "px-4 py-2.5 break-words",
            "text-sm md:text-base text-white/90 leading-relaxed",
            isSent
              ? [
                  "bg-gradient-to-br from-electric-600/80 to-electric-500/80",
                  "border border-electric-400/30",
                  "rounded-chill rounded-br-lg",
                  "shadow-glow/30",
                ]
              : [
                  "bg-white/10",
                  "border border-white/[0.15]",
                  "rounded-chill rounded-bl-lg",
                  "backdrop-blur-[20px]",
                  "shadow-chill",
                ],
          )}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={cn(
              "text-[10px] text-white/30 mt-1 px-1",
              isSent ? "text-right" : "text-left",
            )}
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

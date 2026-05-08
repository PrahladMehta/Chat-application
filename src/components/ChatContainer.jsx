import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import Message from "./Message";
import { messageApi } from "../api/messageApi";
import { socketService } from "../services/socketService";
import { SOCKET_EVENTS, TYPING_CONFIG } from "../constants/socketEvents";
import { useAuthStore } from "../store/authStore";
import * as crypto from "../services/cryptoService";

const LOCKED_PLACEHOLDER = "[unable to decrypt]";

/**
 * Decrypt an encrypted message row from the conversation history.
 * Returns the plaintext, or LOCKED_PLACEHOLDER if decryption fails.
 *
 * For self-sent encrypted messages we use the `ciphertextForSender`
 * copy with our own publicKey as the peer key (since crypto_box was
 * called as box(plaintext, nonce, senderPubKey, senderPrivKey)).
 *
 * For received encrypted messages we use `ciphertextForRecipient` and
 * the sender's public key.
 */
function decryptHistoryRow(row, { myPrivateKey, myPublicKey, peerPublicKey }) {
  if (!row.encrypted) return row.message;
  if (!myPrivateKey) return LOCKED_PLACEHOLDER;

  const isSelf = row.fromSelf;
  const ciphertext = isSelf ? row.ciphertextForSender : row.ciphertextForRecipient;
  const peerPub = isSelf
    ? row.senderPublicKey || myPublicKey
    : row.senderPublicKey || peerPublicKey;

  if (!ciphertext || !row.nonce || !peerPub) return LOCKED_PLACEHOLDER;

  try {
    return crypto.decryptMessage({
      ciphertext,
      nonce: row.nonce,
      peerPublicKey: peerPub,
      myPrivateKey,
    });
  } catch {
    return LOCKED_PLACEHOLDER;
  }
}

const ChatContainer = ({ currChat, currUser }) => {
  const scrollRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const peerPublicKeyRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsername, setTypingUsername] = useState("");

  const privateKeyB64 = useAuthStore((s) => s.privateKeyB64);
  const myPublicKey = useAuthStore((s) => s.user?.publicKey);

  // ─────────────────────────────────────────────
  // Fetch peer public key whenever the conversation changes.
  // Cached on a ref so subsequent sends don't re-fetch.
  // ─────────────────────────────────────────────
  useEffect(() => {
    peerPublicKeyRef.current = null;

    if (!currChat?._id) return;
    let cancelled = false;

    (async () => {
      try {
        const { publicKey } = await messageApi.getPublicKey(currChat._id);
        if (!cancelled) peerPublicKeyRef.current = publicKey || null;
      } catch {
        // Peer is legacy or doesn't have a key — sends fall back to plaintext.
        if (!cancelled) peerPublicKeyRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currChat?._id]);

  // ─────────────────────────────────────────────
  // Fetch conversation
  // ─────────────────────────────────────────────
  const getChat = useCallback(async () => {
    if (!currChat || !currUser) return;

    try {
      await crypto.ready();

      const { messages: fetched } = await messageApi.getConversation(
        currUser._id,
        currChat._id
      );

      const decrypted = (fetched || []).map((row) => ({
        ...row,
        message: decryptHistoryRow(row, {
          myPrivateKey: privateKeyB64,
          myPublicKey,
          peerPublicKey: peerPublicKeyRef.current,
        }),
      }));

      setMessages(decrypted);

      messageApi.markAsRead(currChat._id, currUser._id).catch(() => { });
      socketService.emit(SOCKET_EVENTS.MESSAGE_READ, {
        fromUserId: currChat._id,
        toUserId: currUser._id,
      });
    } catch (err) {
      console.error("Failed to fetch conversation:", err);
    }
  }, [currChat, currUser, privateKeyB64, myPublicKey]);

  useEffect(() => {
    if (currChat) getChat();
  }, [currChat, getChat]);

  // ─────────────────────────────────────────────
  // Send Message — encrypt if both peers have keys, else plaintext fallback.
  // ─────────────────────────────────────────────
  const handleSendMes = async (msg) => {
    if (!currUser || !currChat) return;

    const optimisticMsg = {
      _id: Date.now().toString(),
      fromSelf: true,
      message: msg,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await crypto.ready();
      const peerPub = peerPublicKeyRef.current;
      const canEncrypt = !!(peerPub && privateKeyB64 && myPublicKey);

      if (canEncrypt) {
        const enc = crypto.encryptMessage(
          msg,
          peerPub,
          myPublicKey,
          privateKeyB64
        );
        const payload = {
          encrypted: true,
          ciphertextForRecipient: enc.ciphertextForRecipient,
          ciphertextForSender: enc.ciphertextForSender,
          nonce: enc.nonce,
          senderPublicKey: enc.senderPublicKey,
        };

        socketService.emit(SOCKET_EVENTS.MESSAGE_SEND, {
          to: currChat._id,
          ...payload,
        });

        await messageApi.sendMessage(currUser._id, currChat._id, payload);
      } else {
        socketService.emit(SOCKET_EVENTS.MESSAGE_SEND, {
          to: currChat._id,
          message: msg,
        });

        await messageApi.sendMessage(currUser._id, currChat._id, msg);
      }

      socketService.emit(SOCKET_EVENTS.TYPING_STOP, {
        to: currChat._id,
      });
    } catch (err) {
      console.error("Send failed:", err);
    }
  };

  // ─────────────────────────────────────────────
  // Receive Message
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handleReceive = (data) => {
      if (currChat && data.from === currChat._id) {
        setIsTyping(false);
        setTypingUsername("");

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        let plaintext;
        if (data.encrypted) {
          if (!privateKeyB64 || !data.senderPublicKey || !data.nonce || !data.ciphertextForRecipient) {
            plaintext = LOCKED_PLACEHOLDER;
          } else {
            try {
              plaintext = crypto.decryptMessage({
                ciphertext: data.ciphertextForRecipient,
                nonce: data.nonce,
                peerPublicKey: data.senderPublicKey,
                myPrivateKey: privateKeyB64,
              });
            } catch {
              plaintext = LOCKED_PLACEHOLDER;
            }
          }
        } else {
          plaintext = data.message;
        }

        setArrivalMessage({
          _id: data._id || Date.now().toString(),
          fromSelf: false,
          message: plaintext,
          createdAt: data.createdAt,
        });

        socketService.emit(SOCKET_EVENTS.MESSAGE_READ, {
          fromUserId: currChat._id,
          toUserId: currUser._id,
        });
      }
    };

    const unsub = socketService.on(
      SOCKET_EVENTS.MESSAGE_RECEIVE,
      handleReceive
    );

    return () => unsub();
  }, [currChat, currUser, privateKeyB64]);

  // Append arrival message (do NOT replace array)
  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  // ─────────────────────────────────────────────
  // Typing Indicators
  // ─────────────────────────────────────────────
  useEffect(() => {
    setIsTyping(false);
    setTypingUsername("");

    const handleTypingStart = ({ from, username }) => {
      if (currChat && String(from) === String(currChat._id)) {
        setIsTyping(true);
        setTypingUsername(username || currChat.username || "");

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUsername("");
          typingTimeoutRef.current = null;
        }, TYPING_CONFIG.AUTO_CLEAR_MS);
      }
    };

    const handleTypingStop = ({ from }) => {
      if (currChat && String(from) === String(currChat._id)) {
        setIsTyping(false);
        setTypingUsername("");

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    };

    const unsubTypingStart = socketService.on(
      SOCKET_EVENTS.TYPING_START,
      handleTypingStart,
    );
    const unsubTypingStop = socketService.on(
      SOCKET_EVENTS.TYPING_STOP,
      handleTypingStop,
    );

    return () => {
      unsubTypingStart();
      unsubTypingStop();

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [currChat]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <>
      {currChat && (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <img
                src={`data:image/svg+xml;base64,${currChat.avatarImage}`}
                alt={currChat.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{currChat.username}</h3>
                <span className="text-xs text-gray-400">
                  {isTyping
                    ? `${typingUsername || currChat.username} is typing...`
                    : "Online"}
                </span>
              </div>
            </div>
            <Logout />
          </div>

          {/* Messages */}
          <motion.div
            key={currChat?._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map((message, idx) => {
              const isSent = message.fromSelf;
              const messageText =
                typeof message.message === "string"
                  ? message.message
                  : message.message?.text || "";

              const previousMessage = idx > 0 ? messages[idx - 1] : null;
              const showAvatar =
                !isSent &&
                (!previousMessage || previousMessage.fromSelf !== message.fromSelf);

              return (
                <div
                  key={message._id || `${message.createdAt || "msg"}-${idx}`}
                  ref={idx === messages.length - 1 ? scrollRef : null}
                >
                  <Message
                    message={messageText}
                    isSent={isSent}
                    showAvatar={showAvatar}
                    avatarImage={currChat?.avatarImage}
                    timestamp={message.createdAt}
                  />
                </div>
              );
            })}

            {isTyping && (
              <div ref={scrollRef} className="flex justify-start">
                <div className="flex items-end gap-2">
                  <img
                    src={`data:image/svg+xml;base64,${currChat.avatarImage}`}
                    alt={currChat.username}
                    className="w-7 h-7 rounded-full"
                  />
                  <div
                    className="chat-bubble-received px-4 py-4 rounded-2xl"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--color-text-secondary)" }}
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--color-text-secondary)" }}
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--color-text-secondary)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Input */}
          <div style={{ borderTop: "1px solid var(--color-border)" }}>
            <ChatInput
              handleSendMes={handleSendMes}
              currChat={currChat}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatContainer;

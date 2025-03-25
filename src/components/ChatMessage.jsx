"use client";

import { motion } from "framer-motion";

export default function ChatMessage({ message, currentUser }) {
  const isUserMessage = currentUser?.uid === message.uid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUserMessage ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`p-3 rounded-lg max-w-xs shadow-md ${
          isUserMessage ? "bg-green-50 text-black" : "bg-gray-50 text-gray-800"
        }`}
      >
        <p className="text-xs font-semibold text-green-400 ">{message.displayName}</p>
        <p className="text-sm">{message.text}</p>
      </div>
    </motion.div>
  );
}
